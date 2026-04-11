<script lang="ts">
	const sections = [
		{ href: '/settings/brands', label: 'Brands', description: 'Manage your content brands', icon: '🏷️' },
		{ href: '/settings/training', label: 'Training', description: 'Voice and style training per brand', icon: '📚' },
		{ href: '/settings/learnings', label: 'Learnings', description: 'Review agent-proposed improvements', icon: '🧠' },
		{ href: '/settings/integrations', label: 'Integrations', description: 'Connect tools and platforms', icon: '🔗' }
	];

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let pwStatus = $state('');
	let pwError = $state('');
	let changingPw = $state(false);

	async function changePassword() {
		pwError = '';
		pwStatus = '';

		if (newPassword.length < 8) {
			pwError = 'Password must be at least 8 characters';
			return;
		}
		if (newPassword !== confirmPassword) {
			pwError = 'Passwords do not match';
			return;
		}

		changingPw = true;
		const res = await fetch('/api/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'change-password', currentPassword, newPassword })
		});
		const data = await res.json();

		if (data.success) {
			pwStatus = 'Password changed';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} else {
			pwError = data.error || 'Failed to change password';
		}
		changingPw = false;
	}
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

	<!-- Change Password -->
	<div class="bg-(--color-surface) rounded-xl border border-(--color-border) p-4 space-y-3">
		<h3 class="font-semibold text-(--color-on-surface)">Change Password</h3>
		<input
			type="password"
			bind:value={currentPassword}
			placeholder="Current password"
			class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
		/>
		<input
			type="password"
			bind:value={newPassword}
			placeholder="New password"
			class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
		/>
		<input
			type="password"
			bind:value={confirmPassword}
			placeholder="Confirm new password"
			class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) text-sm"
			onkeydown={(e) => { if (e.key === 'Enter') changePassword(); }}
		/>
		{#if pwError}
			<p class="text-xs text-red-500">{pwError}</p>
		{/if}
		{#if pwStatus}
			<p class="text-xs text-green-600">{pwStatus}</p>
		{/if}
		<button
			onclick={changePassword}
			disabled={changingPw || !currentPassword || !newPassword}
			class="px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-medium disabled:opacity-40"
		>
			{changingPw ? 'Changing...' : 'Change Password'}
		</button>
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
