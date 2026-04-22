
-- messages: add timestamp + audio_url
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
UPDATE public.messages SET timestamp = created_at WHERE timestamp IS NULL;

-- leave_applications: add legacy field names
ALTER TABLE public.leave_applications ADD COLUMN IF NOT EXISTS student_class TEXT;
ALTER TABLE public.leave_applications ADD COLUMN IF NOT EXISTS student_division TEXT;
ALTER TABLE public.leave_applications ADD COLUMN IF NOT EXISTS student_dob TEXT;
ALTER TABLE public.leave_applications ADD COLUMN IF NOT EXISTS number_of_days INT DEFAULT 1;
ALTER TABLE public.leave_applications ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.leave_applications ADD COLUMN IF NOT EXISTS return_date DATE;
ALTER TABLE public.leave_applications ADD COLUMN IF NOT EXISTS end_date DATE;
-- backfill
UPDATE public.leave_applications SET student_class = COALESCE(student_class, class),
  student_division = COALESCE(student_division, division),
  start_date = COALESCE(start_date, from_date),
  end_date = COALESCE(end_date, to_date),
  return_date = COALESCE(return_date, to_date)
WHERE student_class IS NULL OR start_date IS NULL;

-- notifications: add legacy fields
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_user_phone TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS role TEXT;

-- club_applications: add class/division
ALTER TABLE public.club_applications ADD COLUMN IF NOT EXISTS student_class TEXT;
ALTER TABLE public.club_applications ADD COLUMN IF NOT EXISTS student_division TEXT;

-- user_profiles: make user_id optional (was NOT NULL)
ALTER TABLE public.user_profiles ALTER COLUMN user_id DROP NOT NULL;

-- chat_messages (legacy LiveChatPage table)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_phone TEXT,
  sender_image TEXT,
  message TEXT,
  file_url TEXT,
  message_type TEXT DEFAULT 'text',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public update chat_messages" ON public.chat_messages FOR UPDATE USING (true);
CREATE POLICY "public delete chat_messages" ON public.chat_messages FOR DELETE USING (true);
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- chat_participants (used by ChatApp)
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT,
  user_id TEXT,
  user_name TEXT,
  user_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read chat_participants" ON public.chat_participants FOR SELECT USING (true);
CREATE POLICY "public insert chat_participants" ON public.chat_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "public update chat_participants" ON public.chat_participants FOR UPDATE USING (true);
CREATE POLICY "public delete chat_participants" ON public.chat_participants FOR DELETE USING (true);
