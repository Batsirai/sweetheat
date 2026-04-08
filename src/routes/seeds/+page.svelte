<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const client = useConvexClient();
	const seeds = useQuery(api.seeds.list, {});
	const brands = useQuery(api.brands.listActive, {});

	let showNewSeed = $state(false);
	let newTitle = $state('');
	let newDescription = $state('');
	let selectedBrandId = $state<string | null>(null);
	let submitting = $state(false);

	async function createSeed(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedBrandId) return;
		submitting = true;

		await client.mutation(api.seeds.create, {
			brandId: selectedBrandId as any,
			title: newTitle,
			description: newDescription,
			source: 'manual',
			pitchedBy: 'user'
		});

		newTitle = '';
		newDescription = '';
		showNewSeed = false;
		submitting = false;
	}

	const statusColors: Record<string, string> = {
		pitched: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold text-(--color-on-surface)">Seeds</h2>
			<p class="text-sm text-(--color-on-surface-muted)">Raw ideas waiting to grow</p>
		</div>
		<button
			onclick={() => (showNewSeed = !showNewSeed)}
			class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-dark) transition-colors"
		>
			{showNewSeed ? 'Cancel' : '+ Plant Seed'}
		</button>
	</div>

	<!-- New seed form -->
	{#if showNewSeed}
		<form
			onsubmit={createSeed}
			class="bg-(--color-surface) rounded-xl border border-(--color-brand) p-4 space-y-3"
		>
			<div>
				<label class="block text-sm font-medium text-(--color-on-surface) mb-1" for="seed-brand">Brand</label>
				<select
					id="seed-brand"
					bind:value={selectedBrandId}
					required
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
				>
					<option value={null}>Select a brand...</option>
					{#if brands.data}
						{#each brands.data as brand}
							<option value={brand._id}>{brand.name}</option>
						{/each}
					{/if}
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-(--color-on-surface) mb-1" for="seed-title">Title</label>
				<input
					id="seed-title"
					type="text"
					bind:value={newTitle}
					required
					placeholder="What's the idea?"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium text-(--color-on-surface) mb-1" for="seed-desc">Description</label>
				<textarea
					id="seed-desc"
					bind:value={newDescription}
					required
					rows="3"
					placeholder="Describe the seed... what could grow from this?"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-none"
				></textarea>
			</div>
			<button
				type="submit"
				disabled={submitting}
				class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white font-medium hover:bg-(--color-brand-dark) transition-colors disabled:opacity-50"
			>
				{submitting ? 'Planting...' : 'Plant Seed'}
			</button>
		</form>
	{/if}

	<!-- Seeds list -->
	{#if seeds.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading seeds...</p>
	{:else if seeds.data && seeds.data.length > 0}
		<div class="space-y-3">
			{#each seeds.data as seed}
				<div
					class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand)/30 transition-colors"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-(--color-on-surface)">{seed.title}</h3>
							<p class="text-sm text-(--color-on-surface-muted) mt-1 line-clamp-2">
								{seed.description}
							</p>
						</div>
						<span class="text-xs px-2 py-1 rounded-full shrink-0 {statusColors[seed.status] ?? ''}">
							{seed.status.replace('_', ' ')}
						</span>
					</div>
					<div class="flex items-center gap-3 mt-3 text-xs text-(--color-on-surface-muted)">
						<span>{seed.source}</span>
						<span>by {seed.pitchedBy}</span>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-12 text-center"
		>
			<p class="text-3xl mb-2">🌱</p>
			<p class="text-(--color-on-surface-muted)">No seeds yet. Plant your first idea!</p>
		</div>
	{/if}
</div>
