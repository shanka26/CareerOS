-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- pgvector is required for Career Twin semantic memory. Prisma models the
-- column as Unsupported("vector(1536)"), so extension setup remains explicit SQL.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "RemotePreference" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BASE_RESUME', 'GENERATED_RESUME', 'BASE_COVER_LETTER', 'GENERATED_COVER_LETTER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'FINAL', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('URL', 'PASTE', 'MANUAL');

-- CreateEnum
CREATE TYPE "JobWorkspaceStatus" AS ENUM ('IMPORTED', 'ANALYZED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'TAILORING', 'READY', 'APPLIED', 'RECRUITER_SCREEN', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MemorySuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "targetRole" TEXT,
    "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "remotePreference" "RemotePreference",
    "salaryExpectation" JSONB,
    "careerGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience" (
    "id" TEXT NOT NULL,
    "careerProfileId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "careerProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_skill" (
    "careerProfileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" TEXT,
    "confidence" DOUBLE PRECISION,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_skill_pkey" PRIMARY KEY ("careerProfileId","skillId")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "metric" TEXT,
    "description" TEXT NOT NULL,
    "quantified" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" TEXT NOT NULL,
    "careerProfileId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT,
    "field" TEXT,
    "graduationDate" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification" (
    "id" TEXT NOT NULL,
    "careerProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "markdown" TEXT,
    "html" TEXT,
    "pdfPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_version" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "promptVersion" TEXT,
    "knowledgeSnapshotId" TEXT,
    "markdown" TEXT NOT NULL,
    "html" TEXT,
    "pdfPath" TEXT,
    "changeExplanation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "website" TEXT,
    "mission" TEXT,
    "values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_posting" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "companyId" TEXT,
    "source" "JobSource" NOT NULL,
    "url" TEXT,
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT,
    "description" TEXT NOT NULL,
    "parsedRequirements" JSONB,
    "analysis" JSONB,
    "matchScore" INTEGER,
    "salary" JSONB,
    "status" "JobWorkspaceStatus" NOT NULL DEFAULT 'IMPORTED',
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeDocumentId" TEXT,
    "coverLetterDocumentId" TEXT,
    "resumeVersionId" TEXT,
    "coverLetterVersionId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "appliedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_event" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_suggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "proposedFact" JSONB NOT NULL,
    "status" "MemorySuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_snapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "inputSnapshotId" TEXT,
    "outputDocumentId" TEXT,
    "durationMs" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_embedding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_metric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "interviews" INTEGER NOT NULL DEFAULT 0,
    "offers" INTEGER NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interviewRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "offerRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_metric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "career_profile_userId_key" ON "career_profile"("userId");

-- CreateIndex
CREATE INDEX "experience_careerProfileId_idx" ON "experience"("careerProfileId");

-- CreateIndex
CREATE INDEX "project_careerProfileId_idx" ON "project"("careerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_category_key" ON "skill"("name", "category");

-- CreateIndex
CREATE INDEX "career_skill_skillId_idx" ON "career_skill"("skillId");

-- CreateIndex
CREATE INDEX "achievement_experienceId_idx" ON "achievement"("experienceId");

-- CreateIndex
CREATE INDEX "education_careerProfileId_idx" ON "education"("careerProfileId");

-- CreateIndex
CREATE INDEX "certification_careerProfileId_idx" ON "certification"("careerProfileId");

-- CreateIndex
CREATE INDEX "document_ownerId_type_createdAt_idx" ON "document"("ownerId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "document_version_knowledgeSnapshotId_idx" ON "document_version"("knowledgeSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "document_version_documentId_version_key" ON "document_version"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "document_version_documentId_id_key" ON "document_version"("documentId", "id");

-- CreateIndex
CREATE INDEX "company_ownerId_idx" ON "company"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "company_ownerId_name_key" ON "company"("ownerId", "name");

-- CreateIndex
CREATE INDEX "job_posting_ownerId_importedAt_idx" ON "job_posting"("ownerId", "importedAt");

-- CreateIndex
CREATE INDEX "job_posting_companyId_idx" ON "job_posting"("companyId");

-- CreateIndex
CREATE INDEX "application_userId_status_idx" ON "application"("userId", "status");

-- CreateIndex
CREATE INDEX "application_jobId_idx" ON "application"("jobId");

-- CreateIndex
CREATE INDEX "application_resumeDocumentId_idx" ON "application"("resumeDocumentId");

-- CreateIndex
CREATE INDEX "application_coverLetterDocumentId_idx" ON "application"("coverLetterDocumentId");

-- CreateIndex
CREATE INDEX "application_resumeVersionId_idx" ON "application"("resumeVersionId");

-- CreateIndex
CREATE INDEX "application_coverLetterVersionId_idx" ON "application"("coverLetterVersionId");

-- CreateIndex
CREATE INDEX "timeline_event_applicationId_occurredAt_idx" ON "timeline_event"("applicationId", "occurredAt");

-- CreateIndex
CREATE INDEX "memory_suggestion_userId_status_createdAt_idx" ON "memory_suggestion"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "knowledge_snapshot_userId_createdAt_idx" ON "knowledge_snapshot"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_snapshot_userId_checksum_key" ON "knowledge_snapshot"("userId", "checksum");

-- CreateIndex
CREATE INDEX "generation_log_userId_action_createdAt_idx" ON "generation_log"("userId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "generation_log_inputSnapshotId_idx" ON "generation_log"("inputSnapshotId");

-- CreateIndex
CREATE INDEX "generation_log_outputDocumentId_idx" ON "generation_log"("outputDocumentId");

-- CreateIndex
CREATE INDEX "knowledge_embedding_userId_idx" ON "knowledge_embedding"("userId");

-- CreateIndex
CREATE INDEX "knowledge_embedding_snapshotId_idx" ON "knowledge_embedding"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "career_metric_userId_key" ON "career_metric"("userId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_profile" ADD CONSTRAINT "career_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_careerProfileId_fkey" FOREIGN KEY ("careerProfileId") REFERENCES "career_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_careerProfileId_fkey" FOREIGN KEY ("careerProfileId") REFERENCES "career_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_skill" ADD CONSTRAINT "career_skill_careerProfileId_fkey" FOREIGN KEY ("careerProfileId") REFERENCES "career_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_skill" ADD CONSTRAINT "career_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_careerProfileId_fkey" FOREIGN KEY ("careerProfileId") REFERENCES "career_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification" ADD CONSTRAINT "certification_careerProfileId_fkey" FOREIGN KEY ("careerProfileId") REFERENCES "career_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_knowledgeSnapshotId_fkey" FOREIGN KEY ("knowledgeSnapshotId") REFERENCES "knowledge_snapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_resumeDocumentId_resumeVersionId_fkey" FOREIGN KEY ("resumeDocumentId", "resumeVersionId") REFERENCES "document_version"("documentId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_coverLetterDocumentId_coverLetterVersionId_fkey" FOREIGN KEY ("coverLetterDocumentId", "coverLetterVersionId") REFERENCES "document_version"("documentId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_event" ADD CONSTRAINT "timeline_event_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_suggestion" ADD CONSTRAINT "memory_suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_snapshot" ADD CONSTRAINT "knowledge_snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_log" ADD CONSTRAINT "generation_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_log" ADD CONSTRAINT "generation_log_inputSnapshotId_fkey" FOREIGN KEY ("inputSnapshotId") REFERENCES "knowledge_snapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_log" ADD CONSTRAINT "generation_log_outputDocumentId_fkey" FOREIGN KEY ("outputDocumentId") REFERENCES "document_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_embedding" ADD CONSTRAINT "knowledge_embedding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_embedding" ADD CONSTRAINT "knowledge_embedding_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "knowledge_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_metric" ADD CONSTRAINT "career_metric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
