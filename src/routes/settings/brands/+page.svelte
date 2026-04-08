<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';

	const brands = useQuery(api.brands.list, {});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold text-(--color-on-surface)">Brands</h2>
			<p class="text-sm text-(--color-on-surface-muted)">Your content identities</p>
		</div>
		<a
			href="/settings/brands/new"
			class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-dark) transition-colors"
		>
			+ New Brand
		</a>
	</div>

	{#if brands.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading...</p>
	{:else if brands.data && brands.data.length > 0}
		<div class="space-y-3">
			{#each brands.data as brand}
				<a
					href="/settings/brands/{brand._id}"
					class="block bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span
								class="w-3 h-3 rounded-full shrink-0"
								style="background: {brand.isActive ? 'var(--color-brand)' : '#9ca3af'}"
							></span>
							<div>
								<h3 class="font-semibold text-(--color-on-surface)">{brand.name}</h3>
								<p class="text-sm text-(--color-on-surface-muted)">{brand.description}</p>
							</div>
						</div>
						<span class="text-xs text-(--color-on-surface-muted)">
							{brand.activeFormats.length} formats
						</span>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div
			class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center"
		>
			<p class="text-(--color-on-surface-muted)">No brands yet</p>
			<a
				href="/settings/brands/new"
				class="inline-block mt-3 px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium"
			>
				Create your first brand
			</a>
		</div>
	{/if}
</div>
