<script lang="ts">
	import { page } from '$app/state';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import KnowledgeGraph from '$lib/components/KnowledgeGraph.svelte';

	const client = useConvexClient();
	const topicId = $derived(page.params.topicId);

	const topic = useQuery(api.knowledge.getTopic, () => ({ id: topicId as any }));
	const sources = useQuery(api.knowledge.listSources, () => ({ topicId: topicId as any }));
	const pages = useQuery(api.knowledge.listPages, () => ({ topicId: topicId as any }));
	const catalysts = useQuery(api.knowledge.listCatalysts, () => ({ topicId: topicId as any }));

	let activeTab = $state<'sources' | 'pages' | 'catalysts' | 'graph'>('sources');

	// YouTube search state
	let showSearch = $state(false);
	let searchQuery = $state('');
	let searchResults = $state<any[]>([]);
	let searching = $state(false);
	let ingesting = $state<Set<string>>(new Set());

	async function searchYouTube() {
		if (!searchQuery.trim()) return;
		searching = true;
		searchResults = [];
		try {
			const results = await client.action(api.youtube.search, {
				query: searchQuery,
				maxResults: 15
			});
			searchResults = results;
		} catch (err) {
			console.error('YouTube search failed:', err);
		}
		searching = false;
	}

	async function ingestVideo(video: any) {
		if (!topic.data) return;
		const next = new Set(ingesting);
		next.add(video.videoId);
		ingesting = next;

		try {
			await client.action(api.youtube.ingestVideo, {
				topicId: topicId as any,
				brandId: topic.data.brandId,
				videoId: video.videoId,
				title: video.title,
				channelId: video.channelId,
				channelName: video.channelName,
				viewCount: video.viewCount,
				likeCount: video.likeCount,
				commentCount: video.commentCount,
				durationSeconds: video.duration,
				publishedAt: video.publishedAt,
				thumbnailUrl: video.thumbnailUrl,
				resonanceScore: video.resonanceScore
			});
		} catch (err) {
			console.error('Ingest failed:', err);
		}

		const done = new Set(ingesting);
		done.delete(video.videoId);
		ingesting = done;
	}

	async function removeSource(id: string) {
		await client.mutation(api.knowledge.removeSource, { id: id as any });
	}

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function formatViews(n: number): string {
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
		return n.toString();
	}

	// Pre-fill search from topic search terms
	$effect(() => {
		if (topic.data && !searchQuery && topic.data.searchTerms.length > 0) {
			searchQuery = topic.data.searchTerms[0];
		}
	});
</script>

