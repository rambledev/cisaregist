-- CreateTable
CREATE TABLE "public"."cisa_registrations" (
    "id" TEXT NOT NULL,
    "sequence" SERIAL NOT NULL,
    "firstNameTh" TEXT NOT NULL,
    "lastNameTh" TEXT NOT NULL,
    "firstNameEn" TEXT NOT NULL,
    "lastNameEn" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "academicPosition" TEXT NOT NULL,
    "administrativePosition" TEXT,
    "accessRights" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cisa_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cisa_registrations_sequence_key" ON "public"."cisa_registrations"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "cisa_registrations_nationalId_key" ON "public"."cisa_registrations"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "cisa_registrations_email_key" ON "public"."cisa_registrations"("email");
