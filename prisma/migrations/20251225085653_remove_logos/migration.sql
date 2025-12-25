-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bookmaker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "countries" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Bookmaker" ("countries", "createdAt", "id", "isActive", "logo", "name", "order", "updatedAt") SELECT "countries", "createdAt", "id", "isActive", "logo", "name", "order", "updatedAt" FROM "Bookmaker";
DROP TABLE "Bookmaker";
ALTER TABLE "new_Bookmaker" RENAME TO "Bookmaker";
CREATE INDEX "Bookmaker_isActive_idx" ON "Bookmaker"("isActive");
CREATE TABLE "new_PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "countries" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ussdTemplate" TEXT,
    "instructions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PaymentMethod" ("countries", "createdAt", "id", "instructions", "isActive", "logo", "name", "order", "type", "updatedAt", "ussdTemplate") SELECT "countries", "createdAt", "id", "instructions", "isActive", "logo", "name", "order", "type", "updatedAt", "ussdTemplate" FROM "PaymentMethod";
DROP TABLE "PaymentMethod";
ALTER TABLE "new_PaymentMethod" RENAME TO "PaymentMethod";
CREATE INDEX "PaymentMethod_type_idx" ON "PaymentMethod"("type");
CREATE INDEX "PaymentMethod_isActive_idx" ON "PaymentMethod"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
