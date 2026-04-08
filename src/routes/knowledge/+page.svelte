<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const client = useConvexClient();
	const brands = useQuery(api.brands.listActive, {});

	let selectedBrandId = $state<string | null>(null);

	const topics = $derived(
		selectedBrandId ? useQuery(api.knowledge.listTopics, { brandId: selectedBrandId as any }) : null
	);

	const ideaBriefs = $derived(
		selectedBrandId
			? useQuery(api.knowledge.listIdeaBriefs, { brandId: selectedBrandId as any, status: 'ready' })
			: null
	);

	// Auto-select first brand
	$effect(() => {
		if (!selectedBrandId && brands.data?.length) {
			selectedBrandId = brands.data[0]._id;
		}
	});

	let showNewTopic = $state(false);
	let newName = $state('');
	let newDescription = $state('');
	let newSearchTerms = $state('');
	let submitting = $state(false);

	function slugify(s: string): string {
		return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	async function createTopic(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedBrandId) return;
		submitting = true;
		await client.mutation(api.knowledge.createTopic, {
			brandId: selectedBrandId as any,
			name: newName,
			slug: slugify(newName),
			description: newDescription || undefined,
			searchTerms: newSearchTerms.split(',').map((s) => s.trim()).filter(Boolean)
		});
		showNewTopic = false;
		newName = '';
		newDescription = '';
		newSearchTerms = '';
		submitting = false;
	}

	async function plantAsSeed(briefId: string) {
		await client.mutation(api.knowledge.ideaBriefToSeed, { ideaBriefId: briefId as any });
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold text-(--color-on-surface)">Knowledge Base</h2>
			<p class="text-sm text-(--color-on-surface-muted)">
				Signal-weighted knowledge from YouTube and other sources
			</p>
		</div>
	</div>

	<!-- Brand selector -->
	<select
		bind:value={selectedBrandId}
		class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
	>
		{#if brands.data}
			{#each brands.data as brand}
				<option value={brand._id}>{brand.name}</option>
			{/each}
		{/if}
	</select>

	{#if selectedBrandId}
		<!-- Idea Briefs ready to plant -->
		{#if ideaBriefs?.data && ideaBriefs.data.length > 0}
			<div class="space-y-2">
				<h3 class="text-xs font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">
					Ready to Plant ({ideaBriefs.data.length} ideas)
				</h3>
				{#each ideaBriefs.data.slice(0, 3) as brief}
					<div class="bg-(--color-surface) rounded-xl border border-green-200 p-4">
						<div class="flex items-start justify-between gap-3">
							<div class="flex-1 min-w-0">
								<h4 class="font-semibold text-(--color-on-surface) text-sm">{brief.title}</h4>
								<p class="text-xs text-(--color-on-surface-muted) mt-0.5">{brief.angle}</p>
								{#if brief.compositeScore}
									<span class="text-xs text-(--color-on-surface-muted)">
										Score: {brief.compositeScore}
									</span>
								{/if}
							</div>
							<button
								onclick={() => plantAsSeed(brief._id)}
								class="shrink-0 px-3 py-1.5 rounded-lg bg-(--color-brand) text-white text-xs font-medium hover:bg-(--color-brand-dark)"
							>
								Plant as Seed
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Topics -->
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">
				Topics
			</h3>
			<button
				onclick={() => (showNewTopic = !showNewTopic)}
				class="px-3 py-1.5 rounded-lg bg-(--color-brand) text-white text-xs font-medium"
			>
				{showNewTopic ? 'Cancel' : '+ New Topic'}
			</button>
		</div>

		{#if showNewTopic}
			<form
				onsubmit={createTopic}
				class="bg-(--color-surface) rounded-xl border border-(--color-brand) p-4 space-y-3"
			>
				<div>
					<label for="topic-name" class="block text-sm font-medium text-(--color-on-surface) mb-1">Topic Name</label>
					<input
						id="topic-name"
						bind:value={newName}
						required
						class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
						placeholder="e.g., Parenting Toddlers"
					/>
				</div>
				<div>
					<label for="topic-desc" class="block text-sm font-medium text-(--color-on-surface) mb-1">Description</label>
					<input
						id="topic-desc"
						bind:value={newDescription}
						class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
						placeholder="What knowledge area does this cover?"
					/>
				</div>
				<div>
					<label for="topic-terms" class="block text-sm font-medium text-(--color-on-surface) mb-1">
						YouTube Search Terms
						<span class="font-normal text-(--color-on-surface-muted)">(comma-separated)</span>
					</label>
					<input
						id="topic-terms"
						bind:value={newSearchTerms}
						required
						class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
						placeholder="e.g., toddler tantrums, toddler discipline gentle parenting"
					/>
				</div>
				<button
					type="submit"
					disabled={submitting}
					class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white font-medium disabled:opacity-50"
				>
					{submitting ? 'Creating...' : 'Create Topic'}
				</button>
			</form>
		{/if}

		{#if topics?.data}
			{#if topics.data.length > 0}
				<div class="space-y-3">
					{#each topics.data as topic}
						<a
							href="/knowledge/{topic._id}"
							class="block bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors"
						>
							<div class="flex items-center justify-between">
								<div>
									<h4 class="font-semibold text-(--color-on-surface)">{topic.name}</h4>
									{#if topic.description}
										<p class="text-sm text-(--color-on-surface-muted) mt-0.5">{topic.description}</p>
									{/if}
								</div>
								<div class="flex items-center gap-3 text-xs text-(--color-on-surface-muted) shrink-0">
									<span>{topic.sourceCount ?? 0} sources</span>
									<span>{topic.pageCount ?? 0} pages</span>
									<span>{topic.ideaCount ?? 0} ideas</span>
								</div>
							</div>
							{#if topic.searchTerms.length > 0}
								<div class="flex flex-wrap gap-1 mt-2">
									{#each topic.searchTerms as term}
										<span class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface-muted)">
											{term}
										</span>
									{/each}
								</div>
							{/if}
						</a>
					{/each}
				</div>
			{:else}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
					<p class="text-2xl mb-2">📚</p>
					<p class="text-(--color-on-surface-muted)">No topics yet. Create one to start building your knowledge base.</p>
				</div>
			{/if}
		{/if}
	{/if}
</div>
