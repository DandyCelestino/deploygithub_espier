
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

CREATE POLICY "Authenticated can insert logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
