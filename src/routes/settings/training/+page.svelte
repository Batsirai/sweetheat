<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import mammoth from 'mammoth';

	const client = useConvexClient();
	const brands = useQuery(api.brands.listActive, {});

	let selectedBrandId = $state<string | null>(null);

	const training = $derived(
		selectedBrandId ? useQuery(api.training.list, { brandId: selectedBrandId as any }) : null
	);

	const selectedBrand = $derived(brands.data?.find((b) => b._id === selectedBrandId));

	let submitting = $state(false);
	let copiedPrompt = $state<string | null>(null);
	let expandedSection = $state<string | null>(null);

	// Per-section editing state
	let editingId = $state<string | null>(null);
	let editContent = $state('');
	let pasteContent = $state('');
	let uploadStatus = $state('');

	const sections = [
		{
			id: 'voice-identity',
			layer: 'voice_general',
			title: 'Brand Voice & Identity',
			question: 'Who is this brand and how does it speak?',
			icon: '🎙️',
			prompt: (brand: string) =>
				`I'm setting up a content production system for my brand "${brand}". I need you to create a detailed brand voice training document. Please cover:

1. **Brand Identity**: Who is ${brand}? What does it stand for? What's the mission?
2. **Target Audience**: Who are we speaking to? What are their pain points, desires, and demographics?
3. **Voice & Tone**: How does ${brand} sound? (e.g., warm, direct, playful, authoritative). Give 5-6 adjectives that describe the voice.
4. **Writing Style**: Short sentences or long? Formal or casual? First person or third? Use of humor?
5. **Vocabulary**: Words and phrases we ALWAYS use. Words we NEVER use. Industry jargon level.
6. **Current Interests**: What topics are we focused on right now? What are our content pillars?
7. **Example Content**: Write 3 short example posts that perfectly capture this voice.

Format this as a markdown document I can paste into my content system.`
		},
		{
			id: 'best-content',
			layer: 'voice_general',
			title: 'Best Content Examples',
			question: 'What does our best content look like?',
			icon: '⭐',
			prompt: (brand: string) =>
				`For my brand "${brand}", I need you to analyze my best-performing content and create a training document. Please:

1. List my top 10 best pieces of content (posts, articles, videos) and explain WHY each one worked
2. Identify patterns: what hooks, structures, topics, and formats consistently perform well?
3. Extract the "voice DNA" - the specific writing patterns, sentence structures, and rhetorical devices that make my content distinctly mine
4. Note any evolution in voice over time
5. Create a "golden rules" list: 5-8 principles that my best content always follows

Format as markdown. This will train an AI agent to write in my voice.`
		},
		{
			id: 'voice-drift',
			layer: 'voice_general',
			title: 'Voice Drift & Anti-Patterns',
			question: 'What does WRONG content look like for this brand?',
			icon: '🚫',
			prompt: (brand: string) =>
				`For my brand "${brand}", I need a "voice drift" training document — a guide to what BAD content looks like so the AI agent knows what to avoid. Please cover:

1. **Common AI Slop**: Generic phrases, filler sentences, and patterns that make content feel AI-generated rather than human. Give 10 specific examples of lines the agent should NEVER write.
2. **Voice Drift Examples**: Write 5 short posts that LOOK like they could be from ${brand} but are subtly wrong — too corporate, too casual, too preachy, too generic, etc. Explain what's wrong with each.
3. **Tone Traps**: Specific tones that are close to our voice but wrong. (e.g., "motivational speaker" when we want "honest friend", "corporate wellness" when we want "real talk")
4. **Overused Patterns**: Cliches, hooks, and structures that are played out in our space. Things we've seen too many times.
5. **Red Lines**: Content approaches that would actively damage the brand. Topics, framings, or styles that are off-limits and why.
6. **Before/After Pairs**: Give 5 pairs showing a drifted version and the corrected version side by side, with notes on what changed.

This is as important as knowing what good looks like. Format as markdown.`
		},
		{
			id: 'ideation',
			layer: 'spark_generation',
			title: 'Content Ideation Strategy',
			question: 'Where do our best content ideas come from?',
			icon: '💡',
			prompt: (brand: string) =>
				`For my brand "${brand}", I need a training document for an AI agent that generates content ideas (we call them "seeds"). Cover:

1. **Audience Questions**: What are the top 20 questions our audience asks? What pain points do they bring to us?
2. **Content Pillars**: What are the 4-6 main themes we publish about? For each, what angles are fresh vs. overdone?
3. **Remix Opportunities**: Which of our existing content could be remixed into new formats or updated with fresh takes?
4. **Industry Radar**: What trends, tools, or changes in our industry should we be reacting to?
5. **Selection Criteria**: What makes a GOOD idea for ${brand}? What should the agent pitch vs. skip?
6. **Idea Quality Bar**: Give 5 examples of ideas I'd approve and 5 I'd reject, with reasoning for each.

Format as markdown training document.`
		},
		{
			id: 'platforms',
			layer: 'platform_specific',
			title: 'Platform Style Guide',
			question: 'How should content differ per platform?',
			icon: '📱',
			prompt: (brand: string) =>
				`For my brand "${brand}", create a platform-specific style guide. For EACH platform we publish to, cover:

**Twitter/X**: Tone adjustments, thread structure, hook patterns, character optimization, hashtag strategy, engagement style
**LinkedIn**: Professional framing, storytelling approach, formatting (line breaks, emoji use), CTA style
**Instagram**: Caption structure, hashtag strategy, carousel text approach, stories tone
**Pinterest**: Pin title patterns, description SEO, keyword approach
**TikTok**: Script tone, hook timing, CTA style, caption approach
**Blog**: Article structure, SEO approach, internal linking, section headers, length
**YouTube**: Script style, thumbnail text, description approach

For each platform, give 2 examples of how the SAME idea would be adapted differently.

Format as markdown.`
		},
		{
			id: 'formats',
			layer: 'format_specific',
			title: 'Content Format Templates',
			question: 'What are the rules for each content format?',
			icon: '📐',
			prompt: (brand: string) =>
				`For my brand "${brand}", create format-specific production rules. For EACH format, define:

**Tweet/Thread**: Structure, hook patterns, thread pacing, character optimization, CTA placement
**Blog Article**: Section structure, intro pattern, SEO meta approach, ideal length, heading style
**Image Carousel**: Slides per carousel, text per slide, visual direction, cover slide hook, CTA slide
**Quote Card**: Quote selection criteria, text layout, when to use original vs. sourced quotes
**Short Video Script (Reels/Shorts/TikTok)**: Hook timing (first 3 seconds), body pacing, CTA, on-screen text, visual direction
**Long Video Script (YouTube)**: Intro structure, section breakdown, B-roll notes, retention hooks, outro
**Newsletter Section**: Tone shift from social, personal touch level, section structure, CTA approach
**Pinterest Pin**: Title pattern, description keywords, alt text, link strategy

Format as markdown.`
		}
	];

	// Find existing modules for a section — match by layer
	// For voice_general (which has multiple sections), match by title keyword
	function getModulesForSection(sectionId: string) {
		if (!training?.data) return [];
		const section = sections.find((s) => s.id === sectionId);
		if (!section) return [];

		// For layers with only one section, match all docs in that layer
		const sectionsInLayer = sections.filter((s) => s.layer === section.layer);
		if (sectionsInLayer.length === 1) {
			return training.data.filter((t) => t.layer === section.layer);
		}

		// For voice_general (multiple sections), try title matching
		const titleKeywords: Record<string, string[]> = {
			'voice-identity': ['voice', 'identity', 'brand', 'tone', 'general'],
			'best-content': ['best', 'example', 'content', 'golden'],
			'voice-drift': ['drift', 'anti', 'wrong', 'avoid', 'slop']
		};

		const keywords = titleKeywords[sectionId] ?? [];
		const titleLower = section.title.toLowerCase();

		return training.data.filter((t) => {
			if (t.layer !== section.layer) return false;
			// Exact title match
			if (t.title === section.title) return true;
			// Keyword match against doc title
			const docTitle = t.title.toLowerCase();
			return keywords.some((kw) => docTitle.includes(kw));
		});
	}

	// Docs not claimed by any section (orphaned)
	const orphanedDocs = $derived(() => {
		if (!training?.data) return [];
		const claimed = new Set<string>();
		for (const section of sections) {
			for (const mod of getModulesForSection(section.id)) {
				claimed.add(mod._id);
			}
		}
		return training.data.filter((t) => !claimed.has(t._id));
	});

	function copyPrompt(prompt: string, id: string) {
		navigator.clipboard.writeText(prompt);
		copiedPrompt = id;
		setTimeout(() => (copiedPrompt = null), 2000);
	}

	function toggleSection(id: string) {
		if (expandedSection === id) {
			expandedSection = null;
		} else {
			expandedSection = id;
			pasteContent = '';
			uploadStatus = '';
			editingId = null;
		}
	}

	async function readFile(file: File): Promise<string> {
		const ext = file.name.split('.').pop()?.toLowerCase();
		if (ext === 'md' || ext === 'txt') {
			return await file.text();
		} else if (ext === 'docx') {
			const ab = await file.arrayBuffer();
			const result = await mammoth.extractRawText({ arrayBuffer: ab });
			return result.value;
		}
		throw new Error(`Unsupported file type: .${ext}`);
	}

	async function handleUpload(event: Event, target: 'paste' | 'edit') {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploadStatus = `Reading ${file.name}...`;
		try {
			const text = await readFile(file);
			if (target === 'paste') {
				pasteContent = text;
			} else {
				editContent = text;
			}
			uploadStatus = `Loaded ${file.name}`;
		} catch (err) {
			uploadStatus = `${err}`;
		}
		input.value = '';
	}

	async function saveNewContent(section: (typeof sections)[0]) {
		if (!selectedBrandId || !pasteContent.trim()) return;
		submitting = true;
		await client.mutation(api.training.create, {
			brandId: selectedBrandId as any,
			layer: section.layer,
			title: section.title,
			content: pasteContent
		});
		pasteContent = '';
		uploadStatus = '';
		submitting = false;
	}

	function startEdit(item: any) {
		editingId = item._id;
		editContent = item.content;
	}

	async function saveEdit() {
		if (!editingId) return;
		submitting = true;
		await client.mutation(api.training.update, {
			id: editingId as any,
			content: editContent
		});
		editingId = null;
		submitting = false;
	}

	async function removeModule(id: string) {
		await client.mutation(api.training.remove, { id: id as any });
	}
