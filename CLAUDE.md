# Sweet Content

Multi-brand content production system. Seeds grow into Branches that bear Fruit.

## Stack
- **Frontend**: SvelteKit 5 (runes) on Cloudflare Workers
- **Database**: Convex (real-time, reactive)
- **Styling**: Tailwind CSS v4
- **Auth**: Simple session-based auth via Convex

## Convex
- Deployment: `loyal-hamster-102`
- Push schema: `npx convex dev --once`
- Run functions: `npx convex run <module>:<function>`

## Naming Convention (Botanical Metaphor)
- **Seeds** = raw ideas/inputs (PRD calls these "Sparks")
- **Branches** = content under development in a specific format (PRD calls these "Flames")
- **Fruit** = published content
- **Drafts** = versioned content within a branch

## Architecture
- Multi-tenant aware: `organizationId` on brands (nullable, single-org for now)
- Tool-agnostic: `integrations` table with pluggable adapters
- All queries are brand-scoped
- Agent API routes under `/api/*` authenticated via `AGENT_API_KEY`

## Development
```bash
nvm use 22
npm run dev          # Start dev server
npx convex dev       # Watch Convex changes
```

## Node Version
Requires Node 22+ (`.nvmrc` configured). Use `nvm use 22` before running commands.
