-- Create app_role enum for proper role management
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Create user_roles table with proper security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add subject column to teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS subject TEXT;

-- Add role column to public_profiles to distinguish students from teachers
ALTER TABLE public.public_profiles ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'student';

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id::text = auth.uid()::text OR user_id::text IN (SELECT phone FROM public.public_profiles WHERE phone = user_id::text));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update teachers table RLS to allow role-based access
CREATE POLICY "Teachers can view all teachers"
  ON public.teachers
  FOR SELECT
  USING (true);

-- Policy for public_profiles to filter by role
CREATE POLICY "Students can view other students"
  ON public.public_profiles
  FOR SELECT
  USING (role = 'student' OR role IS NULL);