</script>

<div class="space-y-4">
	<div>
		<a href="/settings" class="text-sm text-(--color-brand) hover:underline">&larr; Settings</a>
		<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">Training</h2>
		<p class="text-sm text-(--color-on-surface-muted)">
			Teach the agent your brand voice. Copy a prompt, run it with your AI, paste the result back.
			The learning loop refines it over time.
		</p>
	</div>

	<!-- Brand selector -->
	<select
		bind:value={selectedBrandId}
		class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
	>
		<option value={null}>Select a brand...</option>
		{#if brands.data}
			{#each brands.data as brand}
				<option value={brand._id}>{brand.name}</option>
			{/each}
		{/if}
	</select>

	{#if selectedBrandId && selectedBrand}
		<!-- Training sections -->
		<div class="space-y-3">
			{#each sections as section}
				{@const modules = getModulesForSection(section.id)}
				{@const isExpanded = expandedSection === section.id}
				{@const promptText = section.prompt(selectedBrand.name)}

				<div
					class="bg-(--color-surface) rounded-xl border overflow-hidden transition-colors"
					class:border-green-300={modules.length > 0}
					class:border-gray-200={modules.length === 0}
				>
					<!-- Section header (always visible, clickable) -->
					<button
						onclick={() => toggleSection(section.id)}
						class="w-full p-4 flex items-center gap-3 text-left hover:bg-(--color-surface-dim) transition-colors"
					>
						<span class="text-xl">{section.icon}</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<h3 class="font-semibold text-(--color-on-surface) text-sm">{section.title}</h3>
								{#if modules.length > 0}
									<span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"
										>{modules.length} doc{modules.length > 1 ? 's' : ''}</span
									>
								{:else}
									<span
										class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
										>Not started</span
									>
								{/if}
							</div>
							<p class="text-xs text-(--color-on-surface-muted) mt-0.5">{section.question}</p>
						</div>
						<svg
							class="w-5 h-5 text-(--color-on-surface-muted) shrink-0 transition-transform"
							class:rotate-180={isExpanded}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					<!-- Expanded content -->
					{#if isExpanded}
						<div class="px-4 pb-4 space-y-4 border-t border-(--color-border)">
							<!-- Prompt -->
							<div class="mt-4 bg-(--color-surface-dim) rounded-lg p-3 space-y-2">
								<div class="flex items-center justify-between">
									<p class="text-xs font-medium text-(--color-on-surface-muted)">
										Copy this prompt and run it with your AI agent
									</p>
									<button
										onclick={() => copyPrompt(promptText, section.id)}
										class="shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
										class:bg-green-600={copiedPrompt === section.id}
										class:text-white={copiedPrompt === section.id}
										class:bg-white={copiedPrompt !== section.id}
										class:text-gray-700={copiedPrompt !== section.id}
										class:border={copiedPrompt !== section.id}
										class:border-gray-200={copiedPrompt !== section.id}
									>
										{copiedPrompt === section.id ? 'Copied!' : 'Copy Prompt'}
									</button>
								</div>
								<pre
									class="text-xs text-(--color-on-surface-muted) whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{promptText}</pre>
							</div>

							<!-- Primary doc (agent-synthesized) -->
					{#if true}
							{@const primaryDoc = modules.find((m) => m.isPrimary)}
							{@const contributingDocs = modules.filter((m) => !m.isPrimary)}

							{#if primaryDoc}
								<div class="rounded-lg border-2 border-green-300 overflow-hidden">
									<div class="bg-green-50 dark:bg-green-950 px-4 py-2.5 flex items-center justify-between">
										<div class="flex items-center gap-2">
											<span class="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">Primary Doc</span>
											<span class="text-xs text-green-600 dark:text-green-400">Synthesized by agent</span>
											{#if primaryDoc.needsResynthesis}
												<span class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Needs update</span>
											{/if}
										</div>
										<span class="text-xs text-green-600 dark:text-green-400">v{primaryDoc.version}</span>
									</div>
									{#if editingId === primaryDoc._id}
										<div class="p-4 space-y-3">
											<textarea
												bind:value={editContent}
												rows="14"
												class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"
											></textarea>
											<div class="flex gap-2">
												<button onclick={saveEdit} disabled={submitting} class="px-4 py-1.5 rounded-lg bg-(--color-brand) text-white text-sm disabled:opacity-50">Save</button>
												<button onclick={() => (editingId = null)} class="px-4 py-1.5 rounded-lg border border-(--color-border) text-sm">Cancel</button>
											</div>
										</div>
									{:else}
										<div class="px-4 py-3">
											<pre class="text-sm text-(--color-on-surface-muted) whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">{primaryDoc.content}</pre>
										</div>
										<div class="px-4 pb-3">
											<button onclick={() => startEdit(primaryDoc)} class="text-xs text-(--color-brand) hover:underline">Edit</button>
										</div>
									{/if}
								</div>
							{:else if contributingDocs.length > 0}
								<div class="rounded-lg border-2 border-dashed border-yellow-300 p-4 text-center space-y-1">
									<p class="text-sm text-yellow-700 dark:text-yellow-300 font-medium">No primary doc yet</p>
									<p class="text-xs text-(--color-on-surface-muted)">The agent will synthesize your {contributingDocs.length} contributing doc{contributingDocs.length > 1 ? 's' : ''} into a primary doc on its next run.</p>
								</div>
							{/if}

							<!-- Contributing documents -->
							{#if contributingDocs.length > 0}
								<div class="space-y-3">
									<p class="text-xs font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">
										Contributing Documents ({contributingDocs.length})
									</p>
									{#each contributingDocs as item}
										<div class="rounded-lg border border-(--color-border) overflow-hidden">
											<!-- Doc card header -->
											<div class="bg-(--color-surface-dim) px-4 py-2.5 flex items-center justify-between">
												<div class="flex items-center gap-2 min-w-0">
													<span class="text-sm font-medium text-(--color-on-surface) truncate">{item.title}</span>
													<span class="text-xs text-(--color-on-surface-muted) shrink-0">v{item.version}</span>
													<span class="text-xs text-(--color-on-surface-muted) shrink-0">{Math.round(item.content.length / 1000)}k chars</span>
												</div>
												<div class="flex gap-2 shrink-0">
													<button
														onclick={() => startEdit(item)}
														class="text-xs px-2 py-1 rounded bg-(--color-surface) border border-(--color-border) text-(--color-on-surface) hover:border-(--color-brand)"
													>Edit</button>
													<button
														onclick={() => removeModule(item._id)}
														class="text-xs px-2 py-1 rounded bg-(--color-surface) border border-red-200 text-red-500 hover:border-red-400"
													>Delete</button>
												</div>
											</div>

											{#if editingId === item._id}
												<!-- Edit mode -->
												<div class="p-4 space-y-3">
													<label
														class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-(--color-border) cursor-pointer hover:border-(--color-brand) text-xs"
													>
														<span class="text-(--color-on-surface-muted)"
															>Replace with file (.md, .txt, .docx)</span
														>
														<input
															type="file"
															accept=".md,.txt,.docx"
															class="hidden"
															onchange={(e) => handleUpload(e, 'edit')}
														/>
													</label>
													{#if uploadStatus}
														<p class="text-xs text-(--color-on-surface-muted)">
															{uploadStatus}
														</p>
													{/if}
													<textarea
														bind:value={editContent}
														rows="14"
														class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"
													></textarea>
													<div class="flex gap-2">
														<button
															onclick={saveEdit}
															disabled={submitting}
															class="px-4 py-1.5 rounded-lg bg-(--color-brand) text-white text-sm disabled:opacity-50"
															>Save Changes</button
														>
														<button
															onclick={() => (editingId = null)}
															class="px-4 py-1.5 rounded-lg border border-(--color-border) text-sm"
															>Cancel</button
														>
													</div>
												</div>
											{:else}
												<!-- Preview -->
												<div class="px-4 py-3">
													<pre class="text-sm text-(--color-on-surface-muted) whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">{item.content}</pre>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}

					{/if}

							<!-- Add new content -->
							<div class="space-y-2">
								<p class="text-xs font-medium text-(--color-on-surface-muted)">
									{modules.length > 0 ? 'Add more content' : 'Paste your result here'}
								</p>

								<!-- File upload -->
								<label
									class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-(--color-border) cursor-pointer hover:border-(--color-brand) transition-colors"
								>
									<svg
										class="w-4 h-4 text-(--color-on-surface-muted)"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M12 4v16m-8-8h16" />
									</svg>
									<span class="text-sm text-(--color-on-surface-muted)"
										>Upload file (.md, .txt, .docx)</span
									>
									<input
										type="file"
										accept=".md,.txt,.docx"
										class="hidden"
										onchange={(e) => handleUpload(e, 'paste')}
									/>
								</label>
								{#if uploadStatus && editingId === null}
									<p class="text-xs text-(--color-on-surface-muted)">{uploadStatus}</p>
								{/if}

								<textarea
									bind:value={pasteContent}
									rows="8"
									class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"
									placeholder="Paste the AI-generated training document here..."
								></textarea>

								<button
									onclick={() => saveNewContent(section)}
									disabled={submitting || !pasteContent.trim()}
									class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white text-sm font-medium disabled:opacity-50 hover:bg-(--color-brand-dark) transition-colors"
								>
									{submitting ? 'Saving...' : 'Save'}
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Orphaned docs that don't match any section -->
		{#if orphanedDocs().length > 0}
			<div class="space-y-3 pt-2">
				<h3 class="text-xs font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">
					Other Documents
				</h3>
				{#each orphanedDocs() as item}
					<div class="rounded-lg border border-(--color-border) overflow-hidden">
						<div class="bg-(--color-surface-dim) px-4 py-2.5 flex items-center justify-between">
							<div class="flex items-center gap-2 min-w-0">
								<span class="text-sm font-medium text-(--color-on-surface) truncate">{item.title}</span>
								<span class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface-muted)">{item.layer.replace(/_/g, ' ')}</span>
								<span class="text-xs text-(--color-on-surface-muted) shrink-0">v{item.version}</span>
							</div>
							<div class="flex gap-2 shrink-0">
								<button
									onclick={() => startEdit(item)}
									class="text-xs px-2 py-1 rounded bg-(--color-surface) border border-(--color-border) text-(--color-on-surface) hover:border-(--color-brand)"
								>Edit</button>
								<button
									onclick={() => removeModule(item._id)}
									class="text-xs px-2 py-1 rounded bg-(--color-surface) border border-red-200 text-red-500 hover:border-red-400"
								>Delete</button>
							</div>
						</div>
						{#if editingId === item._id}
							<div class="p-4 space-y-3">
								<textarea
									bind:value={editContent}
									rows="14"
									class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"
								></textarea>
								<div class="flex gap-2">
									<button onclick={saveEdit} disabled={submitting} class="px-4 py-1.5 rounded-lg bg-(--color-brand) text-white text-sm disabled:opacity-50">Save</button>
									<button onclick={() => (editingId = null)} class="px-4 py-1.5 rounded-lg border border-(--color-border) text-sm">Cancel</button>
								</div>
							</div>
						{:else}
							<div class="px-4 py-3">
								<pre class="text-sm text-(--color-on-surface-muted) whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">{item.content}</pre>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<div
			class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center"
		>
			<p class="text-(--color-on-surface-muted)">Select a brand to set up training.</p>
		</div>
	{/if}
</div>
