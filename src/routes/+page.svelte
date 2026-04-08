<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';

	const client = useConvexClient();
	const brands = useQuery(api.brands.listActive, {});
	const allTodos = useQuery(api.todos.countsByOwner, {});
	const userTodos = useQuery(api.todos.list, { owner: 'user', status: 'pending' });
	const agentTodos = useQuery(api.todos.list, { owner: 'agent', status: 'pending' });
	const latestRun = useQuery(api.agentRuns.latest, {});

	async function completeTodo(id: string) {
		await client.mutation(api.todos.complete, { id: id as any });
	}

	let todoTab = $state<'user' | 'agent'>('user');
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-bold text-(--color-on-surface)">Dashboard</h2>
		<p class="text-sm text-(--color-on-surface-muted) mt-1">Your content factory at a glance</p>
	</div>

	<!-- Quick stats -->
	<div class="grid grid-cols-2 gap-3">
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
			<p class="text-sm text-(--color-on-surface-muted)">Your Todos</p>
			<p class="text-2xl font-bold text-(--color-on-surface) mt-1">
				{allTodos.data?.userPending ?? '...'}
			</p>
		</div>
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4">
			<p class="text-sm text-(--color-on-surface-muted)">Agent Todos</p>
			<p class="text-2xl font-bold text-(--color-on-surface) mt-1">
				{allTodos.data?.agentPending ?? '...'}
			</p>
		</div>
	</div>

	<!-- Todo lists (transcript: "My todos" + "Agent's todos") -->
	<div>
		<div class="flex items-center gap-2 mb-3">
			<h3
				class="text-sm font-semibold text-(--color-on-surface-muted) uppercase tracking-wider"
			>
				Todos
			</h3>
			<div class="flex rounded-lg border border-(--color-border) overflow-hidden ml-auto">
				<button
					onclick={() => (todoTab = 'user')}
					class="px-3 py-1 text-xs font-medium transition-colors"
					class:bg-green-600={todoTab === 'user'}
					class:text-white={todoTab === 'user'}
					class:text-gray-500={todoTab !== 'user'}
				>
					Mine
				</button>
				<button
					onclick={() => (todoTab = 'agent')}
					class="px-3 py-1 text-xs font-medium transition-colors"
					class:bg-green-600={todoTab === 'agent'}
					class:text-white={todoTab === 'agent'}
					class:text-gray-500={todoTab !== 'agent'}
				>
					Agent
				</button>
			</div>
		</div>

		{#if todoTab === 'user'}
			{#if userTodos.data && userTodos.data.length > 0}
				<div class="space-y-2">
					{#each userTodos.data as todo}
						<div
							class="bg-(--color-surface) rounded-lg border border-(--color-border) p-3 flex items-center gap-3"
						>
							<button
								onclick={() => completeTodo(todo._id)}
								aria-label="Complete todo"
								class="w-5 h-5 rounded border-2 border-(--color-border) hover:border-(--color-brand) shrink-0 flex items-center justify-center"
							>
							</button>
							<div class="flex-1 min-w-0">
								<p class="text-sm text-(--color-on-surface)">{todo.description}</p>
								<p class="text-xs text-(--color-on-surface-muted)">{todo.type.replace(/_/g, ' ')}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-(--color-on-surface-muted)">No pending todos for you.</p>
			{/if}
		{:else}
			{#if agentTodos.data && agentTodos.data.length > 0}
				<div class="space-y-2">
					{#each agentTodos.data as todo}
						<div
							class="bg-(--color-surface) rounded-lg border border-(--color-border) p-3 flex items-center gap-3"
						>
							<span class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface-muted)">
								{todo.status}
							</span>
							<div class="flex-1 min-w-0">
								<p class="text-sm text-(--color-on-surface)">{todo.description}</p>
								<p class="text-xs text-(--color-on-surface-muted)">{todo.type.replace(/_/g, ' ')}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-(--color-on-surface-muted)">No pending agent todos.</p>
			{/if}
		{/if}
	</div>

	<!-- Last agent run -->
	{#if latestRun.data}
		<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-2">
			<h3 class="text-sm font-semibold text-(--color-on-surface-muted) uppercase tracking-wider">
				Last Agent Run
			</h3>
			<div class="flex items-center gap-3 text-sm">
				<span
					class="px-2 py-0.5 rounded-full text-xs"
					class:bg-green-100={latestRun.data.status === 'completed'}
					class:text-green-800={latestRun.data.status === 'completed'}
					class:bg-yellow-100={latestRun.data.status === 'running'}
					class:text-yellow-800={latestRun.data.status === 'running'}
					class:bg-red-100={latestRun.data.status === 'failed'}
					class:text-red-800={latestRun.data.status === 'failed'}
				>
					{latestRun.data.status}
				</span>
				<span class="text-(--color-on-surface-muted)">
					{new Date(latestRun.data.startedAt).toLocaleDateString()}
				</span>
			</div>
			{#if latestRun.data.summary}
				<p class="text-sm text-(--color-on-surface-muted)">{latestRun.data.summary}</p>
			{/if}
			<div class="flex gap-4 text-xs text-(--color-on-surface-muted)">
				<span>{latestRun.data.seedsGenerated} seeds</span>
				<span>{latestRun.data.draftsWritten} drafts</span>
				<span>{latestRun.data.learningsGenerated} learnings</span>
			</div>
		</div>
	{/if}

	<!-- Brands overview -->
	<div>
		<h3
			class="text-sm font-semibold text-(--color-on-surface-muted) uppercase tracking-wider mb-3"
		>
			Active Brands
		</h3>
		{#if brands.isLoading}
			<div class="text-sm text-(--color-on-surface-muted)">Loading brands...</div>
		{:else if brands.data && brands.data.length > 0}
			<div class="space-y-3">
				{#each brands.data as brand}
					<a
						href="/settings/brands/{brand._id}"
						class="block bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors"
					>
						<div class="flex items-center justify-between">
							<div>
								<h4 class="font-semibold text-(--color-on-surface)">{brand.name}</h4>
								<p class="text-sm text-(--color-on-surface-muted) mt-0.5">
									{brand.description}
								</p>
							</div>
							<div class="flex items-center gap-1">
								{#each brand.activeFormats.slice(0, 3) as format}
									<span
										class="text-xs px-2 py-0.5 rounded-full bg-(--color-surface-container) text-(--color-on-surface-muted)"
									>
										{format}
									</span>
								{/each}
								{#if brand.activeFormats.length > 3}
									<span class="text-xs text-(--color-on-surface-muted)">
										+{brand.activeFormats.length - 3}
									</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div
				class="bg-(--color-surface) rounded-xl border border-(--color-border) border-dashed p-8 text-center"
			>
				<p class="text-(--color-on-surface-muted)">No brands yet</p>
				<a
					href="/settings/brands/new"
					class="inline-block mt-3 px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium hover:bg-(--color-brand-dark) transition-colors"
				>
					Create your first brand
				</a>
			</div>
		{/if}
	</div>

	<!-- Quick actions -->
	<div>
		<h3
			class="text-sm font-semibold text-(--color-on-surface-muted) uppercase tracking-wider mb-3"
		>
			Quick Actions
		</h3>
		<div class="grid grid-cols-2 gap-3">
			<a
				href="/seeds"
				class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors text-center"
			>
				<p class="text-2xl">🌱</p>
				<p class="text-sm font-medium text-(--color-on-surface) mt-1">Plant a Seed</p>
			</a>
			<a
				href="/settings/brands"
				class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors text-center"
			>
				<p class="text-2xl">🏷️</p>
				<p class="text-sm font-medium text-(--color-on-surface) mt-1">Manage Brands</p>
			</a>
		</div>
	</div>
</div>
