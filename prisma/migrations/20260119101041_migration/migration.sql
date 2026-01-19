-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "documentUrls" TEXT[],
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;
