-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hubspotOwnerId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'rep',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "quoteName" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "sponsorAcronym" TEXT,
    "hubspotDealId" TEXT,
    "hubspotDealName" TEXT,
    "preparedById" TEXT NOT NULL,
    "quoteDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalCost" DECIMAL(65,30),
    "specimenTypes" TEXT[],
    "isExtension" BOOLEAN NOT NULL DEFAULT false,
    "formData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostLogEntry" (
    "id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalComparable" (
    "id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "indication" TEXT NOT NULL,
    "type" TEXT,
    "unit" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "addedBy" TEXT,

    CONSTRAINT "HistoricalComparable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreshTissueRate" (
    "tumorType" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreshTissueRate_pkey" PRIMARY KEY ("tumorType")
);

-- CreateTable
CREATE TABLE "QuoteCode" (
    "clientNameLower" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteCode_pkey" PRIMARY KEY ("clientNameLower")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
