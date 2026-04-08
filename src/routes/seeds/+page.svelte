<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const client = useConvexClient();
	const seeds = useQuery(api.seeds.list, {});
	const brands = useQuery(api.brands.listActive, {});

	let showNewSeed = $state(false);
	let newTitle = $state('');
	let newDescription = $state('');
	let selectedBrandId = $state<string | null>(null);
	let submitting = $state(false);
	let viewMode = $state<'list' | 'card'>('list');
	let cardIndex = $state(0);

	async function createSeed(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedBrandId) return;
		submitting = true;

		await client.mutation(api.seeds.create, {
			brandId: selectedBrandId as any,
			title: newTitle,
			description: newDescription,
			source: 'manual',
			pitchedBy: 'user'
		});

		newTitle = '';
		newDescription = '';
		showNewSeed = false;
		submitting = false;
	}

	async function updateSeedStatus(id: string, status: string) {
		await client.mutation(api.seeds.updateStatus, { id: id as any, status });
	}

	// Comment state
	let commentingSeedId = $state<string | null>(null);
	let commentBody = $state('');

	async function submitComment(seedId: string) {
		if (!commentBody.trim()) return;
		await client.mutation(api.comments.create, {
			targetType: 'seed',
			targetId: seedId,
			authoredBy: 'user',
			body: commentBody
		});
		commentBody = '';
		commentingSeedId = null;
	}

	async function quickFeedback(seedId: string, feedbackType: string) {
		await client.mutation(api.comments.create, {
			targetType: 'seed',
			targetId: seedId,
			authoredBy: 'user',
			body: feedbackType.replace(/_/g, ' '),
			isQuickFeedback: true,
			quickFeedbackType: feedbackType
		});
	}

	const statusColors: Record<string, string> = {
		pitched: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
	};

	const quickFeedbackOptions = [
		{ type: 'more_actionable', label: 'More actionable' },
		{ type: 'more_concise', label: 'More concise' },
		{ type: 'break_sections', label: 'Break into sections' },
		{ type: 'wrong_tone', label: 'Wrong tone' },
		{ type: 'add_hook', label: 'Add a hook' }
	];

	// Card mode navigation
	const activeSeedsList = $derived(
		seeds.data?.filter((s) => s.status === 'pitched' || s.status === 'under_review') ?? []
	);
	const currentCard = $derived(activeSeedsList[cardIndex]);

	function nextCard() {
		if (cardIndex < activeSeedsList.length - 1) cardIndex++;
	}
	function prevCard() {
		if (cardIndex > 0) cardIndex--;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold text-(--color-on-surface)">Seeds</h2>
			<p class="text-sm text-(--color-on-surface-muted)">Raw ideas waiting to grow</p>
		</div>
		<div class="flex items-center gap-2">
			<!-- View mode toggle -->
			<div class="flex rounded-lg border border-(--color-border) overflow-hidden">
				<button
					onclick={() => (viewMode = 'list')}
					class="px-3 py-1.5 text-xs font-medium transition-colors"
					class:bg-green-600={viewMode === 'list'}
					class:text-white={viewMode === 'list'}
					class:text-gray-500={viewMode !== 'list'}
				>
					List
				</button>
				<button
					onclick={() => {
						viewMode = 'card';
						cardIndex = 0;
					}}
					class="px-3 py-1.5 text-xs font-medium transition-colors"
					class:bg-green-600={viewMode === 'card'}
					class:text-white={viewMode === 'card'}
					class:text-gray-500={viewMode !== 'card'}
				>
					Card
				</button>
			</div>
			<button
				onclick={() => (showNewSeed = !showNewSeed)}
				class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-dark) transition-colors"
			>
				{showNewSeed ? 'Cancel' : '+ Plant Seed'}
			</button>
		</div>
	</div>

	<!-- New seed form -->
	{#if showNewSeed}
		<form
			onsubmit={createSeed}
			class="bg-(--color-surface) rounded-xl border border-(--color-brand) p-4 space-y-3"
		>
			<div>
				<label class="block text-sm font-medium text-(--color-on-surface) mb-1" for="seed-brand"
					>Brand</label
				>
				<select
					id="seed-brand"
					bind:value={selectedBrandId}
					required
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
			<div>
				<label class="block text-sm font-medium text-(--color-on-surface) mb-1" for="seed-title"
					>Title</label
				>
				<input
					id="seed-title"
					type="text"
					bind:value={newTitle}
					required
					placeholder="What's the idea?"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium text-(--color-on-surface) mb-1" for="seed-desc"
					>Description</label
				>
				<textarea
					id="seed-desc"
					bind:value={newDescription}
					required
					rows="3"
					placeholder="Describe the seed... what could grow from this?"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-none"
				></textarea>
			</div>
			<button
				type="submit"
				disabled={submitting}
				class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white font-medium hover:bg-(--color-brand-dark) transition-colors disabled:opacity-50"
			>
				{submitting ? 'Planting...' : 'Plant Seed'}
			</button>
		</form>
	{/if}

	{#if seeds.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading seeds...</p>
	{:else if seeds.data && seeds.data.length > 0}
		<!-- ═══ CARD MODE ═══ -->
		{#if viewMode === 'card'}
			{#if activeSeedsList.length > 0 && currentCard}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-6 space-y-4">
					<div class="flex items-center justify-between text-xs text-(--color-on-surface-muted)">
						<span>{cardIndex + 1} of {activeSeedsList.length}</span>
						<span class="px-2 py-1 rounded-full {statusColors[currentCard.status] ?? ''}">
							{currentCard.status.replace('_', ' ')}
						</span>
					</div>

					<div>
						<h3 class="text-lg font-bold text-(--color-on-surface)">{currentCard.title}</h3>
						<p class="text-sm text-(--color-on-surface-muted) mt-2">{currentCard.description}</p>
					</div>

					<div class="text-xs text-(--color-on-surface-muted)">
						{currentCard.source} &middot; by {currentCard.pitchedBy}
					</div>

					<!-- Action buttons -->
					<div class="flex gap-2 pt-2 border-t border-(--color-border)">
						<button
							onclick={() => {
								updateSeedStatus(currentCard._id, 'approved');
								nextCard();
							}}
							class="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
						>
							Develop
						</button>
						<button
							onclick={() => {
								updateSeedStatus(currentCard._id, 'rejected');
								nextCard();
							}}
							class="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
						>
							Reject
						</button>
						<button
							onclick={() => (commentingSeedId = currentCard._id)}
							class="flex-1 py-2.5 rounded-lg border border-(--color-border) text-(--color-on-surface) text-sm font-medium hover:bg-(--color-surface-container)"
						>
							Comment
						</button>
					</div>

					<!-- Quick feedback -->
					<div class="flex flex-wrap gap-1.5">
						{#each quickFeedbackOptions as fb}
							<button
								onclick={() => quickFeedback(currentCard._id, fb.type)}
								class="text-xs px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-on-surface-muted) hover:bg-(--color-surface-container) hover:text-(--color-on-surface)"
							>
								{fb.label}
							</button>
						{/each}
					</div>

					<!-- Comment input -->
					{#if commentingSeedId === currentCard._id}
						<div class="flex gap-2">
							<input
								type="text"
								bind:value={commentBody}
								placeholder="Leave feedback..."
								class="flex-1 px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
								onkeydown={(e) => {
									if (e.key === 'Enter') submitComment(currentCard._id);
								}}
							/>
							<button
								onclick={() => submitComment(currentCard._id)}
								class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm"
							>
								Send
							</button>
						</div>
					{/if}

					<!-- Card navigation -->
					<div class="flex justify-between pt-2">
						<button
							onclick={prevCard}
							disabled={cardIndex === 0}
							class="px-4 py-1.5 rounded-lg text-sm text-(--color-on-surface-muted) hover:bg-(--color-surface-container) disabled:opacity-30"
						>
							&larr; Prev
						</button>
						<button
							onclick={nextCard}
							disabled={cardIndex >= activeSeedsList.length - 1}
							class="px-4 py-1.5 rounded-lg text-sm text-(--color-on-surface-muted) hover:bg-(--color-surface-container) disabled:opacity-30"
						>
							Next &rarr;
						</button>
					</div>
				</div>
			{:else}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-8 text-center">
					<p class="text-(--color-on-surface-muted)">No seeds to review in card mode.</p>
				</div>
			{/if}

			<!-- ═══ LIST MODE ═══ -->
		{:else}
			<div class="space-y-3">
				{#each seeds.data as seed}
					<div
						class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand)/30 transition-colors"
					>
						<div class="flex items-start justify-between gap-3">
							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-(--color-on-surface)">{seed.title}</h3>
								<p class="text-sm text-(--color-on-surface-muted) mt-1 line-clamp-2">
									{seed.description}
								</p>
							</div>
							<span
								class="text-xs px-2 py-1 rounded-full shrink-0 {statusColors[seed.status] ?? ''}"
							>
								{seed.status.replace('_', ' ')}
							</span>
						</div>

						<div class="flex items-center gap-3 mt-3 text-xs text-(--color-on-surface-muted)">
							<span>{seed.source}</span>
							<span>by {seed.pitchedBy}</span>
						</div>

						<!-- Actions for pitched/under_review seeds -->
						{#if seed.status === 'pitched' || seed.status === 'under_review'}
							<div class="flex gap-2 mt-3 pt-3 border-t border-(--color-border)">
								<button
									onclick={() => updateSeedStatus(seed._id, 'approved')}
									class="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
								>
									Develop
								</button>
								<button
									onclick={() => updateSeedStatus(seed._id, 'rejected')}
									class="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600"
								>
									Reject
								</button>
								<button
									onclick={() =>
										(commentingSeedId = commentingSeedId === seed._id ? null : seed._id)}
									class="px-3 py-1.5 rounded-lg border border-(--color-border) text-xs text-(--color-on-surface) hover:bg-(--color-surface-container)"
								>
									Comment
								</button>
								<!-- Quick feedback shortcuts -->
								{#each quickFeedbackOptions as fb}
									<button
										onclick={() => quickFeedback(seed._id, fb.type)}
										class="hidden sm:inline px-2 py-1.5 rounded-lg text-xs border border-(--color-border) text-(--color-on-surface-muted) hover:bg-(--color-surface-container)"
										title={fb.label}
									>
										{fb.label}
									</button>
								{/each}
							</div>
						{/if}

						<!-- Comment input -->
						{#if commentingSeedId === seed._id}
							<div class="flex gap-2 mt-2">
								<input
									type="text"
									bind:value={commentBody}
									placeholder="Leave feedback..."
									class="flex-1 px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
									onkeydown={(e) => {
										if (e.key === 'Enter') submitComment(seed._id);
									}}
								/>
								<button
									onclick={() => submitComment(seed._id)}
									class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm"
								>
									Send
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<div
			class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-12 text-center"
		>
			<p class="text-3xl mb-2">🌱</p>
			<p class="text-(--color-on-surface-muted)">No seeds yet. Plant your first idea!</p>
		</div>
	{/if}
</div>
