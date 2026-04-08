<script lang="ts">
	import '../app.css';
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { page } from '$app/state';
	import AppShell from '$lib/components/AppShell.svelte';

	let { children, data } = $props();

	setupConvex(PUBLIC_CONVEX_URL);

	const authPages = ['/login', '/register'];
	const isAuthPage = $derived(authPages.includes(page.url.pathname));
</script>

<svelte:head>
	<title>Sweet Content</title>
	<meta name="description" content="Multi-brand content production system" />
</svelte:head>

{#if data.user && !isAuthPage}
	<AppShell user={data.user}>
		{@render children()}
	</AppShell>
{:else}
	{@render children()}
{/if}
