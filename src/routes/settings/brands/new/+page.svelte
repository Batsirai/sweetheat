<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { goto } from '$app/navigation';
	import { api } from '../../../../../convex/_generated/api';

	const client = useConvexClient();

	let name = $state('');
	let description = $state('');
	let voiceTraining = $state('');
	let interests = $state('');
	let wordsToUse = $state('');
	let wordsToAvoid = $state('');
	let goals = $state('');
	let submitting = $state(false);

	const allFormats = [
		{ id: 'tweet', label: 'Tweet / Thread' },
		{ id: 'linkedin', label: 'LinkedIn Post' },
		{ id: 'blog', label: 'Blog Article' },
		{ id: 'caption_ig', label: 'IG Caption' },
		{ id: 'caption_tiktok', label: 'TikTok Caption' },
		{ id: 'newsletter', label: 'Newsletter' },
		{ id: 'carousel', label: 'Image Carousel' },
		{ id: 'quote_card', label: 'Quote Card' },
		{ id: 'pin', label: 'Pinterest Pin' },
		{ id: 'thumbnail', label: 'YouTube Thumbnail' },
		{ id: 'short_video', label: 'Short Video Script' },
		{ id: 'long_video', label: 'Long Video Script' }
	];

	let selectedFormats = $state<Set<string>>(new Set());

	function toggleFormat(id: string) {
		const next = new Set(selectedFormats);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedFormats = next;
	}

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;

		const brandId = await client.mutation(api.brands.create, {
			name,
			slug: slugify(name),
			description,
			voiceTraining,
			interests: interests
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			wordsToUse: wordsToUse
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			wordsToAvoid: wordsToAvoid
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			activeFormats: [...selectedFormats],
			goals: goals || undefined
		});

		goto(`/settings/brands/${brandId}`);
	}
</script>

<div class="space-y-6">
	<div>
		<a href="/settings/brands" class="text-sm text-(--color-brand) hover:underline">&larr; Brands</a>
		<h2 class="text-xl font-bold text-(--color-on-surface) mt-2">Create Brand</h2>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<!-- Identity -->
		<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-4">
			<h3 class="font-semibold text-(--color-on-surface)">Identity</h3>

			<div>
				<label for="brand-name" class="block text-sm font-medium text-(--color-on-surface) mb-1">Name</label>
				<input
					id="brand-name"
					type="text"
					bind:value={name}
					required
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
					placeholder="e.g., AlreadyLoved Kids"
				/>
				{#if name}
					<p class="text-xs text-(--color-on-surface-muted) mt-1">Slug: {slugify(name)}</p>
				{/if}
			</div>

			<div>
				<label for="brand-desc" class="block text-sm font-medium text-(--color-on-surface) mb-1">Description</label>
				<textarea
					id="brand-desc"
					bind:value={description}
					required
					rows="2"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-none"
					placeholder="What is this brand about?"
				></textarea>
			</div>
		</section>

		<!-- Voice -->
		<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-4">
			<h3 class="font-semibold text-(--color-on-surface)">Voice</h3>

			<div>
				<label for="voice" class="block text-sm font-medium text-(--color-on-surface) mb-1">
					Voice Training <span class="text-(--color-on-surface-muted) font-normal">(markdown)</span>
				</label>
				<textarea
					id="voice"
					bind:value={voiceTraining}
					rows="6"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-y font-mono text-sm"
					placeholder="Describe this brand's voice, tone, and style..."
				></textarea>
			</div>

			<div>
				<label for="interests" class="block text-sm font-medium text-(--color-on-surface) mb-1">
					Interests <span class="text-(--color-on-surface-muted) font-normal">(comma-separated)</span>
				</label>
				<input
					id="interests"
					type="text"
					bind:value={interests}
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface)"
					placeholder="e.g., parenting, faith, identity"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="words-use" class="block text-sm font-medium text-(--color-on-surface) mb-1">Words to Use</label>
					<input
						id="words-use"
						type="text"
						bind:value={wordsToUse}
						class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
						placeholder="grace, beloved, enough"
					/>
				</div>
				<div>
					<label for="words-avoid" class="block text-sm font-medium text-(--color-on-surface) mb-1">Words to Avoid</label>
					<input
						id="words-avoid"
						type="text"
						bind:value={wordsToAvoid}
						class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
						placeholder="should, must, hustle"
					/>
				</div>
			</div>
		</section>

		<!-- Formats -->
		<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-4">
			<h3 class="font-semibold text-(--color-on-surface)">Content Formats</h3>
			<div class="flex flex-wrap gap-2">
				{#each allFormats as format}
					<button
						type="button"
						onclick={() => toggleFormat(format.id)}
						class="px-3 py-1.5 rounded-full text-sm border transition-colors"
						class:bg-green-600={selectedFormats.has(format.id)}
						class:text-white={selectedFormats.has(format.id)}
						class:border-green-600={selectedFormats.has(format.id)}
						class:border-gray-300={!selectedFormats.has(format.id)}
						class:text-gray-600={!selectedFormats.has(format.id)}
					>
						{format.label}
					</button>
				{/each}
			</div>
		</section>

		<!-- Goals -->
		<section class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-4">
			<h3 class="font-semibold text-(--color-on-surface)">Goals</h3>
			<textarea
				bind:value={goals}
				rows="2"
				class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) resize-none"
				placeholder="What are the current content goals for this brand?"
			></textarea>
		</section>

		<button
			type="submit"
			disabled={submitting}
			class="w-full py-3 rounded-lg bg-(--color-brand) text-white font-medium hover:bg-(--color-brand-dark) transition-colors disabled:opacity-50"
		>
			{submitting ? 'Creating...' : 'Create Brand'}
		</button>
	</form>
</div>
