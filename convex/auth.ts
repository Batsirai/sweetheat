import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import bcrypt from "bcryptjs";
import { api } from "./_generated/api";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const register = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.runQuery(api.auth.getUserByEmail, {
      email: args.email,
    });
    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(args.password, 10);
    const userId = await ctx.runMutation(api.auth.createUser, {
      email: args.email,
      passwordHash,
      name: args.name,
    });

    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    await ctx.runMutation(api.auth.createSession, {
      userId,
      token,
      expiresAt,
    });

    return { token, userId };
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.getUserByEmail, {
      email: args.email,
    });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const valid = await bcrypt.compare(args.password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    await ctx.runMutation(api.auth.createSession, {
      userId: user._id,
      token,
      expiresAt,
    });

    return { token, userId: user._id };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const resetPassword = action({
  args: { email: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.getUserByEmail, { email: args.email });
    if (!user) throw new Error("User not found");
    const passwordHash = await bcrypt.hash(args.newPassword, 10);
    await ctx.runMutation(api.auth.updatePassword, { userId: user._id, passwordHash });
    return { success: true };
  },
});

export const updatePassword = mutation({
  args: { userId: v.id("users"), passwordHash: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordHash: args.passwordHash });
  },
});

// Internal helpers
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      name: args.name,
      role: "admin",
      createdAt: Date.now(),
    });
  },
});

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
