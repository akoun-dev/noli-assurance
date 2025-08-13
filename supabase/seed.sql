-- Seed data for NOLI Assurance Demo

-- Clear existing data (optional, use with caution in production)
TRUNCATE TABLE "QuoteOffer", "Quote", "InsuranceOffer", "insurers", "assures", "users" RESTART IDENTITY CASCADE;

-- Insert users (1 admin, 6 insurers, 3 regular users)
INSERT INTO "public"."users" ("id", "email", "telephone", "nom", "prenom", "password", "role", "dateNaissance", "datePermis", "updatedAt") VALUES
-- Admin user
('admin_1', 'admin@noli.ci', '+2250700000001', 'Admin', 'NOLI', '$2a$12$xyz123...', 'ADMIN', '1980-01-01', '2000-01-01', NOW()),

-- Insurer users (6 real insurers)
('insurer_1', 'direction@nsia.ci', '+2250700000002', 'Kouassi', 'Amani', '$2a$12$xyz123...', 'INSURER', '1975-05-15', '1995-06-20', NOW()),
('insurer_2', 'direction@sunu.ci', '+2250700000003', 'Diallo', 'Fatou', '$2a$12$xyz123...', 'INSURER', '1978-08-25', '1998-09-30', NOW()),
('insurer_3', 'direction@allianz.ci', '+2250700000004', 'Yao', 'Koffi', '$2a$12$xyz123...', 'INSURER', '1980-03-10', '2000-04-15', NOW()),
('insurer_4', 'direction@axa.ci', '+2250700000005', 'Bamba', 'Karim', '$2a$12$xyz123...', 'INSURER', '1982-07-20', '2002-08-25', NOW()),
('insurer_5', 'direction@colina.ci', '+2250700000006', 'Touré', 'Aminata', '$2a$12$xyz123...', 'INSURER', '1976-09-12', '1996-10-18', NOW()),
('insurer_6', 'direction@saham.ci', '+2250700000007', 'Koné', 'Moussa', '$2a$12$xyz123...', 'INSURER', '1979-11-05', '1999-12-10', NOW()),

-- Regular users (3 clients)
('user_1', 'client1@noli.ci', '+2250700000008', 'Konan', 'Jean', '$2a$12$xyz123...', 'USER', '1990-03-10', '2012-04-15', NOW()),
('user_2', 'client2@noli.ci', '+2250700000009', 'Bamba', 'Aïcha', '$2a$12$xyz123...', 'USER', '1992-07-20', '2014-08-25', NOW()),
('user_3', 'client3@noli.ci', '+2250700000010', 'Soro', 'Yves', '$2a$12$xyz123...', 'USER', '1988-05-15', '2010-06-20', NOW());

-- Insert real insurers from Côte d'Ivoire
INSERT INTO "public"."insurers" ("id", "userId", "nom", "prenom", "email", "telephone", "nomEntreprise", "adresseEntreprise", "siegeSocial", "numeroRegistre", "numeroAgrement", "domaineActivite", "anneeExperience", "nombreEmployes", "siteWeb", "description", "updatedAt") VALUES
-- NSIA
('insurer_comp_1', 'insurer_1', 'Kouassi', 'Amani', 'contact@nsia.ci', '+22521212121', 'NSIA Assurances', 'Immeuble NSIA, Plateau', 'Abidjan', 'RCI123456', 'AGR123456', 'Assurance auto', '25', '300', 'https://www.nsia.ci', 'Leader du marché ivoirien depuis 1995', NOW()),

-- SUNU
('insurer_comp_2', 'insurer_2', 'Diallo', 'Fatou', 'contact@sunu.ci', '+22521212122', 'SUNU Assurances CI', 'Rue des Jardins, Cocody', 'Abidjan', 'RCI654321', 'AGR654321', 'Assurance tous risques', '15', '250', 'https://www.sunuassurances.com', 'Groupe panafricain présent dans 14 pays', NOW()),

