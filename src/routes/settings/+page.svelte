<script lang="ts">
	const sections = [
		{ href: '/settings/brands', label: 'Brands', description: 'Manage your content brands', icon: '🏷️' },
		{ href: '/settings/training', label: 'Training', description: 'Voice and style training per brand', icon: '📚' },
		{ href: '/settings/learnings', label: 'Learnings', description: 'Review agent-proposed improvements', icon: '🧠' },
		{ href: '/settings/integrations', label: 'Integrations', description: 'Connect tools and platforms', icon: '🔗' }
	];
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-xl font-bold text-(--color-on-surface)">Settings</h2>
		<p class="text-sm text-(--color-on-surface-muted)">Configure your content factory</p>
	</div>

	<div class="space-y-3">
		{#each sections as section}
			<a
				href={section.href}
				class="block bg-(--color-surface) rounded-xl border border-(--color-border) p-4 hover:border-(--color-brand) transition-colors"
			>
				<div class="flex items-center gap-3">
					<span class="text-2xl">{section.icon}</span>
					<div>
						<h3 class="font-semibold text-(--color-on-surface)">{section.label}</h3>
						<p class="text-sm text-(--color-on-surface-muted)">{section.description}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Logout -->
	<div class="pt-4 border-t border-(--color-border)">
		<button
			onclick={async () => {
				await fetch('/api/auth', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'logout' })
				});
				window.location.href = '/login';
			}}
			class="text-sm text-red-500 hover:text-red-600"
		>
			Sign out
		</button>
	</div>
</div>
