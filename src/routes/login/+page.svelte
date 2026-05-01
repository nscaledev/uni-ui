<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Identity from '$lib/openapi/identity';
	import Logo from '$lib/logos/Logo.svelte';
	import ProviderIcon from '$lib/logos/ProviderIcon.svelte';

	function login(provider: Identity.Oauth2ProviderType) {
		const providerInput = document.getElementById('provider') as HTMLInputElement;
		if (providerInput) providerInput.value = provider;
		const form = document.getElementById('login_form') as HTMLFormElement;
		if (form) form.submit();
	}

	interface Provider {
		type: Identity.Oauth2ProviderType;
		label: string;
	}

	const providers: Array<Provider> = [
		{ type: Identity.Oauth2ProviderType.Google, label: 'Google' },
		{ type: Identity.Oauth2ProviderType.Microsoft, label: 'Microsoft' },
		{ type: Identity.Oauth2ProviderType.Github, label: 'GitHub' }
	];
</script>

<div class="auth-screen">
	<div class="auth-card">
		<header class="auth-card__logo">
			<Logo class="auth-logo" />
		</header>

		<main class="auth-card__body">
			<form id="login_form" class="auth-form" method="post" action={data.callback}>
				<input name="state" type="hidden" value={data.state} />
				<input id="provider" name="provider" type="hidden" />

				<section class="auth-section">
					<p class="auth-section__label">Enter your email address</p>
					<input
						class="input"
						name="email"
						type="email"
						placeholder="jane.doe@acme.com"
						autocomplete="email"
						required
					/>
				</section>
			</form>

			<p class="auth-divider">or</p>

			<section class="auth-section">
				<p class="auth-section__label">Choose a provider</p>
				<div class="auth-providers">
					{#each providers as provider}
						{#if data.providers.includes(provider.type)}
							<button class="btn auth-provider-btn" onclick={() => login(provider.type)}>
								<ProviderIcon type={provider.type} />
								{provider.label}
							</button>
						{/if}
					{/each}
				</div>
			</section>
		</main>
	</div>
</div>

<style>
	.auth-screen {
		display: grid;
		place-items: center;
		min-height: 100vh;
		background: var(--bg-0);
	}

	.auth-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		padding: 40px;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-md);
		min-width: 320px;
	}

	.auth-card__logo {
		display: flex;
		justify-content: center;
	}

	:global(.auth-logo) {
		height: 48px;
		width: auto;
	}

	.auth-card__body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
	}

	.auth-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		width: 100%;
	}

	.auth-section__label {
		font-size: 13px;
		color: var(--text-2);
	}

	.auth-divider {
		font-size: 12px;
		color: var(--text-3);
		font-style: italic;
	}

	.auth-providers {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.auth-provider-btn {
		min-width: 90px;
		font-size: 13px;
	}
</style>
