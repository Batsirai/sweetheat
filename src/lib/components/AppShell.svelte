<script lang="ts">
	import BottomNav from './BottomNav.svelte';
	import BrandSwitcher from './BrandSwitcher.svelte';
	import type { Snippet } from 'svelte';

	let { user, children }: { user: { name: string; email: string }; children: Snippet } = $props();
</script>

<div class="min-h-screen flex flex-col bg-(--color-surface-dim)">
	<!-- Top header -->
	<header
		class="sticky top-0 z-40 bg-(--color-surface) border-b border-(--color-border) px-4 py-3 flex items-center justify-between"
	>
		<div class="flex items-center gap-3">
			<h1 class="text-lg font-bold text-(--color-on-surface)">Sweet Content</h1>
		</div>
		<div class="flex items-center gap-3">
			<BrandSwitcher />
			<div
				class="w-8 h-8 rounded-full bg-(--color-brand) text-white flex items-center justify-center text-sm font-medium"
			>
				{user.name.charAt(0).toUpperCase()}
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main class="flex-1 pb-20 md:pb-4 md:pl-64">
		<div class="max-w-4xl mx-auto p-4">
			{@render children()}
		</div>
	</main>

	<!-- Desktop sidebar (hidden on mobile) -->
	<aside
		class="hidden md:flex fixed left-0 top-[57px] bottom-0 w-64 bg-(--color-surface) border-r border-(--color-border) flex-col p-4 gap-1"
	>
		<a href="/" class="nav-link" class:active={false}>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
				><path
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/></svg
			>
			Dashboard
		</a>
		<a href="/seeds" class="nav-link">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
				><path
					d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.2 0-4 1.8-4 4 0 4.4 5 8 10 13 5-5 10-8.6 10-13 0-2.2-1.8-4-4-4-1.2 0-2.4.6-3 1.5C14.4 3.6 13.2 3 12 3z"
				/></svg
			>
			Seeds
		</a>
		<a href="/branches" class="nav-link">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
				><path d="M6 3v12m0 0c2.5 0 4 1.5 4 4m-4-4c-2.5 0-4 1.5-4 4m12-12v8m0 0c2 0 3 1 3 3m-3-3c-2 0-3 1-3 3" /></svg
			>
			Branches
		</a>
		<a href="/calendar" class="nav-link">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
				><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line
					x1="8"
					y1="2"
					x2="8"
					y2="6"
				/><line x1="3" y1="10" x2="21" y2="10" /></svg
			>
			Calendar
		</a>
		<a href="/settings" class="nav-link">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
				><circle cx="12" cy="12" r="3" /><path
					d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
				/></svg
			>
			Settings
		</a>
	</aside>

	<!-- Mobile bottom nav -->
	<BottomNav />
</div>

<style>
	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		color: var(--color-on-surface-muted);
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.15s;
	}
	.nav-link:hover {
		background: var(--color-surface-container);
		color: var(--color-on-surface);
	}
	.nav-link.active {
		background: var(--color-brand);
		color: white;
	}
</style>
