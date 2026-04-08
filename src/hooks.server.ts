import type { Handle } from "@sveltejs/kit";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../convex/_generated/api";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/health"];
const AGENT_PATHS_PREFIX = "/api/";

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // Agent API routes: validate API key
  if (path.startsWith(AGENT_PATHS_PREFIX) && !path.startsWith("/api/auth/")) {
    const authHeader = event.request.headers.get("authorization");
    const agentKey = import.meta.env.VITE_AGENT_API_KEY ?? process.env.AGENT_API_KEY;

    if (authHeader === `Bearer ${agentKey}`) {
      event.locals.user = null;
      event.locals.sessionToken = null;
      return resolve(event);
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