-- Allianz
('insurer_comp_3', 'insurer_3', 'Yao', 'Koffi', 'contact@allianz.ci', '+22521212123', 'Allianz Côte d''Ivoire', 'Immeuble Alpha 2000, Marcory', 'Abidjan', 'RCI789012', 'AGR789012', 'Assurance générale', '10', '200', 'https://www.allianz.ci', 'Filiale du groupe allemand Allianz', NOW()),

-- AXA
('insurer_comp_4', 'insurer_4', 'Bamba', 'Karim', 'contact@axa.ci', '+22521212124', 'AXA Assurances CI', 'Boulevard Latrille, Cocody', 'Abidjan', 'RCI345678', 'AGR345678', 'Assurance multirisques', '12', '220', 'https://www.axa.com.ci', 'Expert en protection des particuliers et entreprises', NOW()),

-- Colina
('insurer_comp_5', 'insurer_5', 'Touré', 'Aminata', 'contact@colina.ci', '+22521212125', 'Colina Assurances', 'Angle Bd. de Marseille et Rue Lecoeur, Plateau', 'Abidjan', 'RCI901234', 'AGR901234', 'Assurance vie et dommages', '18', '280', 'https://www.colina-ci.com', 'Spécialiste en assurances vie et prévoyance', NOW()),

-- Saham
('insurer_comp_6', 'insurer_6', 'Koné', 'Moussa', 'contact@saham.ci', '+22521212126', 'Saham Assurances CI', 'Rue du Commerce, Plateau', 'Abidjan', 'RCI567890', 'AGR567890', 'Assurance tous secteurs', '8', '180', 'https://www.sahamassurances.ci', 'Groupe marocain présent en Côte d''Ivoire', NOW());

-- Insert insurance offers for all insurers (2 offers each)
INSERT INTO "public"."InsuranceOffer" ("id", "insurerId", "name", "coverageLevel", "monthlyPrice", "annualPrice", "franchise", "description", "updatedAt") VALUES
-- NSIA offers
('offer_1', 'insurer_comp_1', 'Tous Risques Excellence', 'COMPREHENSIVE', 28000, 300000, 50000, 'Couverture haut de gamme avec assistance 24/7', NOW()),
('offer_2', 'insurer_comp_1', 'Tiers Collision Plus', 'MEDIUM', 18000, 195000, 100000, 'Couverture intermédiaire étendue', NOW()),

-- SUNU offers
('offer_3', 'insurer_comp_2', 'Tous Risques Confort', 'COMPREHENSIVE', 26000, 280000, 75000, 'Couverture complète avec options', NOW()),
('offer_4', 'insurer_comp_2', 'Tiers Simple Éco', 'BASIC', 15000, 160000, 150000, 'Formule économique de base', NOW()),

-- Allianz offers
('offer_5', 'insurer_comp_3', 'Premium Protect', 'COMPREHENSIVE', 30000, 320000, 60000, 'Protection complète Allianz', NOW()),
('offer_6', 'insurer_comp_3', 'Basic Cover', 'MEDIUM', 20000, 210000, 120000, 'Couverture standard', NOW()),

-- AXA offers
('offer_7', 'insurer_comp_4', 'AXA Tous Risques', 'COMPREHENSIVE', 27000, 290000, 55000, 'Solution complète AXA', NOW()),
('offer_8', 'insurer_comp_4', 'AXA Tiers', 'BASIC', 17000, 180000, 130000, 'Formule tiers simple', NOW()),

-- Colina offers
('offer_9', 'insurer_comp_5', 'Colina Sécurité Plus', 'COMPREHENSIVE', 25000, 270000, 65000, 'Offre complète Colina', NOW()),
('offer_10', 'insurer_comp_5', 'Colina Essentiel', 'MEDIUM', 16000, 170000, 110000, 'Formule essentielle', NOW()),

-- Saham offers
('offer_11', 'insurer_comp_6', 'Saham Protection', 'COMPREHENSIVE', 24000, 260000, 70000, 'Pack protection Saham', NOW()),
('offer_12', 'insurer_comp_6', 'Saham Basic', 'BASIC', 14000, 150000, 140000, 'Formule d''entrée de gamme', NOW());

