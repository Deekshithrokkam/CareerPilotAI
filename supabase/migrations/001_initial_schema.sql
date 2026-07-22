create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  university text,
  current_year text,
  target_role text,
  experience_level text,
  preferred_difficulty text,
  known_technologies text[] default '{}',
  weak_technologies text[] default '{}',
  daily_preparation_minutes integer default 60,
  role text default 'student',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_role text not null,
  interview_type text not null,
  topic text not null,
  difficulty text not null,
  total_questions integer not null,
  current_question_number integer default 0,
  status text not null default 'in_progress',
  processing_status text default 'waiting',
  overall_score numeric,
  performance_level text,
  technical_summary text,
  communication_summary text,
  strong_areas jsonb,
  weak_areas jsonb,
  topics_to_revise jsonb,
  next_difficulty text,
  final_message text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint interview_status_check check (status in ('in_progress', 'completed', 'failed')),
  constraint processing_status_check check (processing_status in ('waiting','generating_question','question_ready','evaluating_answer','generating_feedback','saving_result','completed','failed')),
  constraint total_questions_check check (total_questions in (3,5,10))
);

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  topic text not null,
  difficulty text not null,
  skill_tested text,
  expected_points jsonb not null,
  question_order integer not null,
  created_at timestamptz default now(),
  unique(session_id, question_order)
);

create table if not exists public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.interview_questions(id) on delete cascade,
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_answer text not null,
  score numeric not null,
  result text,
  correct_points jsonb,
  missing_points jsonb,
  incorrect_points jsonb,
  technical_feedback text,
  communication_feedback text,
  improved_answer text,
  follow_up_question text,
  recommended_topic text,
  created_at timestamptz default now(),
  unique(question_id, user_id)
);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.interview_sessions(id) on delete set null,
  plan_title text not null,
  plan_content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  attempts integer default 0,
  average_score numeric default 0,
  best_score numeric default 0,
  last_attempted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, topic)
);

create index if not exists interview_sessions_user_created_idx on public.interview_sessions(user_id, created_at desc);
create index if not exists interview_questions_session_order_idx on public.interview_questions(session_id, question_order);
create index if not exists interview_answers_session_idx on public.interview_answers(session_id);
create index if not exists study_plans_user_created_idx on public.study_plans(user_id, created_at desc);
create index if not exists progress_user_topic_idx on public.progress(user_id, topic);

alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_answers enable row level security;
alter table public.study_plans enable row level security;
alter table public.progress enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can manage own sessions" on public.interview_sessions;
create policy "Users can manage own sessions" on public.interview_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own questions" on public.interview_questions;
create policy "Users can manage own questions" on public.interview_questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own answers" on public.interview_answers;
create policy "Users can manage own answers" on public.interview_answers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own study plans" on public.study_plans;
create policy "Users can manage own study plans" on public.study_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own progress" on public.progress;
create policy "Users can manage own progress" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists sessions_set_updated_at on public.interview_sessions;
create trigger sessions_set_updated_at before update on public.interview_sessions for each row execute function public.set_updated_at();

drop trigger if exists study_plans_set_updated_at on public.study_plans;
create trigger study_plans_set_updated_at before update on public.study_plans for each row execute function public.set_updated_at();

drop trigger if exists progress_set_updated_at on public.progress;
create trigger progress_set_updated_at before update on public.progress for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.interview_sessions;
