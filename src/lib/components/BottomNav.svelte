<script lang="ts">
	import { page } from '$app/state';

	const tabs = [
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/seeds', label: 'Seeds', icon: 'seed' },
		{ href: '/knowledge', label: 'Knowledge', icon: 'book' },
		{ href: '/branches', label: 'Branches', icon: 'branch' },
		{ href: '/settings', label: 'Settings', icon: 'settings' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav
	class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-(--color-surface) border-t border-(--color-border) safe-area-bottom"
>
	<div class="flex items-center justify-around h-16">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs transition-colors"
				class:text-green-600={isActive(tab.href)}
				class:text-gray-400={!isActive(tab.href)}
			>
				{#if tab.icon === 'home'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><path
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/></svg
					>
				{:else if tab.icon === 'seed'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><path
							d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.2 0-4 1.8-4 4 0 4.4 5 8 10 13 5-5 10-8.6 10-13 0-2.2-1.8-4-4-4-1.2 0-2.4.6-3 1.5C14.4 3.6 13.2 3 12 3z"
						/></svg
					>
				{:else if tab.icon === 'book'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg
					>
				{:else if tab.icon === 'branch'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><path d="M6 3v12m0 0c2.5 0 4 1.5 4 4m-4-4c-2.5 0-4 1.5-4 4m12-12v8m0 0c2 0 3 1 3 3m-3-3c-2 0-3 1-3 3" /></svg
					>
				{:else if tab.icon === 'calendar'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line
							x1="8"
							y1="2"
							x2="8"
							y2="6"
						/><line x1="3" y1="10" x2="21" y2="10" /></svg
					>
				{:else if tab.icon === 'settings'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><circle cx="12" cy="12" r="3" /><path
							d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
						/></svg
					>
				{/if}
				<span class="font-medium">{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.safe-area-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>
