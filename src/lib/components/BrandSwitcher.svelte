<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const brands = useQuery(api.brands.listActive, {});

	let open = $state(false);
	let selectedBrandId = $state<string | null>(null);

	// Auto-select first brand
	$effect(() => {
		if (!selectedBrandId && brands.data && brands.data.length > 0) {
			selectedBrandId = brands.data[0]._id;
		}
	});

	const selectedBrand = $derived(brands.data?.find((b) => b._id === selectedBrandId));

	function selectBrand(id: string) {
		selectedBrandId = id;
		open = false;
		// Store in localStorage for persistence
		if (typeof window !== 'undefined') {
			localStorage.setItem('selectedBrandId', id);
		}
	}

	// Restore from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('selectedBrandId');
			if (stored) selectedBrandId = stored;
		}
	});
</script>

<div class="relative">
	<button
		onclick={() => (open = !open)}
		class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-surface) text-sm font-medium text-(--color-on-surface) hover:bg-(--color-surface-container) transition-colors"
	>
		{#if selectedBrand}
			<span
				class="w-2 h-2 rounded-full"
				style="background: {selectedBrand.isActive ? 'var(--color-brand)' : '#9ca3af'}"
			></span>
			{selectedBrand.name}
		{:else}
			All Brands
		{/if}
		<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<!-- Backdrop -->
		<button class="fixed inset-0 z-50" onclick={() => (open = false)} aria-label="Close"></button>

		<div
			class="absolute right-0 top-full mt-1 z-50 w-56 bg-(--color-surface) rounded-lg shadow-lg border border-(--color-border) py-1"
		>
			<button
				onclick={() => {
					selectedBrandId = null;
					open = false;
					localStorage.removeItem('selectedBrandId');
				}}
				class="w-full text-left px-4 py-2 text-sm hover:bg-(--color-surface-container) text-(--color-on-surface-muted)"
			>
				All Brands
			</button>
			{#if brands.data}
				{#each brands.data as brand}
					<button
						onclick={() => selectBrand(brand._id)}
						class="w-full text-left px-4 py-2 text-sm hover:bg-(--color-surface-container) flex items-center gap-2"
						class:font-semibold={brand._id === selectedBrandId}
					>
						<span
							class="w-2 h-2 rounded-full shrink-0"
							style="background: var(--color-brand)"
						></span>
						{brand.name}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>
