/**
 * Morning Factory Batch Import — June 10, 2026
 *
 * Run from project root with Node 22+:
 *   node morning-factory/2026-06-10/import.mjs
 *
 * Requires BRAND_ID env var (get from Convex dashboard or npx convex run brands:listActive):
 *   BRAND_ID="your_brand_id_here" node morning-factory/2026-06-10/import.mjs
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONVEX_URL = process.env.PUBLIC_CONVEX_URL || "https://loyal-hamster-102.convex.cloud";
const BRAND_ID = process.env.BRAND_ID;

if (!BRAND_ID) {
  console.error("Error: BRAND_ID env var required.");
  console.error("Run: npx convex run brands:listActive — then copy the _id field.");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const seeds = JSON.parse(
  readFileSync(join(__dirname, "seeds.json"), "utf8")
);

const articleBody = readFileSync(
  join(__dirname, "article-fathers-day.md"),
  "utf8"
);

const socialBody = readFileSync(
  join(__dirname, "social-copy.md"),
  "utf8"
);

async function run() {
  console.log(`\nAlreadyLoved Morning Factory — June 10, 2026`);
  console.log(`Brand: ${BRAND_ID}\n`);

  // Phase 1: Create seeds
  const createdSeedIds = [];
  for (const seed of seeds) {
    try {
      const id = await client.mutation(api.seeds.create, {
        brandId: BRAND_ID,
        ...seed,
      });
      createdSeedIds.push({ id, title: seed.title });
      console.log(`✓ Seed: ${seed.title.slice(0, 60)}...`);
    } catch (err) {
      console.error(`✗ Seed failed: ${seed.title.slice(0, 60)} — ${err.message}`);
    }
  }

  console.log(`\nSeeds created: ${createdSeedIds.length}/${seeds.length}`);

  // Phase 2: Create article branch + draft for Father's Day seed (index 3 = "What my dad never said")
  const fathersDaySeed = createdSeedIds[3]; // brand-engagement seed
  if (fathersDaySeed) {
    try {
      const branchId = await client.mutation(api.branches.create, {
        seedId: fathersDaySeed.id,
        brandId: BRAND_ID,
        format: "blog",
      });

      const draftId = await client.mutation(api.drafts.create, {
        branchId,
        body: articleBody,
        authoredBy: "factory-agent",
      });

      console.log(`\n✓ Article branch created: ${branchId}`);
      console.log(`✓ Article draft saved: ${draftId}`);

      // Social copy branch + draft
      const socialBranchId = await client.mutation(api.branches.create, {
        seedId: fathersDaySeed.id,
        brandId: BRAND_ID,
        format: "social",
      });

      const socialDraftId = await client.mutation(api.drafts.create, {
        branchId: socialBranchId,
        body: socialBody,
        authoredBy: "factory-agent",
      });

      console.log(`✓ Social copy branch created: ${socialBranchId}`);
      console.log(`✓ Social copy draft saved: ${socialDraftId}`);
    } catch (err) {
      console.error(`✗ Branch/draft creation failed: ${err.message}`);
    }
  }

  console.log(`\nImport complete. Review in Sweet Heat dashboard.`);
}

run().catch(console.error);
