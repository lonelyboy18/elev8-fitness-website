import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Precomputed once so failed-lookup paths still pay a real bcrypt.compare cost,
// preventing timing-based user enumeration without hashing on every request.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing-safety", SALT_ROUNDS);

export async function verifyPasswordAgainstDummy(plain: string): Promise<boolean> {
  await bcrypt.compare(plain, DUMMY_HASH);
  return false;
}
