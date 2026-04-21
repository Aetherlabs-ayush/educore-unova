
-- Helper function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- public_profiles (students)
CREATE TABLE public.public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT,
  division TEXT,
  dob TEXT,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read public_profiles" ON public.public_profiles FOR SELECT USING (true);
CREATE POLICY "public insert public_profiles" ON public.public_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "public update public_profiles" ON public.public_profiles FOR UPDATE USING (true);
CREATE POLICY "public delete public_profiles" ON public.public_profiles FOR DELETE USING (true);
CREATE TRIGGER trg_public_profiles_updated BEFORE UPDATE ON public.public_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_profiles (online presence)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "public insert user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "public update user_profiles" ON public.user_profiles FOR UPDATE USING (true);
CREATE POLICY "public delete user_profiles" ON public.user_profiles FOR DELETE USING (true);
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- teachers
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  email TEXT,
  image TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "public insert teachers" ON public.teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "public update teachers" ON public.teachers FOR UPDATE USING (true);
CREATE POLICY "public delete teachers" ON public.teachers FOR DELETE USING (true);
CREATE TRIGGER trg_teachers_updated BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- timetable
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class TEXT,
  division TEXT,
  day TEXT NOT NULL,
  period INT NOT NULL DEFAULT 1,
  subject TEXT NOT NULL,
  teacher TEXT,
  start_time TEXT,
  end_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read timetable" ON public.timetable FOR SELECT USING (true);
CREATE POLICY "public insert timetable" ON public.timetable FOR INSERT WITH CHECK (true);
CREATE POLICY "public update timetable" ON public.timetable FOR UPDATE USING (true);
CREATE POLICY "public delete timetable" ON public.timetable FOR DELETE USING (true);

-- attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_phone TEXT NOT NULL,
  student_name TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present',
  class TEXT,
  division TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "public insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "public update attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "public delete attendance" ON public.attendance FOR DELETE USING (true);

-- leave_applications
CREATE TABLE public.leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_phone TEXT NOT NULL,
  student_name TEXT,
  class TEXT,
  division TEXT,
  reason TEXT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read leave" ON public.leave_applications FOR SELECT USING (true);
CREATE POLICY "public insert leave" ON public.leave_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "public update leave" ON public.leave_applications FOR UPDATE USING (true);
CREATE POLICY "public delete leave" ON public.leave_applications FOR DELETE USING (true);
CREATE TRIGGER trg_leave_updated BEFORE UPDATE ON public.leave_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  target_role TEXT,
  target_phone TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "public update notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "public delete notifications" ON public.notifications FOR DELETE USING (true);

-- messages (global / room chat)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_phone TEXT NOT NULL,
  sender_name TEXT,
  receiver_phone TEXT,
  text TEXT NOT NULL,
  room TEXT DEFAULT 'global',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public update messages" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "public delete messages" ON public.messages FOR DELETE USING (true);

-- teacher_messages (DMs)
CREATE TABLE public.teacher_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_phone TEXT NOT NULL,
  sender_name TEXT,
  receiver_phone TEXT NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tmsg" ON public.teacher_messages FOR SELECT USING (true);
CREATE POLICY "public insert tmsg" ON public.teacher_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public update tmsg" ON public.teacher_messages FOR UPDATE USING (true);
CREATE POLICY "public delete tmsg" ON public.teacher_messages FOR DELETE USING (true);

-- test_scores
CREATE TABLE public.test_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_phone TEXT NOT NULL,
  student_name TEXT,
  class TEXT,
  division TEXT,
  subject TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 100,
  exam_name TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read scores" ON public.test_scores FOR SELECT USING (true);
CREATE POLICY "public insert scores" ON public.test_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "public update scores" ON public.test_scores FOR UPDATE USING (true);
CREATE POLICY "public delete scores" ON public.test_scores FOR DELETE USING (true);

-- homework_status
CREATE TABLE public.homework_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_phone TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homework_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read hw" ON public.homework_status FOR SELECT USING (true);
CREATE POLICY "public insert hw" ON public.homework_status FOR INSERT WITH CHECK (true);
CREATE POLICY "public update hw" ON public.homework_status FOR UPDATE USING (true);
CREATE POLICY "public delete hw" ON public.homework_status FOR DELETE USING (true);
CREATE TRIGGER trg_hw_updated BEFORE UPDATE ON public.homework_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- clubs
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read clubs" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "public insert clubs" ON public.clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "public update clubs" ON public.clubs FOR UPDATE USING (true);
CREATE POLICY "public delete clubs" ON public.clubs FOR DELETE USING (true);

-- club_applications
CREATE TABLE public.club_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID,
  club_name TEXT,
  student_phone TEXT NOT NULL,
  student_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.club_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read capps" ON public.club_applications FOR SELECT USING (true);
CREATE POLICY "public insert capps" ON public.club_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "public update capps" ON public.club_applications FOR UPDATE USING (true);
CREATE POLICY "public delete capps" ON public.club_applications FOR DELETE USING (true);

-- club_chat_messages
CREATE TABLE public.club_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID,
  sender_phone TEXT NOT NULL,
  sender_name TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.club_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read cchat" ON public.club_chat_messages FOR SELECT USING (true);
CREATE POLICY "public insert cchat" ON public.club_chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public update cchat" ON public.club_chat_messages FOR UPDATE USING (true);
CREATE POLICY "public delete cchat" ON public.club_chat_messages FOR DELETE USING (true);

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.teacher_messages REPLICA IDENTITY FULL;
ALTER TABLE public.club_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
