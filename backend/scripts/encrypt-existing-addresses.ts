/**
 * One-off backfill: encrypts `line1`, `line2` and `zip` on address rows that
 * were written before those fields were encrypted at rest.
 *
 * Read paths decrypt strictly — a plaintext row left behind would throw on the
 * profile and order-history endpoints — so this has to run once against any
 * database that already holds addresses. It is safe to re-run: rows already in
 * ciphertext form are skipped.
 *
 *   npm run encrypt:addresses
 */
import { prisma } from '../src/config/db';
import { encrypt, isEncrypted } from '../src/utils/crypto';

async function main() {
  const addresses = await prisma.address.findMany();

  let encrypted = 0;
  let skipped = 0;

  for (const address of addresses) {
    // A row is either fully migrated or not at all; line1 is non-null on every
    // row, so it is the reliable one to test.
    if (isEncrypted(address.line1)) {
      skipped += 1;
      continue;
    }

    await prisma.address.update({
      where: { id: address.id },
      data: {
        line1: encrypt(address.line1),
        line2: address.line2 === null ? null : encrypt(address.line2),
        zip: encrypt(address.zip),
      },
    });

    encrypted += 1;
  }

  console.log(
    `Addresses: ${encrypted} encrypted, ${skipped} already encrypted, ${addresses.length} total.`
  );
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
