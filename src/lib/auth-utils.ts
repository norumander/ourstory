import { hash } from "bcryptjs";
import { prisma } from "./prisma";
import { deriveUsername } from "./utils";

const BCRYPT_COST = 10;

interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

interface RegisterResult {
  user: { id: string; email: string; displayName: string; username: string };
}

interface RegisterError {
  error: string;
  field?: string;
}

/**
 * Validate registration input fields.
 * Returns an error object if invalid, null if valid.
 */
export function validateRegistration(
  input: RegisterInput
): RegisterError | null {
  const { email, password, displayName } = input;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address", field: "email" };
  }

  if (!password || password.length < 8) {
    return {
      error: "Password must be at least 8 characters",
      field: "password",
    };
  }

  if (!displayName || displayName.trim().length < 1) {
    return { error: "Display name is required", field: "displayName" };
  }

  if (displayName.trim().length > 50) {
    return {
      error: "Display name must be 50 characters or fewer",
      field: "displayName",
    };
  }

  return null;
}

/**
 * Hash a password with bcrypt (cost factor >= 10).
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_COST);
}

/**
 * Generate a unique username from an email address.
 * Appends numeric suffix if the base username already exists.
 */
export async function generateUniqueUsername(email: string): Promise<string> {
  const base = deriveUsername(email);
  let candidate = base;
  let suffix = 2;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${suffix}`;
    suffix++;
  }

  return candidate;
}

/**
 * Register a new user. Returns the created user or an error.
 */
export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult | RegisterError> {
  const validationError = validateRegistration(input);
  if (validationError) {
    return validationError;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    return { error: "An account with this email already exists", field: "email" };
  }

  const passwordHash = await hashPassword(input.password);
  const username = await generateUniqueUsername(input.email);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName.trim(),
      username,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
    },
  };
}
