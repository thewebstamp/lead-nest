/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth/config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { generateSlug } from "@/lib/utils/string";

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
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
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
    // Add signIn callback for Google users
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          // Check if user already exists
          const existingUser = await queryOne<{ id: string }>(
            "SELECT id FROM users WHERE email = $1",
            [user.email]
          );

          if (!existingUser) {
            // Create new user with Google data
            const userId = uuidv4();
            const businessId = uuidv4();
            const relationId = uuidv4();

            // Create user
            await query(
              `INSERT INTO users (id, email, name, email_verified, created_at)
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [
                userId,
                user.email,
                user.name || profile?.name || "Google User",
                true, // Google emails are verified
              ]
            );

            // Generate business slug
            const businessName = `${user.name || "My"}'s Business`;
            const baseSlug = generateSlug(businessName);
            let slug = baseSlug;
            let counter = 1;

            // Ensure slug is unique
            while (true) {
              const existingBusiness = await queryOne(
                "SELECT id FROM businesses WHERE slug = $1",
                [slug]
              );

              if (!existingBusiness) break;
              slug = `${baseSlug}-${counter}`;
              counter++;
            }

            // Create business
            await query(
              `INSERT INTO businesses (id, name, slug, email, service_types, onboarding_step, onboarding_completed, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
              [
                businessId,
                businessName,
                slug,
                user.email,
                [], // Empty services array
                1, // First onboarding step
                false, // Not completed
              ]
            );

            // Create user-business relation
            await query(
              `INSERT INTO user_business_relations (id, user_id, business_id, role, is_default, created_at)
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [relationId, userId, businessId, "owner", true]
            );

            // Update user object with new ID for JWT callback
            user.id = userId;
          }
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user && account) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;

        // For Google sign-in, we need to fetch business info
        if (account.provider === "google") {
          // Fetch user's business information
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
            [user.id]
          );

          if (businessRelation) {
            token.onboardingCompleted = businessRelation.onboarding_completed;
            token.businessId = businessRelation.business_id;
            token.businessSlug = businessRelation.slug;
            token.role = businessRelation.role;
          } else {
            token.onboardingCompleted = false;
          }
        } else {
          // For credentials, use data from authorize callback
          token.onboardingCompleted = (user as any).onboardingCompleted;
          token.businessId = (user as any).businessId;
          token.businessSlug = (user as any).businessSlug;
          token.role = (user as any).role;
        }
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
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.businessId = token.businessId as string;
        session.user.businessSlug = token.businessSlug as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    // Add redirect callback
    async redirect({ url, baseUrl }) {
      // Always redirect to onboarding for Google sign-ins (they'll be new users)
      // For existing users, they'll be redirected to dashboard by middleware
      return `${baseUrl}/onboarding`;
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