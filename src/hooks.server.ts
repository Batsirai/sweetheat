import type { Handle } from "@sveltejs/kit";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../convex/_generated/api";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/health"];
const AGENT_PATHS_PREFIX = "/api/";
const AGENT_KEY = "sc_agent_2026_kX9mPqR7vN3jL5wT8yF1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // Handle CORS preflight for API routes
  if (event.request.method === "OPTIONS" && path.startsWith(AGENT_PATHS_PREFIX)) {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Agent API routes: validate API key
  if (path.startsWith(AGENT_PATHS_PREFIX) && !path.startsWith("/api/auth")) {
    const authHeader = event.request.headers.get("authorization");

    if (authHeader === `Bearer ${AGENT_KEY}`) {
      event.locals.user = null;
      event.locals.sessionToken = null;
      const response = await resolve(event);
      // Add CORS headers to agent API responses
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }
  }

  // Check session cookie
  const sessionToken = event.cookies.get("session");
  event.locals.sessionToken = sessionToken ?? null;
  event.locals.user = null;

  if (sessionToken) {
    try {
      const client = getConvexClient();
      const user = await client.query(api.auth.validateSession, {
        token: sessionToken,
      });
      event.locals.user = user;
    } catch {
      // Invalid session, clear cookie
      event.cookies.delete("session", { path: "/" });
    }
  }

  // Redirect to login if not authenticated on protected routes
  if (!event.locals.user && !PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return new Response(null, {
      status: 302,
      headers: { location: "/login" },
    });
  }

  return resolve(event);
};
