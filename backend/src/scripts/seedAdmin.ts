/**
 * Seeds the premade admin account.
 *
 * Runs as the one-off `seed-admin` service in compose after `migrate` has
 * applied the schema. Credentials come from the environment (backend/.env via
 * env_file) — no password is hardcoded — and the password is argon2-hashed
 * exactly as registration hashes it, so the account logs in through the normal
 * auth path.
 *
 * Idempotent: if the email already exists it is promoted to admin when needed
 * and otherwise left untouched, so the service is safe to re-run on every up.
 */
import argon2 from 'argon2';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@trailwear.local').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

async function seedAdmin(): Promise<void> {
  if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD must be set to seed the admin account');
  }

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    if (existing.role !== Role.ADMIN) {
      await prisma.user.update({ where: { id: existing.id }, data: { role: Role.ADMIN } });
      console.log(`Promoted existing user ${ADMIN_EMAIL} to admin`);
    } else {
      console.log(`Admin ${ADMIN_EMAIL} already exists, skipping`);
    }
    return;
  }

  const password = await argon2.hash(ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password,
      role: Role.ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Seeded admin ${ADMIN_EMAIL}`);
}

seedAdmin()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Admin seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
