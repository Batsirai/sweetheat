import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = await request.json();
  const { action, email, password, name } = body;
  const client = getConvexClient();

  try {
    if (action === "register") {
      const result = await client.action(api.auth.register, {
        email,
        password,
        name: name || email.split("@")[0],
      });
      cookies.set("session", result.token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 24 * 60 * 60,
      });
      return json({ success: true });
    }

    if (action === "login") {
      const result = await client.action(api.auth.login, { email, password });
      cookies.set("session", result.token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 24 * 60 * 60,
      });
      return json({ success: true });
    }

    if (action === "logout") {
      const sessionToken = cookies.get("session");
      if (sessionToken) {
        await client.mutation(api.auth.logout, { token: sessionToken });
        cookies.delete("session", { path: "/" });
      }
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Auth failed";
    return json({ error: message }, { status: 401 });
  }
};
