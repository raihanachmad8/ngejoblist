-- CreateTable
CREATE TABLE "personal_tokens" (
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_tokens_access_token_key" ON "personal_tokens"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "personal_tokens_refresh_token_key" ON "personal_tokens"("refresh_token");

-- AddForeignKey
ALTER TABLE "personal_tokens" ADD CONSTRAINT "personal_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