-- Insert assures (3 clients)
INSERT INTO "public"."assures" ("id", "nom", "prenom", "email", "telephone", "isWhatsApp", "updatedAt") VALUES
('assure_1', 'Konan', 'Jean', 'jean.konan@example.ci', '+2250700000008', true, NOW()),
('assure_2', 'Bamba', 'Aïcha', 'aicha.bamba@example.ci', '+2250700000009', false, NOW()),
('assure_3', 'Soro', 'Yves', 'yves.soro@example.ci', '+2250700000010', true, NOW());

-- Insert sample quotes (3 quotes with different statuses)
INSERT INTO "public"."Quote" ("id", "userId", "assureId", "quoteReference", "status", "nom", "prenom", "telephone", "dateNaissance", "datePermis", "energie", "puissanceFiscale", "dateMiseCirculation", "valeurVenale", "updatedAt") VALUES
('quote_1', 'user_1', 'assure_1', 'DEV-2024-0001', 'pending', 'Konan', 'Jean', '+2250700000008', '1990-03-10', '2012-04-15', 'Essence', '6 CV', '2018-05-20', 4500000, NOW()),
('quote_2', 'user_2', 'assure_2', 'DEV-2024-0002', 'converted', 'Bamba', 'Aïcha', '+2250700000009', '1992-07-20', '2014-08-25', 'Diesel', '8 CV', '2020-11-15', 6500000, NOW()),
('quote_3', 'user_3', 'assure_3', 'DEV-2024-0003', 'contacted', 'Soro', 'Yves', '+2250700000010', '1988-05-15', '2010-06-20', 'Hybride', '7 CV', '2019-08-10', 5500000, NOW());

-- Insert quote offers (3 quotes x 4 offers each)
INSERT INTO "public"."QuoteOffer" ("id", "quoteId", "offerId", "priceAtQuote", "selected") VALUES
-- Offers for quote 1 (pending)
('qoffer_1', 'quote_1', 'offer_1', 28000, false),  -- NSIA Tous Risques
('qoffer_2', 'quote_1', 'offer_5', 30000, false),  -- Allianz Premium
('qoffer_3', 'quote_1', 'offer_7', 27000, false),  -- AXA Tous Risques
('qoffer_4', 'quote_1', 'offer_9', 25000, false),  -- Colina Sécurité

-- Offers for quote 2 (converted - selected NSIA)
('qoffer_5', 'quote_2', 'offer_1', 28000, true),   -- NSIA Tous Risques (selected)
('qoffer_6', 'quote_2', 'offer_3', 26000, false),  -- SUNU Confort
('qoffer_7', 'quote_2', 'offer_11', 24000, false), -- Saham Protection
('qoffer_8', 'quote_2', 'offer_5', 30000, false),  -- Allianz Premium

-- Offers for quote 3 (contacted)
('qoffer_9', 'quote_3', 'offer_3', 26000, false),  -- SUNU Confort
('qoffer_10', 'quote_3', 'offer_7', 27000, false), -- AXA Tous Risques
('qoffer_11', 'quote_3', 'offer_9', 25000, false), -- Colina Sécurité
('qoffer_12', 'quote_3', 'offer_11', 24000, false); -- Saham Protection

-- Insert pricing config
INSERT INTO "public"."PricingConfig" ("id", "insurerId", "coverageLevel", "basePrice", "validFrom", "updatedAt") VALUES
('config_1', 'insurer_comp_1', 'COMPREHENSIVE', 20000, '2024-01-01', NOW()),
('config_2', 'insurer_comp_1', 'MEDIUM', 12000, '2024-01-01', NOW()),
('config_3', 'insurer_comp_2', 'COMPREHENSIVE', 19000, '2024-01-01', NOW()),
('config_4', 'insurer_comp_2', 'BASIC', 10000, '2024-01-01', NOW());

-- Insert user analytics
INSERT INTO "public"."UserAnalytics" ("id", "userId", "eventType", "eventData") VALUES
('analytics_1', 'user_1', 'LOGIN', '{"device": "mobile", "os": "Android"}'),
('analytics_2', 'user_2', 'QUOTE_CREATED', '{"quoteId": "quote_2"}');