DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'staff', 'student');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
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

CREATE OR REPLACE FUNCTION public.current_user_phone()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'phone', ''),
    (
      SELECT up.phone
      FROM public.user_profiles up
      WHERE up.user_id = auth.uid()::text
        AND up.phone IS NOT NULL
      ORDER BY up.updated_at DESC NULLS LAST, up.created_at DESC NULLS LAST
      LIMIT 1
    )
  )
$$;

DROP POLICY IF EXISTS "Authenticated users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can create own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can delete own messages" ON public.messages;

CREATE POLICY "Users can read messages linked to their phone"
ON public.messages
FOR SELECT
TO authenticated
USING (
  public.current_user_phone() IS NOT NULL
  AND (
    sender_phone = public.current_user_phone()
    OR receiver_phone = public.current_user_phone()
  )
);

CREATE POLICY "Users can create messages from their phone"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_user_phone() IS NOT NULL
  AND sender_phone = public.current_user_phone()
);

CREATE POLICY "Users can update messages from their phone"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  public.current_user_phone() IS NOT NULL
  AND sender_phone = public.current_user_phone()
)
WITH CHECK (
  public.current_user_phone() IS NOT NULL
  AND sender_phone = public.current_user_phone()
);

CREATE POLICY "Users can delete messages from their phone"
ON public.messages
FOR DELETE
TO authenticated
USING (
  public.current_user_phone() IS NOT NULL
  AND sender_phone = public.current_user_phone()
);

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "public read attendance" ON public.attendance;
DROP POLICY IF EXISTS "public insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "public update attendance" ON public.attendance;
DROP POLICY IF EXISTS "public delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can create attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can delete attendance" ON public.attendance;

CREATE POLICY "Authenticated users can view attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can create attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
  OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Staff can update attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
  OR public.has_role(auth.uid(), 'staff')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
  OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Staff can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
  OR public.has_role(auth.uid(), 'staff')
);