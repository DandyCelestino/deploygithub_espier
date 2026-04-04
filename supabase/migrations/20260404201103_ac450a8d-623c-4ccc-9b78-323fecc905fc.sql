INSERT INTO public.user_roles (user_id, role)
VALUES ('fad6cfdc-3f2d-458a-836f-6f4afadf768c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;