<script lang="ts">
	import { page } from '$app/state';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../../../convex/_generated/api';

	const client = useConvexClient();
	const brandId = $derived(page.params.id);
	const brand = useQuery(api.brands.get, () => ({ id: brandId as any }));
	const integrations = useQuery(api.integrations.list, () => ({ brandId: brandId as any }));

	let showAdd = $state(false);
	let newProvider = $state('buffer');
	let newType = $state('distribution');
	let newName = $state('');
	let newConfig = $state('{}');
	let submitting = $state(false);

	const providers = [
		{ value: 'buffer', label: 'Buffer' },
		{ value: 'beehiiv', label: 'Beehiiv' },
		{ value: 'canva', label: 'Canva' },
		{ value: 'custom', label: 'Custom' }
	];

	const types = [
		{ value: 'distribution', label: 'Distribution' },
		{ value: 'visual', label: 'Visual Assets' },
		{ value: 'newsletter', label: 'Newsletter' },
		{ value: 'analytics', label: 'Analytics' }
	];

	async function addIntegration(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		let config;
		try {
			config = JSON.parse(newConfig);
		} catch {
			config = {};
		}

		await client.mutation(api.integrations.create, {
			brandId: brandId as any,
			provider: newProvider,
			type: newType,
			name: newName,
			config
		});

		showAdd = false;
		newName = '';
		newConfig = '{}';
		submitting = false;
	}

	async function toggleIntegration(id: string, isActive: boolean) {
		await client.mutation(api.integrations.update, {
			id: id as any,
			isActive: !isActive
		});
	}

	async function removeIntegration(id: string) {
		await client.mutation(api.integrations.remove, { id: id as any });
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<a href="/settings/brands/{brandId}" class="text-sm text-(--color-brand) hover:underline">
				&larr; {brand.data?.name ?? 'Brand'}
			</a>
			<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">Integrations</h2>
		</div>
		<button
			onclick={() => (showAdd = !showAdd)}
			class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium"
		>
			{showAdd ? 'Cancel' : '+ Add'}
		</button>
	</div>

	{#if showAdd}
		<form
			onsubmit={addIntegration}
			class="bg-(--color-surface) rounded-xl border border-(--color-brand) p-4 space-y-3"
		>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="int-provider" class="block text-sm font-medium text-(--color-on-surface) mb-1">Provider</label>
					<select id="int-provider" bind:value={newProvider} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)">
						{#each providers as p}
							<option value={p.value}>{p.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="int-type" class="block text-sm font-medium text-(--color-on-surface) mb-1">Type</label>
					<select id="int-type" bind:value={newType} class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)">
						{#each types as t}
							<option value={t.value}>{t.label}</option>
						{/each}
					</select>
				</div>
			</div>
			<div>
				<label for="int-name" class="block text-sm font-medium text-(--color-on-surface) mb-1">Name</label>
				<input id="int-name" bind:value={newName} required class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)" placeholder="e.g., Buffer - Instagram" />
			</div>
			<div>
				<label for="int-config" class="block text-sm font-medium text-(--color-on-surface) mb-1">Config (JSON)</label>
				<textarea id="int-config" bind:value={newConfig} rows="3" class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) font-mono text-sm resize-none"></textarea>
			</div>
			<button type="submit" disabled={submitting} class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white font-medium disabled:opacity-50">
				{submitting ? 'Adding...' : 'Add Integration'}
			</button>
		</form>
	{/if}

	{#if integrations.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading...</p>
	{:else if integrations.data && integrations.data.length > 0}
		<div class="space-y-3">
			{#each integrations.data as integration}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-semibold text-(--color-on-surface)">{integration.name}</h3>
							<p class="text-xs text-(--color-on-surface-muted) mt-0.5">
								{integration.provider} &middot; {integration.type}
							</p>
						</div>
						<div class="flex items-center gap-2">
							<button
								onclick={() => toggleIntegration(integration._id, integration.isActive)}
								class="text-xs px-2 py-1 rounded-full"
								class:bg-green-100={integration.isActive}
								class:text-green-800={integration.isActive}
								class:bg-gray-100={!integration.isActive}
								class:text-gray-600={!integration.isActive}
							>
								{integration.isActive ? 'Active' : 'Off'}
							</button>
							<button
								onclick={() => removeIntegration(integration._id)}
								class="text-xs text-red-500 hover:text-red-600"
							>
								Remove
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
			<p class="text-(--color-on-surface-muted)">No integrations yet for this brand.</p>
		</div>
	{/if}
</div>
