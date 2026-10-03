-- CreateTable
CREATE TABLE "MessageTemplate" (
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("key","locale")
);
