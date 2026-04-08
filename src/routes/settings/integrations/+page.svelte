<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';

	const integrations = useQuery(api.integrations.list, {});
</script>

<div class="space-y-4">
	<div>
		<a href="/settings" class="text-sm text-(--color-brand) hover:underline">&larr; Settings</a>
		<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">All Integrations</h2>
		<p class="text-sm text-(--color-on-surface-muted)">Connected tools across all brands</p>
	</div>

	{#if integrations.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading...</p>
	{:else if integrations.data && integrations.data.length > 0}
		<div class="space-y-3">
			{#each integrations.data as integration}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-semibold text-(--color-on-surface)">{integration.name}</h3>
							<p class="text-xs text-(--color-on-surface-muted)">
								{integration.provider} &middot; {integration.type}
								{#if integration.isActive}
									<span class="text-green-600">&middot; Active</span>
								{/if}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
			<p class="text-(--color-on-surface-muted)">No integrations yet. Add them from individual brand settings.</p>
		</div>
	{/if}
</div>
