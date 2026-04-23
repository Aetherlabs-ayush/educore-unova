ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read messages" ON public.messages;
DROP POLICY IF EXISTS "public insert messages" ON public.messages;
DROP POLICY IF EXISTS "public update messages" ON public.messages;
DROP POLICY IF EXISTS "public delete messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can create own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can delete own messages" ON public.messages;

CREATE POLICY "Authenticated users can read own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = sender_phone
  OR auth.uid()::text = receiver_phone
);

CREATE POLICY "Authenticated users can create own messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = sender_phone);

CREATE POLICY "Authenticated users can update own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid()::text = sender_phone)
WITH CHECK (auth.uid()::text = sender_phone);

CREATE POLICY "Authenticated users can delete own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid()::text = sender_phone);