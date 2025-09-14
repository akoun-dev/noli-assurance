-- Vérifier si les tables NextAuth existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'accounts', 'sessions', 'verification_tokens')
ORDER BY table_name;
