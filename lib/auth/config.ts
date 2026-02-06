// lib/auth/config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";

// Define user type for session
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    onboardingCompleted: boolean;
    businessId?: string;
    businessSlug?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      onboardingCompleted: boolean;
      businessId?: string;
      businessSlug?: string;
      role?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Find user by email using direct SQL
        const user = await queryOne<{
          id: string;
          email: string;
          name: string | null;
          password_hash: string;
        }>(
          "SELECT id, email, name, password_hash FROM users WHERE email = $1",
          [credentials.email],
        );

        if (!user) {
          throw new Error("User not found");
        }

        // Check password
        if (!user.password_hash) {
          throw new Error("Account uses OAuth. Please sign in with Google.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );

        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        // Get user's default business
        const businessRelation = await queryOne<{
          business_id: string;
          role: string;
          slug: string;
          onboarding_completed: boolean;
        }>(
          `SELECT ubr.business_id, ubr.role, b.slug, b.onboarding_completed
           FROM user_business_relations ubr
           JOIN businesses b ON ubr.business_id = b.id
           WHERE ubr.user_id = $1 AND ubr.is_default = true`,
          [user.id],
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingCompleted: businessRelation?.onboarding_completed || false,
          businessId: businessRelation?.business_id,
          businessSlug: businessRelation?.slug,
          role: businessRelation?.role || "owner",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.onboardingCompleted = user.onboardingCompleted;
        token.businessId = user.businessId;
        token.businessSlug = user.businessSlug;
        token.role = user.role;
      }

      // Update session when onboarding is completed
      if (trigger === "update" && session?.onboardingCompleted) {
        token.onboardingCompleted = session.onboardingCompleted;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.businessId = token.businessId as string;
        session.user.businessSlug = token.businessSlug as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    // signUp: "/auth/signup",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
