-- CreateTable
CREATE TABLE "assures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "isWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "telephone" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "dateNaissance" DATETIME,
    "datePermis" DATETIME,
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "insurers" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "insurers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InsuranceOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insurerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coverageLevel" TEXT NOT NULL,
    "monthlyPrice" REAL NOT NULL,
    "annualPrice" REAL NOT NULL,
    "franchise" REAL NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InsuranceOffer_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "insurers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfferFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerId" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "featureValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OfferFeature_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "InsuranceOffer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "assureId" TEXT,
    "quoteReference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "contactMethod" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT NOT NULL,
    "dateNaissance" DATETIME,
    "datePermis" DATETIME,
    "antecedentsSinistres" BOOLEAN,
    "nombreSinistres" INTEGER,
    "typeSinistres" TEXT,
    "usagePrincipal" TEXT,
    "kilometrageAnnuel" TEXT,
    "energie" TEXT,
    "puissanceFiscale" TEXT,
    "nombrePlaces" TEXT,
    "dateMiseCirculation" DATETIME,
    "valeurNeuve" REAL,
    "valeurVenale" REAL,
    "usageVehicule" TEXT,
    "typeCouverture" TEXT,
    "dateEffet" DATETIME,
    "dureeContrat" INTEGER,
    "options" TEXT,
    "niveauFranchise" TEXT,
    "preferenceContact" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quote_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "assures" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "priceAtQuote" REAL NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteOffer_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuoteOffer_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "InsuranceOffer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insurerId" TEXT NOT NULL,
    "coverageLevel" TEXT NOT NULL,
    "basePrice" REAL NOT NULL,
    "ageFactor" REAL NOT NULL DEFAULT 1.0,
    "vehicleAgeFactor" REAL NOT NULL DEFAULT 1.0,
    "powerFactor" REAL NOT NULL DEFAULT 1.0,
    "franchiseFactor" REAL NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "assures_email_key" ON "assures"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_telephone_key" ON "users"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_userId_key" ON "insurers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_email_key" ON "insurers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_nomEntreprise_key" ON "insurers"("nomEntreprise");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_numeroRegistre_key" ON "insurers"("numeroRegistre");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_numeroAgrement_key" ON "insurers"("numeroAgrement");

-- CreateIndex
CREATE INDEX "InsuranceOffer_insurerId_idx" ON "InsuranceOffer"("insurerId");

-- CreateIndex
CREATE INDEX "InsuranceOffer_coverageLevel_idx" ON "InsuranceOffer"("coverageLevel");

-- CreateIndex
CREATE INDEX "InsuranceOffer_monthlyPrice_idx" ON "InsuranceOffer"("monthlyPrice");

-- CreateIndex
CREATE INDEX "OfferFeature_offerId_idx" ON "OfferFeature"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferFeature_offerId_featureName_key" ON "OfferFeature"("offerId", "featureName");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteReference_key" ON "Quote"("quoteReference");

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");

-- CreateIndex
CREATE INDEX "Quote_assureId_idx" ON "Quote"("assureId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- CreateIndex
CREATE INDEX "QuoteOffer_quoteId_idx" ON "QuoteOffer"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteOffer_offerId_idx" ON "QuoteOffer"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteOffer_quoteId_offerId_key" ON "QuoteOffer"("quoteId", "offerId");

-- CreateIndex
CREATE INDEX "UserAnalytics_userId_idx" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE INDEX "UserAnalytics_eventType_idx" ON "UserAnalytics"("eventType");

-- CreateIndex
CREATE INDEX "UserAnalytics_createdAt_idx" ON "UserAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "PricingConfig_insurerId_coverageLevel_idx" ON "PricingConfig"("insurerId", "coverageLevel");

-- CreateIndex
CREATE INDEX "PricingConfig_isActive_idx" ON "PricingConfig"("isActive");

-- CreateIndex
CREATE INDEX "PricingConfig_validFrom_validTo_idx" ON "PricingConfig"("validFrom", "validTo");

