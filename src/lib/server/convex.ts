import { ConvexHttpClient } from "convex/browser";
import { PUBLIC_CONVEX_URL } from "$env/static/public";

export function getConvexClient() {
  return new ConvexHttpClient(PUBLIC_CONVEX_URL);
}
