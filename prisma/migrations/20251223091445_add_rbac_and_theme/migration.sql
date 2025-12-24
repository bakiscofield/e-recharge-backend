-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Role_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryColor" TEXT NOT NULL DEFAULT '#00f0ff',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ff00ff',
    "accentColor" TEXT NOT NULL DEFAULT '#00ff88',
    "backgroundColor" TEXT NOT NULL DEFAULT '#0a0a1f',
    "surfaceColor" TEXT NOT NULL DEFAULT '#1a1a3f',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textSecondary" TEXT NOT NULL DEFAULT '#a0a0ff',
    "glowIntensity" REAL NOT NULL DEFAULT 0.8,
    "animationSpeed" REAL NOT NULL DEFAULT 1.0,
    "particlesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "gradientEnabled" BOOLEAN NOT NULL DEFAULT true,
    "moneyAnimationStyle" TEXT NOT NULL DEFAULT 'rain',
    "moneyColor" TEXT NOT NULL DEFAULT '#ffd700',
    "moneyGlow" BOOLEAN NOT NULL DEFAULT true,
    "logoAnimationType" TEXT NOT NULL DEFAULT 'pulse',
    "logoGlowColor" TEXT NOT NULL DEFAULT '#00f0ff',
    "backgroundType" TEXT NOT NULL DEFAULT 'gradient',
    "backgroundImage" TEXT,
    "backgroundVideo" TEXT,
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter, system-ui',
    "fontSizeBase" INTEGER NOT NULL DEFAULT 16,
    "borderRadius" INTEGER NOT NULL DEFAULT 12,
    "borderGlow" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UIComponentConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentType" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "showForCountries" TEXT,
    "showForRoles" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "targetCountries" TEXT,
    "targetRoles" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "referralCode" TEXT,
    "referredBy" TEXT,
    "referralBalance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "country", "createdAt", "email", "firstName", "id", "isOnline", "isVerified", "lastName", "lastSeen", "password", "phone", "referralBalance", "referralCode", "referredBy", "role", "updatedAt") SELECT "avatar", "country", "createdAt", "email", "firstName", "id", "isOnline", "isVerified", "lastName", "lastSeen", "password", "phone", "referralBalance", "referralCode", "referredBy", "role", "updatedAt" FROM "User";
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

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_isSystem_idx" ON "Role"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "Permission_category_idx" ON "Permission"("category");

-- CreateIndex
CREATE INDEX "Permission_code_idx" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "ThemeConfig_isActive_idx" ON "ThemeConfig"("isActive");

-- CreateIndex
CREATE INDEX "UIComponentConfig_componentType_idx" ON "UIComponentConfig"("componentType");

-- CreateIndex
CREATE INDEX "UIComponentConfig_isVisible_idx" ON "UIComponentConfig"("isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "UIComponentConfig_componentType_key" ON "UIComponentConfig"("componentType");

-- CreateIndex
CREATE INDEX "Newsletter_publishedAt_idx" ON "Newsletter"("publishedAt");

-- CreateIndex
CREATE INDEX "Newsletter_isDraft_idx" ON "Newsletter"("isDraft");
