<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';

	const client = useConvexClient();
	const seeds = useQuery(api.seeds.list, {});
	const branches = useQuery(api.branches.list, {});
	const brands = useQuery(api.brands.listActive, {});

	// Seeds needing review
	const pendingSeeds = $derived(
		seeds.data?.filter((s) => s.status === 'pitched').slice(0, 5) ?? []
	);

	// Branches needing review
	const reviewBranches = $derived(
		branches.data?.filter((b) => b.status === 'in_review').slice(0, 3) ?? []
	);

	// Recently published
	const publishedBranches = $derived(
		branches.data?.filter((b) => b.status === 'scheduled' || b.status === 'published').slice(0, 3) ?? []
	);

	// Counts
	const seedCount = $derived(pendingSeeds.length);
	const branchCount = $derived(reviewBranches.length);

	// Quick seed input
	let quickIdea = $state('');
	let submittingIdea = $state(false);

	async function quickPlantSeed() {
		if (!quickIdea.trim() || !brands.data?.length) return;
		submittingIdea = true;
		await client.mutation(api.seeds.create, {
			brandId: brands.data[0]._id as any,
			title: quickIdea,
			description: quickIdea,
			source: 'manual',
			pitchedBy: 'user'
		});
		quickIdea = '';
		submittingIdea = false;
	}

	async function approveSeed(seedId: string) {
		await client.mutation(api.pipeline.approveSeed, { seedId: seedId as any });
	}

	async function rejectSeed(seedId: string) {
		await client.mutation(api.seeds.updateStatus, { id: seedId as any, status: 'rejected' });
	}

	async function approveBranch(branchId: string) {
		await client.mutation(api.pipeline.approveBranch, { branchId: branchId as any });
	}

	const formatLabels: Record<string, string> = {
		tweet: 'Tweet', linkedin: 'LinkedIn', blog: 'Blog', caption_ig: 'IG',
		caption_tiktok: 'TikTok', newsletter: 'Newsletter', carousel: 'Carousel',
		quote_card: 'Quote', pin: 'Pin', thumbnail: 'Thumb', short_video: 'Short',
		long_video: 'Long Video'
	};

	const purposeColors: Record<string, string> = {
		seo: 'bg-blue-100 text-blue-700',
		aeo: 'bg-purple-100 text-purple-700',
		brand_building: 'bg-amber-100 text-amber-700',
		engagement: 'bg-pink-100 text-pink-700',
		table_stakes: 'bg-green-100 text-green-700',
	};
</script>

