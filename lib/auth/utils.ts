// lib/auth/utils.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./config";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function requireBusiness() {
  const user = await requireAuth();

  if (!user.businessId || !user.businessSlug) {
    throw new Error("Business setup required");
  }

  return user;
}

export async function requireOnboardingCompleted() {
  const user = await requireAuth();

  if (!user.onboardingCompleted) {
    throw new Error("Onboarding not completed");
  }

  return user;
}
