export type Profile = {
  id: string;
  full_name: string;
  email?: string;
  university?: string;
  current_year?: string;
  target_role?: string;
  experience_level?: string;
  preferred_difficulty?: string;
  known_technologies?: string[];
  weak_technologies?: string[];
  daily_preparation_minutes?: number;
  onboarding_completed?: boolean;
};

export type Session = {
  id: string;
  user_id: string;
  target_role: string;
  interview_type: string;
  topic: string;
  difficulty: string;
  total_questions: number;
  current_question_number: number;
  status: "in_progress" | "completed" | "failed";
  processing_status: string;
  overall_score?: number;
  performance_level?: string;
  technical_summary?: string;
  communication_summary?: string;
  strong_areas?: string[];
  weak_areas?: string[];
  topics_to_revise?: string[];
  next_difficulty?: string;
  final_message?: string;
  created_at: string;
  completed_at?: string;
};

export type Question = {
  id: string;
  session_id: string;
  question: string;
  topic: string;
  difficulty: string;
  skill_tested?: string;
  question_order: number;
};

export type Answer = {
  id: string;
  question_id: string;
  score: number;
  result: string;
  correct_points: string[];
  missing_points: string[];
  incorrect_points: string[];
  technical_feedback: string;
  communication_feedback: string;
  improved_answer: string;
  follow_up_question?: string;
  recommended_topic?: string;
  student_answer: string;
};

export type StudyPlan = {
  id: string;
  plan_title: string;
  plan_content: {
    plan_title: string;
    days: Array<{
      day: number;
      topic: string;
      objective: string;
      learning_activity: string;
      practice_activity: string;
      duration_minutes: number;
    }>;
  };
  created_at: string;
};
