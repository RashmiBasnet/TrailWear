-- Reset any stale KHALTI orders to COD so the enum can be re-typed safely.
UPDATE "Order" SET "paymentMethod" = 'COD' WHERE "paymentMethod" = 'KHALTI';

-- AlterEnum: rename the KHALTI value to ESEWA
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('COD', 'ESEWA');
ALTER TABLE "public"."Order" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET DEFAULT 'COD';
COMMIT;

-- AlterTable: replace Khalti reference column with eSewa reference column
ALTER TABLE "Order" DROP COLUMN "khaltiPidx",
ADD COLUMN     "esewaRefId" TEXT;
