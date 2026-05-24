
-- Reverter os-fotos para bucket público (URLs diretas continuam funcionando no portal do cliente)
UPDATE storage.buckets SET public = true WHERE id = 'os-fotos';

-- Remover a policy de SELECT que permitia listar os objetos (mantém URL direta funcionando, mas impede enumeração)
DROP POLICY IF EXISTS "Roles can view os-fotos" ON storage.objects;