<div class="space-y-5">
	<!-- Greeting -->
	<div>
		<h2 class="text-lg font-bold text-(--color-on-surface)">
			{#if seedCount > 0}
				{seedCount} seed{seedCount > 1 ? 's' : ''} to review
			{:else if branchCount > 0}
				{branchCount} branch{branchCount > 1 ? 'es' : ''} ready
			{:else}
				All caught up
			{/if}
		</h2>
		<p class="text-sm text-(--color-on-surface-muted)">
			{#if seedCount > 0}
				Your agent pitched new content ideas. Approve the good ones.
			{:else if branchCount > 0}
				Content is written and waiting for your approval.
			{:else}
				The factory is working. Check back later or plant a seed.
			{/if}
		</p>
	</div>

	<!-- ═══ SEEDS TO REVIEW (the main action) ═══ -->
	{#if pendingSeeds.length > 0}
		<div class="space-y-3">
			{#each pendingSeeds as seed}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
					<div>
						<h3 class="font-semibold text-(--color-on-surface)">{seed.title}</h3>
						<p class="text-sm text-(--color-on-surface-muted) mt-1 line-clamp-2">{seed.description}</p>
					</div>

					<!-- Meta tags -->
					<div class="flex flex-wrap items-center gap-1.5 text-xs">
						<span class="text-(--color-on-surface-muted)">{seed.source.replace(/_/g, ' ')}</span>
						{#if seed.purpose}
							<span class="px-1.5 py-0.5 rounded {purposeColors[seed.purpose] ?? 'bg-gray-100 text-gray-600'}">
								{seed.purpose.replace(/_/g, ' ')}
							</span>
						{/if}
						{#if seed.contentPillar}
							<span class="px-1.5 py-0.5 rounded bg-(--color-surface-container) text-(--color-on-surface-muted)">
								{seed.contentPillar}
							</span>
						{/if}
					</div>

					{#if seed.reasoning}
						<p class="text-xs text-(--color-on-surface-muted) italic">{seed.reasoning}</p>
					{/if}

					{#if seed.targetKeywords?.length}
						<div class="flex flex-wrap gap-1">
							{#each seed.targetKeywords.slice(0, 4) as kw}
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">{kw}</span>
							{/each}
						</div>
					{/if}

					<!-- Action buttons -->
					<div class="flex gap-2 pt-1">
						<button
							onclick={() => approveSeed(seed._id)}
							class="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 active:bg-green-800"
						>
							Approve
						</button>
						<button
							onclick={() => rejectSeed(seed._id)}
							class="flex-1 py-2.5 rounded-lg border border-(--color-border) text-(--color-on-surface) text-sm font-medium hover:bg-(--color-surface-container)"
						>
							Skip
						</button>
					</div>
				</div>
			{/each}

			{#if (seeds.data?.filter((s) => s.status === 'pitched').length ?? 0) > 5}
				<a href="/seeds" class="block text-center text-sm text-(--color-brand) hover:underline py-2">
					View all {seeds.data?.filter((s) => s.status === 'pitched').length} seeds →
				</a>
			{/if}
		</div>
	{/if}

	<!-- ═══ BRANCHES TO REVIEW ═══ -->
	{#if reviewBranches.length > 0}
		<div class="space-y-2">
			<h3 class="text-xs font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">
				Content ready to publish
			</h3>
			{#each reviewBranches as branch}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-3 flex items-center justify-between gap-3">
					<div class="flex items-center gap-2 min-w-0">
						<span class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) font-medium text-(--color-on-surface)">
							{formatLabels[branch.format] ?? branch.format}
						</span>
						<span class="text-sm text-(--color-on-surface) truncate">
							Ready for review
						</span>
					</div>
					<button
						onclick={() => approveBranch(branch._id)}
						class="shrink-0 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium"
					>
						Publish
					</button>
				</div>
			{/each}

			<a href="/branches" class="block text-center text-sm text-(--color-brand) hover:underline py-1">
				View all branches →
			</a>
		</div>
	{/if}

	<!-- ═══ QUICK SEED INPUT ═══ -->
	<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={quickIdea}
				placeholder="Got an idea? Plant a seed..."
				class="flex-1 px-3 py-2.5 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
				onkeydown={(e) => { if (e.key === 'Enter') quickPlantSeed(); }}
			/>
			<button
				onclick={quickPlantSeed}
				disabled={submittingIdea || !quickIdea.trim()}
				class="px-4 py-2.5 rounded-lg bg-(--color-brand) text-white text-sm font-medium disabled:opacity-40"
			>
				Plant
			</button>
		</div>
	</div>

	<!-- ═══ RECENTLY PUBLISHED ═══ -->
	{#if publishedBranches.length > 0}
		<div class="space-y-2">
			<h3 class="text-xs font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">
				Recently scheduled
			</h3>
			{#each publishedBranches as branch}
				<div class="bg-(--color-surface) rounded-lg border border-(--color-border) p-3 flex items-center gap-2 text-sm">
					<span class="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
					<span class="text-xs px-1.5 py-0.5 rounded bg-(--color-surface-container) text-(--color-on-surface-muted)">
						{formatLabels[branch.format] ?? branch.format}
					</span>
					<span class="text-(--color-on-surface-muted) text-xs">
						{branch.status === 'scheduled' ? 'Queued in Buffer' : 'Published'}
					</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- ═══ ALL CAUGHT UP STATE ═══ -->
	{#if pendingSeeds.length === 0 && reviewBranches.length === 0}
		<div class="text-center py-6 space-y-3">
			<p class="text-3xl">✨</p>
			<p class="text-(--color-on-surface-muted) text-sm">
				No seeds or branches need your attention right now.<br />
				The strategist will pitch new ideas tomorrow at 6am.
			</p>
			<div class="flex justify-center gap-3">
				<a href="/seeds" class="text-sm text-(--color-brand) hover:underline">View all seeds</a>
				<a href="/knowledge" class="text-sm text-(--color-brand) hover:underline">Knowledge base</a>
			</div>
		</div>
	{/if}
</div>
