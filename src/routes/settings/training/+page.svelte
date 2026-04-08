<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';

	const client = useConvexClient();
	const brands = useQuery(api.brands.listActive, {});

	let selectedBrandId = $state<string | null>(null);

	// Conditionally query training for selected brand
	const training = $derived(selectedBrandId
		? useQuery(api.training.list, { brandId: selectedBrandId as any })
		: null);

	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let editContent = $state('');

	let showNew = $state(false);
	let newLayer = $state('voice_general');
	let newScope = $state('');
	let newTitle = $state('');
	let newContent = $state('');
	let submitting = $state(false);

	const layers = [
		{ value: 'voice_general', label: 'General Voice & Tone' },
		{ value: 'spark_generation', label: 'Seed Generation' },
		{ value: 'platform_specific', label: 'Platform-Specific' },
		{ value: 'format_specific', label: 'Format-Specific' }
	];

	function startEdit(item: any) {
		editingId = item._id;
		editTitle = item.title;
		editContent = item.content;
	}

	async function saveEdit() {
		if (!editingId) return;
		submitting = true;
		await client.mutation(api.training.update, {
			id: editingId as any,
			title: editTitle,
			content: editContent
		});
		editingId = null;
		submitting = false;
	}

	async function createModule(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedBrandId) return;
		submitting = true;
		await client.mutation(api.training.create, {
			brandId: selectedBrandId as any,
			layer: newLayer,
			scope: newScope || undefined,
			title: newTitle,
			content: newContent
		});
		showNew = false;
		newTitle = '';
		newContent = '';
		newScope = '';
		submitting = false;
	}

	async function removeModule(id: string) {
		await client.mutation(api.training.remove, { id: id as any });
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<a href="/settings" class="text-sm text-(--color-brand) hover:underline">&larr; Settings</a>
			<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">Training</h2>
			<p class="text-sm text-(--color-on-surface-muted)">Voice and style training per brand</p>
		</div>
	</div>

	<!-- Brand selector -->
	<div>
		<select
			bind:value={selectedBrandId}
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

	{#if selectedBrandId}
		<div class="flex justify-end">
			<button
				onclick={() => (showNew = !showNew)}
				class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium"
			>
				{showNew ? 'Cancel' : '+ Add Module'}
			</button>
		</div>

		{#if showNew}
			<form
				onsubmit={createModule}
				class="bg-(--color-surface) rounded-xl border border-(--color-brand) p-4 space-y-3"
			>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="train-layer" class="block text-sm font-medium text-(--color-on-surface) mb-1">Layer</label>
						<select id="train-layer" bind:value={newLayer} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)">
							{#each layers as l}
								<option value={l.value}>{l.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="train-scope" class="block text-sm font-medium text-(--color-on-surface) mb-1">Scope</label>
						<input id="train-scope" bind:value={newScope} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)" placeholder="e.g., twitter, carousel" />
					</div>
				</div>
				<div>
					<label for="train-title" class="block text-sm font-medium text-(--color-on-surface) mb-1">Title</label>
					<input id="train-title" bind:value={newTitle} required class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)" />
				</div>
				<div>
					<label for="train-content" class="block text-sm font-medium text-(--color-on-surface) mb-1">Content (markdown)</label>
					<textarea id="train-content" bind:value={newContent} required rows="8" class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"></textarea>
				</div>
				<button type="submit" disabled={submitting} class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white font-medium disabled:opacity-50">
					{submitting ? 'Creating...' : 'Create Module'}
				</button>
			</form>
		{/if}

		{#if training && training.data}
			{#if training.data.length > 0}
				<div class="space-y-3">
					{#each training.data as item}
						<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
							{#if editingId === item._id}
								<div class="space-y-3">
									<input bind:value={editTitle} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) font-semibold" />
									<textarea bind:value={editContent} rows="10" class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"></textarea>
									<div class="flex gap-2">
										<button onclick={saveEdit} disabled={submitting} class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm disabled:opacity-50">Save</button>
										<button onclick={() => (editingId = null)} class="px-4 py-2 rounded-lg border border-(--color-border) text-sm">Cancel</button>
									</div>
								</div>
							{:else}
								<div class="flex items-start justify-between gap-3">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="font-semibold text-(--color-on-surface)">{item.title}</h3>
											<span class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface-muted)">
												{item.layer.replace(/_/g, ' ')}
											</span>
											{#if item.scope}
												<span class="text-xs text-(--color-on-surface-muted)">{item.scope}</span>
											{/if}
										</div>
										<pre class="text-sm text-(--color-on-surface-muted) whitespace-pre-wrap font-sans line-clamp-4">{item.content}</pre>
										<p class="text-xs text-(--color-on-surface-muted) mt-2">v{item.version}</p>
									</div>
									<div class="flex gap-1">
										<button onclick={() => startEdit(item)} class="text-xs text-(--color-brand) hover:underline">Edit</button>
										<button onclick={() => removeModule(item._id)} class="text-xs text-red-500 hover:underline">Delete</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
					<p class="text-(--color-on-surface-muted)">No training modules for this brand yet.</p>
				</div>
			{/if}
		{/if}
	{:else}
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
			<p class="text-(--color-on-surface-muted)">Select a brand to view training modules.</p>
		</div>
	{/if}
</div>
