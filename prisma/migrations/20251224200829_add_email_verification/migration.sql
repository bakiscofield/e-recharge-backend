-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationCode" TEXT,
    "emailVerificationCodeExpiresAt" DATETIME,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "referralBalance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "country", "createdAt", "email", "firstName", "id", "isActive", "isOnline", "isSuperAdmin", "isVerified", "lastName", "lastSeen", "password", "phone", "referralBalance", "referralCode", "referredBy", "role", "updatedAt") SELECT "avatar", "country", "createdAt", "email", "firstName", "id", "isActive", "isOnline", "isSuperAdmin", "isVerified", "lastName", "lastSeen", "password", "phone", "referralBalance", "referralCode", "referredBy", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isOnline_idx" ON "User"("isOnline");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "User_isSuperAdmin_idx" ON "User"("isSuperAdmin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
