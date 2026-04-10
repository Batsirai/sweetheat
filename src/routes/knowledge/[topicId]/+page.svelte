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

	// Paste URL ingest
	let pasteUrl = $state('');
	let pasteIngesting = $state(false);
	let pasteError = $state('');

	function extractVideoId(input: string): string | null {
		const trimmed = input.trim();
		// Direct video ID (11 chars)
		if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
		// youtube.com/watch?v=ID
		const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
		if (watchMatch) return watchMatch[1];
		// youtu.be/ID
		const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
		if (shortMatch) return shortMatch[1];
		// youtube.com/shorts/ID
		const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
		if (shortsMatch) return shortsMatch[1];
		// youtube.com/embed/ID
		const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
		if (embedMatch) return embedMatch[1];
		return null;
	}

	async function ingestFromUrl() {
		if (!topic.data || !pasteUrl.trim()) return;
		pasteError = '';
		const videoId = extractVideoId(pasteUrl);
		if (!videoId) {
			pasteError = 'Could not find a YouTube video ID in that URL.';
			return;
		}
		pasteIngesting = true;
		try {
			await client.action(api.youtube.ingestVideo, {
				topicId: topicId as any,
				brandId: topic.data.brandId,
				videoId,
				title: `YouTube video ${videoId}` // Will be replaced by metadata from transcript API
			});
			pasteUrl = '';
		} catch (err) {
			pasteError = `Ingest failed: ${err}`;
		}
		pasteIngesting = false;
	}

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

	// Compiler
	let compiling = $state(false);
	let compileResult = $state<any>(null);
	let compileError = $state('');

	async function compileTopic() {
		compiling = true;
		compileResult = null;
		compileError = '';
		try {
			const result = await client.action(api.compiler.compileTopic, {
				topicId: topicId as any
			});
			compileResult = result;
		} catch (err: any) {
			compileError = err.message ?? 'Compilation failed';
		}
		compiling = false;
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
	<div class="flex items-start justify-between gap-3">
		<div>
			<a href="/knowledge" class="text-sm text-(--color-brand) hover:underline">&larr; Knowledge</a>
			<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">
				{topic.data?.name ?? 'Loading...'}
			</h2>
			{#if topic.data?.description}
				<p class="text-sm text-(--color-on-surface-muted)">{topic.data.description}</p>
			{/if}
		</div>
		<button
			onclick={compileTopic}
			disabled={compiling}
			class="shrink-0 mt-6 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
			class:bg-purple-600={!compiling}
			class:text-white={!compiling}
			class:bg-purple-100={compiling}
			class:text-purple-700={compiling}
		>
			{#if compiling}
				<span class="flex items-center gap-2">
					<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
						<path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
					</svg>
					Compiling...
				</span>
			{:else}
				Compile Wiki
			{/if}
		</button>
	</div>

	<!-- Compile result -->
	{#if compileResult}
		<div class="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm space-y-1">
			<p class="font-medium text-green-800 dark:text-green-200">Compilation complete!</p>
			<div class="flex flex-wrap gap-3 text-green-700 dark:text-green-300 text-xs">
				<span>{compileResult.sourcesSummarized} sources summarized</span>
				<span>{compileResult.articlesCompiled} articles compiled</span>
				<span>{compileResult.catalystsGenerated} catalysts generated</span>
				<span>{compileResult.ideasGenerated} idea briefs created</span>
			</div>
		</div>
	{/if}
	{#if compileError}
		<div class="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm">
			<p class="text-red-700 dark:text-red-300">{compileError}</p>
		</div>
	{/if}

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
			<!-- Pipeline status -->
			{#if sources.data && sources.data.length > 0}
				{@const withTranscript = sources.data.filter((s) => s.transcript).length}
				{@const withoutTranscript = sources.data.length - withTranscript}
				<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
					<h3 class="text-xs font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">Pipeline Status</h3>
					<div class="flex gap-4 text-sm">
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-green-500"></span>
							<span class="text-(--color-on-surface)">{withTranscript} with transcript</span>
						</div>
						{#if withoutTranscript > 0}
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 rounded-full bg-yellow-500"></span>
								<span class="text-(--color-on-surface)">{withoutTranscript} no transcript</span>
							</div>
						{/if}
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-purple-500"></span>
							<span class="text-(--color-on-surface)">{pages.data?.length ?? 0} wiki pages compiled</span>
						</div>
					</div>
					<!-- Next steps -->
					<div class="text-xs text-(--color-on-surface-muted) bg-(--color-surface-dim) rounded-lg p-3 space-y-1">
						<p class="font-medium text-(--color-on-surface)">What happens next:</p>
						{#if withTranscript === 0}
							<p>1. Ingest videos with transcripts available</p>
							<p>2. Agent compiles transcripts into wiki articles</p>
							<p>3. Catalysts and content idea briefs are generated</p>
						{:else if (pages.data?.length ?? 0) === 0}
							<p>Sources are ready. On the next agent run, the compiler will:</p>
							<p>1. Summarize each transcript</p>
							<p>2. Extract key concepts and entities</p>
							<p>3. Write interconnected wiki articles</p>
							<p>4. Generate catalysts (thematic questions for content ideas)</p>
							<p>5. Produce content idea briefs you can plant as seeds</p>
						{:else}
							<p>Wiki is compiled. Check the Wiki and Catalysts tabs, or go to Knowledge to see ready idea briefs.</p>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Paste YouTube URL -->
			<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-2">
				<p class="text-xs font-medium text-(--color-on-surface-muted)">Paste a YouTube link to ingest</p>
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={pasteUrl}
						placeholder="https://youtube.com/watch?v=... or youtu.be/..."
						class="flex-1 px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
						onkeydown={(e) => { if (e.key === 'Enter') ingestFromUrl(); }}
					/>
					<button
						onclick={ingestFromUrl}
						disabled={pasteIngesting || !pasteUrl.trim()}
						class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium disabled:opacity-50"
					>
						{pasteIngesting ? 'Ingesting...' : 'Ingest'}
					</button>
				</div>
				{#if pasteError}
					<p class="text-xs text-red-500">{pasteError}</p>
				{/if}
			</div>

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
					<div class="bg-(--color-surface) rounded-xl border border-(--color-border) overflow-hidden">
						<div class="p-4">
							<div class="flex gap-3">
								{#if source.thumbnailUrl}
									<a href={source.url} target="_blank" rel="noopener" class="shrink-0">
										<img
											src={source.thumbnailUrl}
											alt=""
											class="w-28 h-20 rounded object-cover"
										/>
									</a>
								{/if}
								<div class="flex-1 min-w-0">
									<a href={source.url} target="_blank" rel="noopener" class="hover:underline">
										<h4 class="font-medium text-(--color-on-surface) text-sm line-clamp-2">
											{source.title}
										</h4>
									</a>
									<div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-(--color-on-surface-muted) mt-1">
										{#if source.youtubeChannelName}
											<span class="font-medium">{source.youtubeChannelName}</span>
										{/if}
										{#if source.viewCount}
											<span>{formatViews(source.viewCount)} views</span>
										{/if}
										{#if source.durationSeconds}
											<span>{formatDuration(source.durationSeconds)}</span>
										{/if}
										{#if source.publishedAt}
											<span>{new Date(source.publishedAt).toLocaleDateString()}</span>
										{/if}
									</div>
									<div class="flex items-center gap-2 mt-1.5">
										{#if source.resonanceScore}
											<span
												class="text-xs px-1.5 py-0.5 rounded font-medium"
												class:bg-green-100={source.resonanceScore >= 70}
												class:text-green-700={source.resonanceScore >= 70}
												class:bg-yellow-100={source.resonanceScore < 70}
												class:text-yellow-700={source.resonanceScore < 70}
											>
												Score: {source.resonanceScore}
											</span>
										{/if}
										<span
											class="text-xs px-1.5 py-0.5 rounded-full"
											class:bg-green-100={source.transcript}
											class:text-green-700={source.transcript}
											class:bg-red-100={!source.transcript}
											class:text-red-600={!source.transcript}
										>
											{source.transcript ? `${Math.round(source.transcript.length / 1000)}k chars` : 'No transcript'}
										</span>
										<button
											onclick={() => removeSource(source._id)}
											class="text-xs text-red-500 hover:underline ml-auto"
										>
											Remove
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Abstract -->
						{#if source.abstract}
							<div class="px-4 pb-3 border-t border-(--color-border) pt-2">
								<p class="text-xs text-(--color-on-surface-muted) leading-relaxed">{source.abstract}</p>
							</div>
						{/if}

						<!-- Content layers (expandable) -->
						{#if source.transcript || source.summary}
							<div class="border-t border-(--color-border)">
								{#if source.summary}
									<details>
										<summary class="px-4 py-2 text-xs text-(--color-on-surface-muted) cursor-pointer hover:bg-(--color-surface-dim) flex items-center gap-2">
											<span class="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
											LLM Summary (structured extraction)
										</summary>
										<div class="px-4 pb-3 max-h-64 overflow-y-auto">
											<pre class="text-xs text-(--color-on-surface-muted) whitespace-pre-wrap font-sans leading-relaxed">{source.summary}</pre>
										</div>
									</details>
								{/if}
								{#if source.transcript}
									<details>
										<summary class="px-4 py-2 text-xs text-(--color-on-surface-muted) cursor-pointer hover:bg-(--color-surface-dim) flex items-center gap-2">
											<span class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
											Raw Transcript ({Math.round(source.transcript.length / 1000)}k chars)
										</summary>
										<div class="px-4 pb-3 max-h-80 overflow-y-auto">
											<pre class="text-xs text-(--color-on-surface-muted) whitespace-pre-wrap font-sans leading-relaxed">{source.transcript}</pre>
										</div>
									</details>
								{/if}
							</div>
						{/if}
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
