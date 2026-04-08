<script lang="ts">
	import { page } from '$app/state';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../../convex/_generated/api';

	const client = useConvexClient();
	const brandId = $derived(page.params.id);
	const brand = useQuery(api.brands.get, () => ({ id: brandId as any }));

	let editing = $state(false);
	let saving = $state(false);

	// Editable fields
	let editName = $state('');
	let editDescription = $state('');
	let editVoiceTraining = $state('');
	let editInterests = $state('');
	let editWordsToUse = $state('');
	let editWordsToAvoid = $state('');
	let editGoals = $state('');

	function startEditing() {
		if (!brand.data) return;
		editName = brand.data.name;
		editDescription = brand.data.description;
		editVoiceTraining = brand.data.voiceTraining;
		editInterests = brand.data.interests.join(', ');
		editWordsToUse = brand.data.wordsToUse.join(', ');
		editWordsToAvoid = brand.data.wordsToAvoid.join(', ');
		editGoals = brand.data.goals ?? '';
		editing = true;
	}

	async function save() {
		saving = true;
		await client.mutation(api.brands.update, {
			id: brandId as any,
			name: editName,
			description: editDescription,
			voiceTraining: editVoiceTraining,
			interests: editInterests
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			wordsToUse: editWordsToUse
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			wordsToAvoid: editWordsToAvoid
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			goals: editGoals || undefined
		});
		editing = false;
		saving = false;
	}

	async function toggleActive() {
		if (!brand.data) return;
		await client.mutation(api.brands.update, {
			id: brandId as any,
			isActive: !brand.data.isActive
		});
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<a href="/settings/brands" class="text-sm text-(--color-brand) hover:underline">&larr; Brands</a>
			<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">
				{brand.data?.name ?? 'Loading...'}
			</h2>
		</div>
		{#if brand.data}
			<div class="flex items-center gap-2">
				<a
					href="/settings/brands/{brandId}/integrations"
					class="px-3 py-1.5 rounded-lg border border-(--color-border) text-sm text-(--color-on-surface) hover:bg-(--color-surface-container) transition-colors"
				>
					Integrations
				</a>
				{#if !editing}
					<button
						onclick={startEditing}
						class="px-3 py-1.5 rounded-lg bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-dark) transition-colors"
					>
						Edit
					</button>
				{/if}
			</div>
		{/if}
	</div>

	{#if brand.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading...</p>
	{:else if brand.data}
		{#if editing}
			<!-- Edit mode -->
			<div class="space-y-4">
				<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-4">
					<h3 class="font-semibold text-(--color-on-surface)">Identity</h3>
					<div>
						<label for="edit-name" class="block text-sm font-medium text-(--color-on-surface) mb-1">Name</label>
						<input id="edit-name" bind:value={editName} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)" />
					</div>
					<div>
						<label for="edit-desc" class="block text-sm font-medium text-(--color-on-surface) mb-1">Description</label>
						<textarea id="edit-desc" bind:value={editDescription} rows="2" class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-none"></textarea>
					</div>
				</section>

				<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-4">
					<h3 class="font-semibold text-(--color-on-surface)">Voice</h3>
					<textarea bind:value={editVoiceTraining} rows="8" class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"></textarea>
					<div>
						<label for="edit-interests" class="block text-sm font-medium text-(--color-on-surface) mb-1">Interests</label>
						<input id="edit-interests" bind:value={editInterests} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)" />
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="edit-use" class="block text-sm font-medium text-(--color-on-surface) mb-1">Words to Use</label>
							<input id="edit-use" bind:value={editWordsToUse} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm" />
						</div>
						<div>
							<label for="edit-avoid" class="block text-sm font-medium text-(--color-on-surface) mb-1">Words to Avoid</label>
							<input id="edit-avoid" bind:value={editWordsToAvoid} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm" />
						</div>
					</div>
				</section>

				<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-4">
					<h3 class="font-semibold text-(--color-on-surface)">Goals</h3>
					<textarea bind:value={editGoals} rows="2" class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-none"></textarea>
				</section>

				<div class="flex gap-3">
					<button
						onclick={save}
						disabled={saving}
						class="flex-1 py-2.5 rounded-lg bg-(--color-brand) text-white font-medium hover:bg-(--color-brand-dark) disabled:opacity-50"
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
					<button
						onclick={() => (editing = false)}
						class="px-6 py-2.5 rounded-lg border border-(--color-border) text-(--color-on-surface)"
					>
						Cancel
					</button>
				</div>
			</div>
		{:else}
			<!-- View mode -->
			<div class="space-y-4">
				<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-(--color-on-surface)">Status</h3>
						<button
							onclick={toggleActive}
							class="text-sm px-3 py-1 rounded-full"
							class:bg-green-100={brand.data.isActive}
							class:text-green-800={brand.data.isActive}
							class:bg-gray-100={!brand.data.isActive}
							class:text-gray-800={!brand.data.isActive}
						>
							{brand.data.isActive ? 'Active' : 'Inactive'}
						</button>
					</div>
					<p class="text-sm text-(--color-on-surface-muted)">{brand.data.description}</p>
				</section>

				<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
					<h3 class="font-semibold text-(--color-on-surface)">Voice Training</h3>
					<pre class="text-sm text-(--color-on-surface-muted) whitespace-pre-wrap font-sans">{brand.data.voiceTraining || 'No voice training yet'}</pre>
				</section>

				{#if brand.data.interests.length > 0}
					<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
						<h3 class="font-semibold text-(--color-on-surface)">Interests</h3>
						<div class="flex flex-wrap gap-2">
							{#each brand.data.interests as interest}
								<span class="text-sm px-2 py-1 rounded-full bg-(--color-surface-container) text-(--color-on-surface)">{interest}</span>
							{/each}
						</div>
					</section>
				{/if}

				<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
					<h3 class="font-semibold text-(--color-on-surface)">Active Formats</h3>
					<div class="flex flex-wrap gap-2">
						{#each brand.data.activeFormats as format}
							<span class="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{format}</span>
						{/each}
					</div>
				</section>

				{#if brand.data.goals}
					<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
						<h3 class="font-semibold text-(--color-on-surface)">Goals</h3>
						<p class="text-sm text-(--color-on-surface-muted)">{brand.data.goals}</p>
					</section>
				{/if}
			</div>
		{/if}
	{/if}
</div>
