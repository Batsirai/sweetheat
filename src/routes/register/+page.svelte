<script lang="ts">
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';

		const res = await fetch('/api/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'register', email, password, name })
		});

		const data = await res.json();
		if (data.success) {
			window.location.href = '/';
		} else {
			error = data.error || 'Registration failed';
		}
		loading = false;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-(--color-surface-dim) px-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold text-(--color-on-surface)">Sweet Content</h1>
			<p class="text-sm text-(--color-on-surface-muted) mt-1">Create your account</p>
		</div>

		<form onsubmit={handleRegister} class="bg-(--color-surface) rounded-xl shadow-sm border border-(--color-border) p-6 space-y-4">
			{#if error}
				<div class="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg">{error}</div>
			{/if}

			<div>
				<label for="name" class="block text-sm font-medium text-(--color-on-surface) mb-1">Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) focus:outline-none focus:ring-2 focus:ring-(--color-brand)"
					placeholder="Your name"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-(--color-on-surface) mb-1">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) focus:outline-none focus:ring-2 focus:ring-(--color-brand)"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-(--color-on-surface) mb-1">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength="8"
					class="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-on-surface) focus:outline-none focus:ring-2 focus:ring-(--color-brand)"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 rounded-lg bg-(--color-brand) text-white font-medium hover:bg-(--color-brand-dark) transition-colors disabled:opacity-50"
			>
				{loading ? 'Creating account...' : 'Create account'}
			</button>

			<p class="text-center text-sm text-(--color-on-surface-muted)">
				Already have an account? <a href="/login" class="text-(--color-brand) hover:underline">Sign in</a>
			</p>
		</form>
	</div>
</div>