<div class="space-y-4">
	<div>
		<a href="/knowledge" class="text-sm text-(--color-brand) hover:underline">&larr; Knowledge</a>
		<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">
			{topic.data?.name ?? 'Loading...'}
		</h2>
		{#if topic.data?.description}
			<p class="text-sm text-(--color-on-surface-muted)">{topic.data.description}</p>
		{/if}
	</div>

	<!-- Tabs -->
	<div class="flex gap-1 rounded-lg border border-(--color-border) overflow-hidden">
		{#each ['sources', 'pages', 'catalysts', 'graph'] as tab}
			<button
				onclick={() => (activeTab = tab as any)}
				class="flex-1 py-2 text-xs font-medium text-center transition-colors"
				class:bg-green-600={activeTab === tab}
				class:text-white={activeTab === tab}
				class:text-gray-500={activeTab !== tab}
			>
				{tab === 'sources' ? `Sources (${sources.data?.length ?? 0})` : ''}
				{tab === 'pages' ? `Wiki (${pages.data?.length ?? 0})` : ''}
				{tab === 'catalysts' ? `Catalysts (${catalysts.data?.length ?? 0})` : ''}
				{tab === 'graph' ? 'Graph' : ''}
			</button>
		{/each}
	</div>

	<!-- ═══ SOURCES TAB ═══ -->
	{#if activeTab === 'sources'}
		<div class="space-y-3">
			<button
				onclick={() => (showSearch = !showSearch)}
				class="w-full py-2.5 rounded-lg border-2 border-dashed border-(--color-border) text-sm text-(--color-on-surface-muted) hover:border-(--color-brand) transition-colors"
			>
				{showSearch ? 'Hide Search' : 'Search YouTube'}
			</button>

			{#if showSearch}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-brand) p-4 space-y-3">
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search YouTube..."
							class="flex-1 px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
							onkeydown={(e) => { if (e.key === 'Enter') searchYouTube(); }}
						/>
						<button
							onclick={searchYouTube}
							disabled={searching}
							class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium disabled:opacity-50"
						>
							{searching ? 'Searching...' : 'Search'}
						</button>
					</div>

					<!-- Quick search terms from topic -->
					{#if topic.data?.searchTerms.length}
						<div class="flex flex-wrap gap-1.5">
							{#each topic.data.searchTerms as term}
								<button
									onclick={() => { searchQuery = term; searchYouTube(); }}
									class="text-xs px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-on-surface-muted) hover:border-(--color-brand) hover:text-(--color-on-surface)"
								>
									{term}
								</button>
							{/each}
						</div>
					{/if}

					<!-- Search results -->
					{#if searchResults.length > 0}
						<div class="space-y-2 max-h-96 overflow-y-auto">
							{#each searchResults as video}
								<div class="flex gap-3 p-2 rounded-lg hover:bg-(--color-surface-dim)">
									{#if video.thumbnailUrl}
										<img
											src={video.thumbnailUrl}
											alt=""
											class="w-24 h-16 rounded object-cover shrink-0"
										/>
									{/if}
									<div class="flex-1 min-w-0">
										<h4 class="text-sm font-medium text-(--color-on-surface) line-clamp-2">
											{video.title}
										</h4>
										<div class="flex items-center gap-2 text-xs text-(--color-on-surface-muted) mt-0.5">
											<span>{video.channelName}</span>
											<span>{formatViews(video.viewCount)} views</span>
											<span>{formatDuration(video.duration)}</span>
										</div>
										<div class="flex items-center gap-2 mt-1">
											<span
												class="text-xs px-1.5 py-0.5 rounded font-medium"
												class:bg-green-100={video.resonanceScore >= 70}
												class:text-green-700={video.resonanceScore >= 70}
												class:bg-yellow-100={video.resonanceScore >= 40 && video.resonanceScore < 70}
												class:text-yellow-700={video.resonanceScore >= 40 && video.resonanceScore < 70}
												class:bg-gray-100={video.resonanceScore < 40}
												class:text-gray-600={video.resonanceScore < 40}
											>
												Score: {video.resonanceScore}
											</span>
											<button
												onclick={() => ingestVideo(video)}
												disabled={ingesting.has(video.videoId)}
												class="text-xs px-2.5 py-1 rounded-lg bg-(--color-brand) text-white font-medium disabled:opacity-50"
											>
												{ingesting.has(video.videoId) ? 'Ingesting...' : 'Ingest'}
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Existing sources -->
			{#if sources.data && sources.data.length > 0}
				{#each sources.data as source}
					<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
						<div class="flex gap-3">
							{#if source.thumbnailUrl}
								<img
									src={source.thumbnailUrl}
									alt=""
									class="w-20 h-14 rounded object-cover shrink-0"
								/>
							{/if}
							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between gap-2">
									<div>
										<h4 class="font-medium text-(--color-on-surface) text-sm line-clamp-1">
											{source.title}
										</h4>
										<div class="flex items-center gap-2 text-xs text-(--color-on-surface-muted) mt-0.5">
											{#if source.youtubeChannelName}
												<span>{source.youtubeChannelName}</span>
											{/if}
											{#if source.viewCount}
												<span>{formatViews(source.viewCount)} views</span>
											{/if}
											{#if source.resonanceScore}
												<span
													class="px-1.5 py-0.5 rounded font-medium"
													class:bg-green-100={source.resonanceScore >= 70}
													class:text-green-700={source.resonanceScore >= 70}
													class:bg-yellow-100={source.resonanceScore < 70}
													class:text-yellow-700={source.resonanceScore < 70}
												>
													{source.resonanceScore}
												</span>
											{/if}
										</div>
									</div>
									<div class="flex items-center gap-2 shrink-0">
										<span
											class="text-xs px-2 py-0.5 rounded-full"
											class:bg-green-100={source.transcript}
											class:text-green-700={source.transcript}
											class:bg-gray-100={!source.transcript}
											class:text-gray-500={!source.transcript}
										>
											{source.transcript ? 'Has transcript' : 'No transcript'}
										</span>
										<button
											onclick={() => removeSource(source._id)}
											class="text-xs text-red-500 hover:underline"
										>
											Remove
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
					<p class="text-(--color-on-surface-muted)">No sources yet. Search YouTube to start ingesting.</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- ═══ WIKI PAGES TAB ═══ -->
	{#if activeTab === 'pages'}
		{#if pages.data && pages.data.length > 0}
			<div class="space-y-3">
				{#each pages.data as wikiPage}
					<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
						<h4 class="font-semibold text-(--color-on-surface)">{wikiPage.title}</h4>
						<pre class="text-sm text-(--color-on-surface-muted) whitespace-pre-wrap font-sans mt-2 max-h-48 overflow-y-auto">{wikiPage.content}</pre>
						<div class="flex items-center gap-2 mt-2 text-xs text-(--color-on-surface-muted)">
							<span>v{wikiPage.version}</span>
							<span>{wikiPage.sourceIds.length} sources</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
				<p class="text-(--color-on-surface-muted)">
					No compiled pages yet. Add sources, then the agent will compile them into wiki articles.
				</p>
			</div>
		{/if}
	{/if}

	<!-- ═══ CATALYSTS TAB ═══ -->
	{#if activeTab === 'catalysts'}
		{#if catalysts.data && catalysts.data.length > 0}
			<div class="space-y-2">
				{#each catalysts.data as catalyst}
					<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
						<p class="text-sm text-(--color-on-surface) italic">"{catalyst.question}"</p>
					</div>
				{/each}
			</div>
		{:else}
			<div class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center">
				<p class="text-(--color-on-surface-muted)">
					No catalysts yet. These are generated when the agent compiles your sources into wiki pages.
				</p>
			</div>
		{/if}
	{/if}

	<!-- ═══ GRAPH TAB ═══ -->
	{#if activeTab === 'graph'}
		<KnowledgeGraph
			sources={sources.data ?? []}
			pages={pages.data ?? []}
			catalysts={catalysts.data ?? []}
			topicName={topic.data?.name ?? ''}
		/>
	{/if}
</div>
