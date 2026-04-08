<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';

	const brands = useQuery(api.brands.listActive, {});
	const allTodos = useQuery(api.todos.countsByOwner, {});
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-bold text-(--color-on-surface)">Dashboard</h2>
		<p class="text-sm text-(--color-on-surface-muted) mt-1">Your content factory at a glance</p>
	</div>

	<!-- Quick stats -->
	<div class="grid grid-cols-2 gap-3">
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
			<p class="text-sm text-(--color-on-surface-muted)">Your Todos</p>
			<p class="text-2xl font-bold text-(--color-on-surface) mt-1">
				{allTodos.data?.userPending ?? '...'}
			</p>
		</div>
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
			<p class="text-sm text-(--color-on-surface-muted)">Agent Todos</p>
			<p class="text-2xl font-bold text-(--color-on-surface) mt-1">
				{allTodos.data?.agentPending ?? '...'}
			</p>
		</div>
	</div>

	<!-- Brands overview -->
	<div>
		<h3 class="text-sm font-semibold text-(--color-on-surface-muted) uppercase tracking-wider mb-3">
			Active Brands
		</h3>
		{#if brands.isLoading}
			<div class="text-sm text-(--color-on-surface-muted)">Loading brands...</div>
		{:else if brands.data && brands.data.length > 0}
			<div class="space-y-3">
				{#each brands.data as brand}
					<a
						href="/settings/brands/{brand._id}"
						class="block bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors"
					>
						<div class="flex items-center justify-between">
							<div>
								<h4 class="font-semibold text-(--color-on-surface)">{brand.name}</h4>
								<p class="text-sm text-(--color-on-surface-muted) mt-0.5">{brand.description}</p>
							</div>
							<div class="flex items-center gap-1">
								{#each brand.activeFormats.slice(0, 3) as format}
									<span
										class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface-muted)"
									>
										{format}
									</span>
								{/each}
								{#if brand.activeFormats.length > 3}
									<span class="text-xs text-(--color-on-surface-muted)">
										+{brand.activeFormats.length - 3}
									</span>
								{/if}
							</div>
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
					class="inline-block mt-3 px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-dark) transition-colors"
				>
					Create your first brand
				</a>
			</div>
		{/if}
	</div>

	<!-- Quick actions -->
	<div>
		<h3 class="text-sm font-semibold text-(--color-on-surface-muted) uppercase tracking-wider mb-3">
			Quick Actions
		</h3>
		<div class="grid grid-cols-2 gap-3">
			<a
				href="/seeds"
				class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors text-center"
			>
				<p class="text-2xl">🌱</p>
				<p class="text-sm font-medium text-(--color-on-surface) mt-1">Plant a Seed</p>
			</a>
			<a
				href="/settings/brands"
				class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors text-center"
			>
				<p class="text-2xl">🏷️</p>
				<p class="text-sm font-medium text-(--color-on-surface) mt-1">Manage Brands</p>
			</a>
		</div>
	</div>
</div>
