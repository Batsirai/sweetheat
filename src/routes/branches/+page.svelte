<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const branches = useQuery(api.branches.list, {});

	const statusColors: Record<string, string> = {
		draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
		in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		revision_requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
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
				<div
					class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4"
				>
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<span
								class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface) font-medium"
							>
								{formatLabels[branch.format] ?? branch.format}
							</span>
							<span class="text-xs px-2 py-1 rounded-full {statusColors[branch.status] ?? ''}">
								{branch.status.replace('_', ' ')}
							</span>
						</div>
						{#if branch.confidenceScore !== undefined}
							<span class="text-xs text-(--color-on-surface-muted)">
								{Math.round((branch.confidenceScore ?? 0) * 100)}% confidence
							</span>
						{/if}
					</div>
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
