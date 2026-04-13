/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as abTests from "../abTests.js";
import type * as adCampaigns from "../adCampaigns.js";
import type * as aeoChecks from "../aeoChecks.js";
import type * as agentRuns from "../agentRuns.js";
import type * as audienceSegments from "../audienceSegments.js";
import type * as auth from "../auth.js";
import type * as backfill from "../backfill.js";
import type * as branches from "../branches.js";
import type * as brands from "../brands.js";
import type * as buffer from "../buffer.js";
import type * as comments from "../comments.js";
import type * as compiler from "../compiler.js";
import type * as contacts from "../contacts.js";
import type * as contentCalendar from "../contentCalendar.js";
import type * as contentIds from "../contentIds.js";
import type * as datafast from "../datafast.js";
import type * as drafts from "../drafts.js";
import type * as dream100 from "../dream100.js";
import type * as emailSequences from "../emailSequences.js";
import type * as feedbackSynthesis from "../feedbackSynthesis.js";
import type * as inbox from "../inbox.js";
import type * as integrations from "../integrations.js";
import type * as knowledge from "../knowledge.js";
import type * as leadMagnets from "../leadMagnets.js";
import type * as learnings from "../learnings.js";
import type * as lib_callClaude from "../lib/callClaude.js";
import type * as lib_contentIdUtils from "../lib/contentIdUtils.js";
import type * as lib_formatPrompts from "../lib/formatPrompts.js";
import type * as metaOoda from "../metaOoda.js";
import type * as outreach from "../outreach.js";
import type * as performanceSnapshots from "../performanceSnapshots.js";
import type * as pipeline from "../pipeline.js";
import type * as platformAccounts from "../platformAccounts.js";
import type * as qualityGate from "../qualityGate.js";
import type * as researchBriefs from "../researchBriefs.js";
import type * as seasonalPlanner from "../seasonalPlanner.js";
import type * as seed from "../seed.js";
import type * as seeds from "../seeds.js";
import type * as seoTargets from "../seoTargets.js";
import type * as todos from "../todos.js";
import type * as training from "../training.js";
import type * as videoScripts from "../videoScripts.js";
import type * as youtube from "../youtube.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  abTests: typeof abTests;
  adCampaigns: typeof adCampaigns;
  aeoChecks: typeof aeoChecks;
  agentRuns: typeof agentRuns;
  audienceSegments: typeof audienceSegments;
  auth: typeof auth;
  backfill: typeof backfill;
  branches: typeof branches;
  brands: typeof brands;
  buffer: typeof buffer;
  comments: typeof comments;
  compiler: typeof compiler;
  contacts: typeof contacts;
  contentCalendar: typeof contentCalendar;
  contentIds: typeof contentIds;
  datafast: typeof datafast;
  drafts: typeof drafts;
  dream100: typeof dream100;
  emailSequences: typeof emailSequences;
  feedbackSynthesis: typeof feedbackSynthesis;
  inbox: typeof inbox;
  integrations: typeof integrations;
  knowledge: typeof knowledge;
  leadMagnets: typeof leadMagnets;
  learnings: typeof learnings;
  "lib/callClaude": typeof lib_callClaude;
  "lib/contentIdUtils": typeof lib_contentIdUtils;
  "lib/formatPrompts": typeof lib_formatPrompts;
  metaOoda: typeof metaOoda;
  outreach: typeof outreach;
  performanceSnapshots: typeof performanceSnapshots;
  pipeline: typeof pipeline;
  platformAccounts: typeof platformAccounts;
  qualityGate: typeof qualityGate;
  researchBriefs: typeof researchBriefs;
  seasonalPlanner: typeof seasonalPlanner;
  seed: typeof seed;
  seeds: typeof seeds;
  seoTargets: typeof seoTargets;
  todos: typeof todos;
  training: typeof training;
  videoScripts: typeof videoScripts;
  youtube: typeof youtube;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
