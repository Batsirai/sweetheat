// Morning Factory Push Script
// Uses Convex HTTP API to push seeds and drafts
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const client = new ConvexHttpClient("https://loyal-hamster-102.convex.cloud");

async function run() {
  try {
    // 1. Get brands
    const brands = await client.query(api.brands.listActive);
    console.log("Brands:", JSON.stringify(brands, null, 2));
    return brands;
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
