-- Créer la table pour stocker les secrets 2FA
CREATE TABLE IF NOT EXISTS "user_2fa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "enabled_at" TIMESTAMPTZ,
    "last_used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT "user_2fa_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_2fa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_2fa_user_id_unique" UNIQUE ("user_id")
);

-- Créer des index pour de meilleures performances
CREATE INDEX IF NOT EXISTS "user_2fa_user_id_idx" ON "user_2fa"("user_id");
CREATE INDEX IF NOT EXISTS "user_2fa_is_enabled_idx" ON "user_2fa"("is_enabled");
CREATE INDEX IF NOT EXISTS "user_2fa_enabled_at_idx" ON "user_2fa"("enabled_at");

-- Créer une fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_user_2fa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour la mise à jour automatique de updated_at
CREATE TRIGGER update_user_2fa_updated_at_trigger
BEFORE UPDATE ON "user_2fa"
FOR EACH ROW
EXECUTE FUNCTION update_user_2fa_updated_at();

-- Créer une vue pour les utilisateurs avec 2FA activé
CREATE OR REPLACE VIEW "users_with_2fa" AS
SELECT 
    u.id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    u2fa.secret,
    u2fa.is_enabled,
    u2fa.enabled_at,
    u2fa.last_used_at,
    u2fa.backup_codes,
    u2fa.created_at as two_fa_created_at
FROM "users" u
LEFT JOIN "user_2fa" u2fa ON u.id = u2fa.user_id
WHERE u2fa.is_enabled = true;

-- Commentaires pour la documentation
COMMENT ON TABLE "user_2fa" IS 'Stocke les informations d''authentification à deux facteurs (2FA) pour les utilisateurs';
COMMENT ON COLUMN "user_2fa"."secret" IS 'Secret TOTP chiffré pour la génération des codes 2FA';
COMMENT ON COLUMN "user_2fa"."backup_codes" IS 'Codes de secours pour l''accès en cas de perte de l''app 2FA';
COMMENT ON COLUMN "user_2fa"."is_enabled" IS 'Indique si le 2FA est activé pour cet utilisateur';
COMMENT ON COLUMN "user_2fa"."enabled_at" IS 'Date et heure d''activation du 2FA';
COMMENT ON COLUMN "user_2fa"."last_used_at" IS 'Date et heure de la dernière utilisation du 2FA';
