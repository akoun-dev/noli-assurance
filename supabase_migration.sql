-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'INSURER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."assures" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "isWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "password" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "dateNaissance" TIMESTAMP(3),
    "datePermis" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insurers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "nomEntreprise" TEXT NOT NULL,
    "adresseEntreprise" TEXT NOT NULL,
    "siegeSocial" TEXT NOT NULL,
    "numeroRegistre" TEXT NOT NULL,
    "numeroAgrement" TEXT NOT NULL,
    "domaineActivite" TEXT NOT NULL,
    "anneeExperience" TEXT NOT NULL,
    "nombreEmployes" TEXT NOT NULL,
    "siteWeb" TEXT,
    "description" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InsuranceOffer" (
    "id" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coverageLevel" TEXT NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "annualPrice" DOUBLE PRECISION NOT NULL,
    "franchise" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OfferFeature" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "featureValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "assureId" TEXT,
    "quoteReference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "contactMethod" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "datePermis" TIMESTAMP(3),
    "antecedentsSinistres" BOOLEAN,
    "nombreSinistres" INTEGER,
    "typeSinistres" TEXT,
    "usagePrincipal" TEXT,
    "kilometrageAnnuel" TEXT,
    "energie" TEXT,
    "puissanceFiscale" TEXT,
    "nombrePlaces" TEXT,
    "dateMiseCirculation" TIMESTAMP(3),
    "valeurNeuve" DOUBLE PRECISION,
    "valeurVenale" DOUBLE PRECISION,
    "usageVehicule" TEXT,
    "typeCouverture" TEXT,
    "dateEffet" TIMESTAMP(3),
    "dureeContrat" INTEGER,
    "options" TEXT,
    "niveauFranchise" TEXT,
    "preferenceContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuoteOffer" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "priceAtQuote" DOUBLE PRECISION NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PricingConfig" (
    "id" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "coverageLevel" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "ageFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "vehicleAgeFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "powerFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "franchiseFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assures_email_key" ON "public"."assures"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_telephone_key" ON "public"."users"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_userId_key" ON "public"."insurers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_email_key" ON "public"."insurers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_nomEntreprise_key" ON "public"."insurers"("nomEntreprise");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_numeroRegistre_key" ON "public"."insurers"("numeroRegistre");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_numeroAgrement_key" ON "public"."insurers"("numeroAgrement");

-- CreateIndex
CREATE INDEX "InsuranceOffer_insurerId_idx" ON "public"."InsuranceOffer"("insurerId");

-- CreateIndex
CREATE INDEX "InsuranceOffer_coverageLevel_idx" ON "public"."InsuranceOffer"("coverageLevel");

-- CreateIndex
CREATE INDEX "InsuranceOffer_monthlyPrice_idx" ON "public"."InsuranceOffer"("monthlyPrice");

-- CreateIndex
CREATE INDEX "OfferFeature_offerId_idx" ON "public"."OfferFeature"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferFeature_offerId_featureName_key" ON "public"."OfferFeature"("offerId", "featureName");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteReference_key" ON "public"."Quote"("quoteReference");

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "public"."Quote"("userId");

-- CreateIndex
CREATE INDEX "Quote_assureId_idx" ON "public"."Quote"("assureId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "public"."Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "public"."Quote"("createdAt");

-- CreateIndex
CREATE INDEX "QuoteOffer_quoteId_idx" ON "public"."QuoteOffer"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteOffer_offerId_idx" ON "public"."QuoteOffer"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteOffer_quoteId_offerId_key" ON "public"."QuoteOffer"("quoteId", "offerId");

-- CreateIndex
CREATE INDEX "UserAnalytics_userId_idx" ON "public"."UserAnalytics"("userId");

-- CreateIndex
CREATE INDEX "UserAnalytics_eventType_idx" ON "public"."UserAnalytics"("eventType");

-- CreateIndex
CREATE INDEX "UserAnalytics_createdAt_idx" ON "public"."UserAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "PricingConfig_insurerId_coverageLevel_idx" ON "public"."PricingConfig"("insurerId", "coverageLevel");

-- CreateIndex
CREATE INDEX "PricingConfig_isActive_idx" ON "public"."PricingConfig"("isActive");

-- CreateIndex
CREATE INDEX "PricingConfig_validFrom_validTo_idx" ON "public"."PricingConfig"("validFrom", "validTo");

-- AddForeignKey
ALTER TABLE "public"."insurers" ADD CONSTRAINT "insurers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InsuranceOffer" ADD CONSTRAINT "InsuranceOffer_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "public"."insurers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfferFeature" ADD CONSTRAINT "OfferFeature_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."InsuranceOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "public"."assures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteOffer" ADD CONSTRAINT "QuoteOffer_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteOffer" ADD CONSTRAINT "QuoteOffer_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."InsuranceOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAnalytics" ADD CONSTRAINT "UserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

