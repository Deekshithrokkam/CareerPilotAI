import { z } from "zod";

export const roles = ["Frontend Developer", "Backend Developer", "Full-Stack Developer"] as const;
export const interviewTypes = ["Technical", "HR", "Mixed"] as const;
export const difficulties = ["Easy", "Medium", "Hard"] as const;

export const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  university: z.string().max(120).optional().nullable(),
  current_year: z.string().max(50).optional().nullable(),
  target_role: z.enum(roles).optional().nullable(),
  experience_level: z.string().max(80).optional().nullable(),
  preferred_difficulty: z.enum(difficulties).optional().nullable(),
  known_technologies: z.array(z.string().min(1).max(40)).max(20).default([]),
  weak_technologies: z.array(z.string().min(1).max(40)).max(20).default([]),
  daily_preparation_minutes: z.number().int().min(15).max(240).default(60),
  onboarding_completed: z.boolean().default(true)
});

export const interviewSetupSchema = z.object({
  target_role: z.enum(roles),
  interview_type: z.enum(interviewTypes),
  topic: z.string().min(2).max(80),
  difficulty: z.enum(difficulties),
  total_questions: z.union([z.literal(3), z.literal(5), z.literal(10)])
});

export const answerSchema = z.object({
  question_id: z.string().uuid(),
  student_answer: z.string().min(5).max(4000)
});

export const questionResponseSchema = z.object({
  question: z.string().min(10),
  topic: z.string().min(2),
  difficulty: z.enum(difficulties),
  skill_tested: z.string().min(2),
  expected_points: z.array(z.string().min(2)).min(2).max(8)
});

export const evaluationResponseSchema = z.object({
  score: z.number().min(0).max(10),
  result: z.string().min(2),
  correct_points: z.array(z.string()).default([]),
  missing_points: z.array(z.string()).default([]),
  incorrect_points: z.array(z.string()).default([]),
  technical_feedback: z.string().min(2),
  communication_feedback: z.string().min(2),
  improved_answer: z.string().min(2),
  follow_up_question: z.string().optional().nullable(),
  recommended_topic: z.string().min(2)
});

export const finalReportResponseSchema = z.object({
  overall_score: z.number().min(0).max(100),
  performance_level: z.string().min(2),
  strong_areas: z.array(z.string()).default([]),
  weak_areas: z.array(z.string()).default([]),
  technical_summary: z.string().min(2),
  communication_summary: z.string().min(2),
  topics_to_revise: z.array(z.string()).length(3),
  next_difficulty: z.enum(difficulties),
  final_message: z.string().min(2)
});

export const studyPlanResponseSchema = z.object({
  plan_title: z.string().min(2),
  days: z.array(z.object({
    day: z.number().int().min(1).max(7),
    topic: z.string().min(2),
    objective: z.string().min(2),
    learning_activity: z.string().min(2),
    practice_activity: z.string().min(2),
    duration_minutes: z.number().int().min(15).max(240)
  })).length(7)
});
