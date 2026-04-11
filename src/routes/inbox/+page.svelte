<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const client = useConvexClient();
	const items = useQuery(api.inbox.list, { status: 'pending' });
	const brands = useQuery(api.brands.listActive, {});
	const topics = $derived(
		selectedBrandId
			? useQuery(api.knowledge.listTopics, { brandId: selectedBrandId as any })
			: null
	);

	let selectedBrandId = $state<string | null>(null);
	let showAdd = $state(false);
	let addType = $state<'url' | 'note'>('url');
	let inputUrl = $state('');
	let inputTitle = $state('');
	let inputContent = $state('');
	let submitting = $state(false);
	let fetchingUrl = $state<string | null>(null);

	// Auto-select first brand
	$effect(() => {
		if (!selectedBrandId && brands.data?.length) {
			selectedBrandId = brands.data[0]._id;
		}
	});

	async function addItem() {
		if (!selectedBrandId) return;
		submitting = true;

		if (addType === 'url' && inputUrl.trim()) {
			const id = await client.mutation(api.inbox.addUrl, {
				brandId: selectedBrandId as any,
				url: inputUrl,
				title: inputTitle || undefined,
				sourcePlatform: undefined,
			});
			// Auto-fetch URL content
			fetchingUrl = id;
			try {
				await client.action(api.inbox.fetchUrl, { inboxId: id as any, url: inputUrl });
			} catch { /* silent */ }
			fetchingUrl = null;
		} else if (addType === 'note' && inputContent.trim()) {
			await client.mutation(api.inbox.addNote, {
				brandId: selectedBrandId as any,
				title: inputTitle || 'Quick note',
				content: inputContent,
			});
		}

		inputUrl = '';
		inputTitle = '';
		inputContent = '';
		showAdd = false;
		submitting = false;
	}

	async function dismissItem(id: string) {
		await client.mutation(api.inbox.dismiss, { id: id as any });
	}

	async function toSeed(id: string) {
		if (!selectedBrandId) return;
		await client.mutation(api.inbox.processToSeed, {
			id: id as any,
			brandId: selectedBrandId as any,
		});
	}

	let processingToTopic = $state<string | null>(null);
	let selectedTopicId = $state<string | null>(null);

	async function toSource(id: string) {
		if (!selectedBrandId || !selectedTopicId) return;
		await client.mutation(api.inbox.processToSource, {
			id: id as any,
			topicId: selectedTopicId as any,
			brandId: selectedBrandId as any,
		});
		processingToTopic = null;
		selectedTopicId = null;
	}

	const platformIcons: Record<string, string> = {
		reddit: '🟠', twitter: '🐦', linkedin: '💼', perplexity: '🔮',
		google_alert: '🔔', email: '📧', web: '🌐', manual: '✏️', newsletter: '📰'
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold text-(--color-on-surface)">Inbox</h2>
			<p class="text-sm text-(--color-on-surface-muted)">
				Drop URLs, forward emails, add notes — everything feeds the factory
			</p>
		</div>
		<button
			onclick={() => (showAdd = !showAdd)}
			class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium"
		>
			{showAdd ? 'Cancel' : '+ Add'}
		</button>
	</div>

	<!-- Add form -->
	{#if showAdd}
		<div class="bg-(--color-surface) rounded-xl border border-(--color-brand) p-4 space-y-3">
			<!-- Type toggle -->
			<div class="flex rounded-lg border border-(--color-border) overflow-hidden">
				<button
					onclick={() => (addType = 'url')}
					class="flex-1 py-2 text-sm font-medium text-center"
					class:bg-green-600={addType === 'url'}
					class:text-white={addType === 'url'}
					class:text-gray-500={addType !== 'url'}
				>
					URL / Link
				</button>
				<button
					onclick={() => (addType = 'note')}
					class="flex-1 py-2 text-sm font-medium text-center"
					class:bg-green-600={addType === 'note'}
					class:text-white={addType === 'note'}
					class:text-gray-500={addType !== 'note'}
				>
					Note
				</button>
			</div>

			{#if addType === 'url'}
				<input
					type="url"
					bind:value={inputUrl}
					placeholder="Paste any URL — article, Reddit thread, tweet, research..."
					class="w-full px-3 py-2.5 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
					onkeydown={(e) => { if (e.key === 'Enter') addItem(); }}
				/>
			{:else}
				<input
					type="text"
					bind:value={inputTitle}
					placeholder="Title or topic"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
				/>
				<textarea
					bind:value={inputContent}
					placeholder="Your thought, observation, or research finding..."
					rows="4"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm resize-none"
				></textarea>
			{/if}

			<button
				onclick={addItem}
				disabled={submitting || (addType === 'url' ? !inputUrl.trim() : !inputContent.trim())}
				class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white text-sm font-medium disabled:opacity-40"
			>
				{submitting ? 'Adding...' : addType === 'url' ? 'Fetch & Add' : 'Add Note'}
			</button>
		</div>
	{/if}

	<!-- Inbox items -->
	{#if items.isLoading}
		<p class="text-sm text-(--color-on-surface-muted)">Loading...</p>
	{:else if items.data && items.data.length > 0}
		<div class="space-y-3">
			{#each items.data as item}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) overflow-hidden">
					<div class="p-4 space-y-2">
						<div class="flex items-start gap-2">
							<span class="text-lg">{platformIcons[item.sourcePlatform ?? item.type] ?? '📥'}</span>
							<div class="flex-1 min-w-0">
								<h3 class="font-medium text-(--color-on-surface) text-sm line-clamp-2">
									{#if item.sourceUrl}
										<a href={item.sourceUrl} target="_blank" rel="noopener" class="hover:underline">
											{item.title}
										</a>
									{:else}
										{item.title}
									{/if}
								</h3>
								<div class="flex items-center gap-2 text-xs text-(--color-on-surface-muted) mt-0.5">
									<span>{item.type}</span>
									{#if item.sourcePlatform}
										<span>{item.sourcePlatform.replace(/_/g, ' ')}</span>
									{/if}
									{#if item.sourceEmail}
										<span>from {item.sourceEmail}</span>
									{/if}
									{#if item.content}
										<span>{Math.round(item.content.length / 1000)}k chars</span>
									{/if}
								</div>
							</div>
							{#if fetchingUrl === item._id}
								<span class="text-xs text-(--color-on-surface-muted)">Fetching...</span>
							{/if}
						</div>

						{#if item.content}
							<p class="text-xs text-(--color-on-surface-muted) line-clamp-3">{item.content.slice(0, 300)}</p>
						{/if}

						{#if item.agentNotes}
							<p class="text-xs text-(--color-brand) italic">{item.agentNotes}</p>
						{/if}

						<!-- Actions -->
						{#if processingToTopic === item._id}
							<div class="space-y-2 pt-2 border-t border-(--color-border)">
								<p class="text-xs font-medium text-(--color-on-surface-muted)">Add to which knowledge topic?</p>
								<select
									bind:value={selectedTopicId}
									class="w-full px-2 py-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-xs"
								>
									<option value={null}>Select topic...</option>
									{#if topics?.data}
										{#each topics.data as topic}
											<option value={topic._id}>{topic.name}</option>
										{/each}
									{/if}
								</select>
								<div class="flex gap-2">
									<button
										onclick={() => toSource(item._id)}
										disabled={!selectedTopicId}
										class="flex-1 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium disabled:opacity-40"
									>
										Add to Topic
									</button>
									<button
										onclick={() => (processingToTopic = null)}
										class="px-3 py-1.5 rounded-lg border border-(--color-border) text-xs"
									>
										Cancel
									</button>
								</div>
							</div>
						{:else}
							<div class="flex gap-2 pt-1">
								<button
									onclick={() => toSeed(item._id)}
									class="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-medium"
								>
									→ Seed
								</button>
								<button
									onclick={() => (processingToTopic = item._id)}
									class="flex-1 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium"
								>
									→ Knowledge
								</button>
								<button
									onclick={() => dismissItem(item._id)}
									class="px-3 py-2 rounded-lg border border-(--color-border) text-xs text-(--color-on-surface-muted)"
								>
									Dismiss
								</button>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center space-y-2">
			<p class="text-2xl">📥</p>
			<p class="text-(--color-on-surface-muted) text-sm">Inbox is empty</p>
			<p class="text-xs text-(--color-on-surface-muted)">
				Drop a URL, paste a note, or forward an email to feed the factory.
			</p>
		</div>
	{/if}
</div>
