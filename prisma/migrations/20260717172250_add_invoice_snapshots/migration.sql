/*
  Warnings:

  - A unique constraint covering the columns `[companyId,name]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyerAddress` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerCity` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerName` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerNip` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerPostal` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerAddress` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerCity` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerName` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerNip` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerPostal` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Service_userId_name_key";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "buyerAddress" TEXT NOT NULL,
ADD COLUMN     "buyerCity" TEXT NOT NULL,
ADD COLUMN     "buyerName" TEXT NOT NULL,
ADD COLUMN     "buyerNip" TEXT NOT NULL,
ADD COLUMN     "buyerPostal" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
ADD COLUMN     "sellerAddress" TEXT NOT NULL,
ADD COLUMN     "sellerBankAccount" TEXT,
ADD COLUMN     "sellerCity" TEXT NOT NULL,
ADD COLUMN     "sellerName" TEXT NOT NULL,
ADD COLUMN     "sellerNip" TEXT NOT NULL,
ADD COLUMN     "sellerPostal" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "companyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Service_companyId_idx" ON "Service"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_companyId_name_key" ON "Service"("companyId", "name");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
