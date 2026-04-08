<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';

	const client = useConvexClient();
	const learnings = useQuery(api.learnings.list, {});

	const statusColors: Record<string, string> = {
		proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		incorporated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
	};

	async function approveLearning(id: string) {
		await client.mutation(api.learnings.approve, { id: id as any });
	}

	async function rejectLearning(id: string) {
		await client.mutation(api.learnings.reject, { id: id as any });
	}
</script>

<div class="space-y-4">
	<div>
		<a href="/settings" class="text-sm text-(--color-brand) hover:underline">&larr; Settings</a>
		<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">Learnings</h2>
		<p class="text-sm text-(--color-on-surface-muted)">
			Agent-proposed improvements to training. Approve to incorporate into brand voice.
		</p>
	</div>

	{#if learnings.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading...</p>
	{:else if learnings.data && learnings.data.length > 0}
		<div class="space-y-3">
			{#each learnings.data as learning}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
					<div class="flex items-center justify-between">
						<span
							class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface-muted)"
						>
							{learning.layer.replace(/_/g, ' ')}
						</span>
						<span class="text-xs px-2 py-1 rounded-full {statusColors[learning.status] ?? ''}">
							{learning.status}
						</span>
					</div>

					<div>
						<h3 class="font-semibold text-(--color-on-surface) text-sm">Proposal</h3>
						<p class="text-sm text-(--color-on-surface) mt-1">{learning.proposal}</p>
					</div>

					<div>
						<h3 class="font-semibold text-(--color-on-surface-muted) text-xs">Reasoning</h3>
						<p class="text-xs text-(--color-on-surface-muted) mt-0.5">{learning.reasoning}</p>
					</div>

					{#if learning.rejectionCount > 0}
						<p class="text-xs text-orange-500">
							Rejected {learning.rejectionCount} time{learning.rejectionCount > 1 ? 's' : ''}
						</p>
					{/if}

					{#if learning.status === 'proposed'}
						<div class="flex gap-2 pt-2 border-t border-(--color-border)">
							<button
								onclick={() => approveLearning(learning._id)}
								class="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
							>
								Approve
							</button>
							<button
								onclick={() => rejectLearning(learning._id)}
								class="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
							>
								Reject
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center"
		>
			<p class="text-(--color-on-surface-muted)">No learnings yet. The agent will propose them after content runs.</p>
		</div>
	{/if}
</div>
