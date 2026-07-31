/**
 * Seeds premade customer accounts.
 *
 * Runs as the one-off `seed-users` service in compose after `migrate` has
 * applied the schema. Credentials come from the environment (backend/.env via
 * env_file) — no password is hardcoded — and passwords are argon2-hashed
 * exactly as registration hashes them, so the accounts log in through the
 * normal auth path.
 *
 * Idempotent: an email that already exists is left untouched, so the service is
 * safe to re-run on every up.
 */
import argon2 from 'argon2';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';

const SEED_USERS = [
  {
    name: process.env.USER1_NAME || 'Test User One',
    email: (process.env.USER1_EMAIL || 'user1@trailwear.local').toLowerCase(),
    password: process.env.USER1_PASSWORD || '',
  },
  {
    name: process.env.USER2_NAME || 'Test User Two',
    email: (process.env.USER2_EMAIL || 'user2@trailwear.local').toLowerCase(),
    password: process.env.USER2_PASSWORD || '',
  },
];

async function seedUsers(): Promise<void> {
  for (const user of SEED_USERS) {
    if (!user.password) {
      throw new Error(`Password must be set to seed user ${user.email}`);
    }
  }

  for (const user of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      console.log(`User ${user.email} already exists, skipping`);
      continue;
    }

    const password = await argon2.hash(user.password);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password,
        role: Role.CUSTOMER,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`Seeded user ${user.email}`);
  }
}

seedUsers()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('User seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
