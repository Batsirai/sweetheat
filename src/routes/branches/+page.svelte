<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const client = useConvexClient();
	const branches = useQuery(api.branches.list, {});

	// Expanded branch for viewing draft
	let expandedBranchId = $state<string | null>(null);
	let commentBody = $state('');
	let commentingBranchId = $state<string | null>(null);

	async function updateStatus(id: string, status: string) {
		await client.mutation(api.branches.updateStatus, { id: id as any, status });
	}

	async function toggleNewsletterFlag(id: string, currentFlag: boolean | undefined) {
		await client.mutation(api.branches.updateStatus, {
			id: id as any,
			status: '' // won't change - we need a separate mutation
		});
		// Use the branch update for newsletter flag
		// For now, use updateStatus with the current status
	}

	async function submitComment(branchId: string) {
		if (!commentBody.trim()) return;
		await client.mutation(api.comments.create, {
			targetType: 'branch',
			targetId: branchId,
			authoredBy: 'user',
			body: commentBody
		});
		commentBody = '';
		commentingBranchId = null;
	}

	async function quickFeedback(branchId: string, feedbackType: string) {
		await client.mutation(api.comments.create, {
			targetType: 'branch',
			targetId: branchId,
			authoredBy: 'user',
			body: feedbackType.replace(/_/g, ' '),
			isQuickFeedback: true,
			quickFeedbackType: feedbackType
		});
	}

	const statusColors: Record<string, string> = {
		draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
		in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		revision_requested:
			'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
		published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
		archived: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
	};

	const formatLabels: Record<string, string> = {
		tweet: 'Tweet',
		linkedin: 'LinkedIn',
		blog: 'Blog',
		caption_ig: 'IG Caption',
		caption_tiktok: 'TikTok',
		newsletter: 'Newsletter',
		carousel: 'Carousel',
		quote_card: 'Quote Card',
		pin: 'Pin',
		thumbnail: 'Thumbnail',
		short_video: 'Short Video',
		long_video: 'Long Video'
	};

	const quickFeedbackOptions = [
		{ type: 'more_actionable', label: 'More actionable' },
		{ type: 'more_concise', label: 'More concise' },
		{ type: 'break_sections', label: 'Break into sections' },
		{ type: 'wrong_tone', label: 'Wrong tone' },
		{ type: 'add_hook', label: 'Add a hook' }
	];
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-xl font-bold text-(--color-on-surface)">Branches</h2>
		<p class="text-sm text-(--color-on-surface-muted)">Content growing from your seeds</p>
	</div>

	{#if branches.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading branches...</p>
	{:else if branches.data && branches.data.length > 0}
		<div class="space-y-3">
			{#each branches.data as branch}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<span
								class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface) font-medium"
							>
								{formatLabels[branch.format] ?? branch.format}
							</span>
							<span class="text-xs px-2 py-1 rounded-full {statusColors[branch.status] ?? ''}">
								{branch.status.replace(/_/g, ' ')}
							</span>
							{#if branch.newsletterFlag}
								<span
									class="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200"
								>
									Newsletter
								</span>
							{/if}
						</div>
						<div class="flex items-center gap-1">
							{#if branch.confidenceScore !== undefined && branch.confidenceScore !== null}
								<span class="text-xs text-(--color-on-surface-muted)">
									{Math.round(branch.confidenceScore * 100)}%
								</span>
							{/if}
							<button
								onclick={() =>
									(expandedBranchId = expandedBranchId === branch._id ? null : branch._id)}
								class="text-xs text-(--color-brand) hover:underline"
							>
								{expandedBranchId === branch._id ? 'Collapse' : 'View'}
							</button>
						</div>
					</div>

					<!-- Expanded view -->
					{#if expandedBranchId === branch._id}
						<div class="space-y-3 pt-3 border-t border-(--color-border)">
							<!-- Draft content placeholder -->
							{#if branch.currentDraftId}
								<div class="bg-(--color-surface-dim) rounded-lg p-3">
									<p class="text-xs font-medium text-(--color-on-surface-muted) mb-1">
										Latest Draft
									</p>
									<p class="text-sm text-(--color-on-surface)">
										Draft loaded from Convex (ID: {branch.currentDraftId})
									</p>
								</div>
							{:else}
								<div class="bg-(--color-surface-dim) rounded-lg p-3 text-center">
									<p class="text-sm text-(--color-on-surface-muted)">
										No draft yet. Agent will write one.
									</p>
								</div>
							{/if}

							<!-- Actions -->
							{#if branch.status === 'in_review' || branch.status === 'draft'}
								<div class="flex flex-wrap gap-2">
									<button
										onclick={() => updateStatus(branch._id, 'approved')}
										class="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
									>
										Approve
									</button>
									<button
										onclick={() => updateStatus(branch._id, 'revision_requested')}
										class="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600"
									>
										Request Revision
									</button>
									<button
										onclick={() =>
											(commentingBranchId =
												commentingBranchId === branch._id ? null : branch._id)}
										class="px-3 py-1.5 rounded-lg border border-(--color-border) text-xs text-(--color-on-surface)"
									>
										Comment
									</button>
								</div>

								<!-- Quick feedback shortcuts -->
								<div class="flex flex-wrap gap-1.5">
									{#each quickFeedbackOptions as fb}
										<button
											onclick={() => quickFeedback(branch._id, fb.type)}
											class="text-xs px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-on-surface-muted) hover:bg-(--color-surface-container)"
										>
											{fb.label}
										</button>
									{/each}
								</div>
							{/if}

							{#if branch.status === 'approved'}
								<button
									onclick={() => updateStatus(branch._id, 'scheduled')}
									class="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700"
								>
									Schedule
								</button>
							{/if}

							<!-- Newsletter flag toggle -->
							<button
								onclick={async () => {
									await client.mutation(api.branches.toggleNewsletterFlag, {
										id: branch._id as any
									});
								}}
								class="text-xs px-2.5 py-1 rounded-full border transition-colors"
								class:border-violet-500={branch.newsletterFlag}
								class:bg-violet-100={branch.newsletterFlag}
								class:text-violet-800={branch.newsletterFlag}
								class:border-gray-300={!branch.newsletterFlag}
								class:text-gray-500={!branch.newsletterFlag}
							>
								{branch.newsletterFlag ? 'Flagged for newsletter' : 'Flag for newsletter'}
							</button>

							<!-- Comment input -->
							{#if commentingBranchId === branch._id}
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={commentBody}
										placeholder="Leave feedback..."
										class="flex-1 px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
										onkeydown={(e) => {
											if (e.key === 'Enter') submitComment(branch._id);
										}}
									/>
									<button
										onclick={() => submitComment(branch._id)}
										class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm"
									>
										Send
									</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-12 text-center"
		>
			<p class="text-3xl mb-2">🌿</p>
			<p class="text-(--color-on-surface-muted)">
				No branches yet. Approve a seed to start growing content.
			</p>
		</div>
	{/if}
</div>
