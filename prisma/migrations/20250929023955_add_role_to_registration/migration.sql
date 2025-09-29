/*
  Warnings:

  - Added the required column `role` to the `cisa_registrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."cisa_registrations" ADD COLUMN     "role" TEXT NOT NULL;
