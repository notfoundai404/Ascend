-- Migration: Clean up old password-based auth columns from User table
-- The supabaseId column already exists from a prior manual change.
-- This migration drops the remaining legacy columns and updates the Role enum.

-- Step 1: Drop old auth columns (if they still exist)
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "isFirstLogin";
ALTER TABLE "User" DROP COLUMN IF EXISTS "refreshToken";

-- Step 2: Add COACH to the Role enum (IF NOT EXISTS guard)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COACH';

-- Step 3: Ensure unique index on supabaseId exists
CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseId_key" ON "User"("supabaseId");
