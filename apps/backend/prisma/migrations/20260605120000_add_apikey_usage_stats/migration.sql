-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN "last_used_at" TIMESTAMP(3);
ALTER TABLE "api_keys" ADD COLUMN "total_requests" INTEGER NOT NULL DEFAULT 0;
