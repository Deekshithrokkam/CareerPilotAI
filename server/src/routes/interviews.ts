import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { generateFinalReport, generateQuestion, evaluateAnswer } from "../services/gemini.js";
import { getProfile, updateStatus } from "../utils/db.js";
import { answerSchema, interviewSetupSchema } from "../validation/schemas.js";

export const interviewsRouter = Router();
interviewsRouter.use(requireAuth);

async function loadOwnedSession(id: string, userId: string) {
  const { data, error } = await supabaseAdmin.from("interview_sessions").select("*").eq("id", id).eq("user_id", userId).single();
  if (error) return null;
  return data;
}

async function updateProgress(userId: string, topic: string, score: number) {
  const { data: existing } = await supabaseAdmin.from("progress").select("*").eq("user_id", userId).eq("topic", topic).single();
  const attempts = Number(existing?.attempts ?? 0) + 1;
  const previousAverage = Number(existing?.average_score ?? 0);
  const average_score = Math.round(((previousAverage * (attempts - 1) + score) / attempts) * 10) / 10;
  await supabaseAdmin.from("progress").upsert({
    id: existing?.id,
    user_id: userId,
    topic,
    attempts,
    average_score,
    best_score: Math.max(Number(existing?.best_score ?? 0), score),
    last_attempted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

interviewsRouter.post("/start", validateBody(interviewSetupSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabaseAdmin
      .from("interview_sessions")
      .insert({ ...req.body, user_id: userId, processing_status: "waiting" })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ session: data });
  } catch (error) {
    next(error);
  }
});

interviewsRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("*, interview_answers(score)")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ sessions: data });
  } catch (error) {
    next(error);
  }
});

interviewsRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const session = await loadOwnedSession(req.params.id, userId);
    if (!session) return res.status(404).json({ error: "Interview not found." });

    const [{ data: questions }, { data: answers }] = await Promise.all([
      supabaseAdmin.from("interview_questions").select("id,session_id,user_id,question,topic,difficulty,skill_tested,question_order,created_at").eq("session_id", session.id).eq("user_id", userId).order("question_order"),
      supabaseAdmin.from("interview_answers").select("*").eq("session_id", session.id).eq("user_id", userId).order("created_at")
    ]);

    res.json({ session, questions: questions ?? [], answers: answers ?? [] });
  } catch (error) {
    next(error);
  }
});

interviewsRouter.post("/:id/question", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const session = await loadOwnedSession(req.params.id, userId);
    if (!session) return res.status(404).json({ error: "Interview not found." });
    if (session.status === "completed") return res.status(409).json({ error: "This interview is already complete." });

    const { data: previous } = await supabaseAdmin.from("interview_questions").select("question").eq("session_id", session.id).eq("user_id", userId);
    if ((previous?.length ?? 0) >= session.total_questions) {
      return res.status(409).json({ error: "All questions have already been generated." });
    }

    await updateStatus(session.id, userId, "generating_question");
    const profile = await getProfile(userId);
    const result = await generateQuestion({
      target_role: session.target_role,
      interview_type: session.interview_type,
      topic: session.topic,
      difficulty: session.difficulty,
      experience_level: profile?.experience_level,
      previous_questions: previous?.map((item) => item.question) ?? [],
      weak_areas: profile?.weak_technologies ?? []
    });

    const order = (previous?.length ?? 0) + 1;
    const { data: question, error } = await supabaseAdmin
      .from("interview_questions")
      .insert({
        session_id: session.id,
        user_id: userId,
        question: result.question,
        topic: result.topic,
        difficulty: result.difficulty,
        skill_tested: result.skill_tested,
        expected_points: result.expected_points,
        question_order: order
      })
      .select("id,session_id,user_id,question,topic,difficulty,skill_tested,question_order,created_at")
      .single();
    if (error) throw error;

    await supabaseAdmin.from("interview_sessions").update({
      current_question_number: order,
      processing_status: "question_ready",
      updated_at: new Date().toISOString()
    }).eq("id", session.id).eq("user_id", userId);

    res.status(201).json({ question });
  } catch (error) {
    await updateStatus(req.params.id, req.user!.id, "failed").catch(() => undefined);
    next(error);
  }
});

interviewsRouter.post("/:id/answer", validateBody(answerSchema), async (req, res, next) => {
  const sessionId = String(req.params.id);
  try {
    const userId = req.user!.id;
    const session = await loadOwnedSession(sessionId, userId);
    if (!session) return res.status(404).json({ error: "Interview not found." });
    if (session.status === "completed") return res.status(409).json({ error: "This interview is already complete." });

    const { data: question, error: qError } = await supabaseAdmin
      .from("interview_questions")
      .select("*")
      .eq("id", req.body.question_id)
      .eq("session_id", session.id)
      .eq("user_id", userId)
      .single();
    if (qError || !question) return res.status(404).json({ error: "Question not found." });

    const { data: existingAnswer } = await supabaseAdmin
      .from("interview_answers")
      .select("id")
      .eq("question_id", question.id)
      .eq("user_id", userId)
      .single();
    if (existingAnswer) return res.status(409).json({ error: "This answer was already submitted." });

    await updateStatus(session.id, userId, "evaluating_answer");
    const profile = await getProfile(userId);
    const evaluation = await evaluateAnswer({
      question: question.question,
      expected_points: question.expected_points,
      student_answer: req.body.student_answer,
      experience_level: profile?.experience_level
    });

    await updateStatus(session.id, userId, "saving_result");
    const { data: answer, error } = await supabaseAdmin
      .from("interview_answers")
      .insert({
        question_id: question.id,
        session_id: session.id,
        user_id: userId,
        student_answer: req.body.student_answer,
        ...evaluation
      })
      .select()
      .single();
    if (error) throw error;

    await updateProgress(userId, question.topic, evaluation.score);
    await updateStatus(session.id, userId, "question_ready");
    res.status(201).json({ answer });
  } catch (error) {
    await updateStatus(sessionId, req.user!.id, "failed").catch(() => undefined);
    next(error);
  }
});

interviewsRouter.post("/:id/complete", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const session = await loadOwnedSession(req.params.id, userId);
    if (!session) return res.status(404).json({ error: "Interview not found." });

    const { data: answers, error } = await supabaseAdmin
      .from("interview_answers")
      .select("*, interview_questions(question, topic, difficulty)")
      .eq("session_id", session.id)
      .eq("user_id", userId);
    if (error) throw error;
    if ((answers?.length ?? 0) < session.total_questions) {
      return res.status(409).json({ error: "Answer all questions before completing the interview." });
    }

    await updateStatus(session.id, userId, "generating_feedback");
    const report = await generateFinalReport({
      target_role: session.target_role,
      interview_type: session.interview_type,
      difficulty: session.difficulty,
      interview_results: answers
    });

    const { data: completed, error: updateError } = await supabaseAdmin
      .from("interview_sessions")
      .update({
        ...report,
        status: "completed",
        processing_status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", session.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (updateError) throw updateError;
    res.json({ session: completed });
  } catch (error) {
    await updateStatus(req.params.id, req.user!.id, "failed").catch(() => undefined);
    next(error);
  }
});
