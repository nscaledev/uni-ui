<script lang="ts">
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import Icon from '$lib/primitives/Icon.svelte';
	import { logout } from '$lib/credentials';
	import type { IDToken } from '$lib/oidc';
	import type { OrganizationRead } from '$lib/openapi/identity';

	interface Props {
		profile: IDToken;
		organization?: OrganizationRead;
	}

	let { profile, organization }: Props = $props();

	let menuOpen = $state(false);
	let triggerEl: HTMLButtonElement;
	let menuEl: HTMLDivElement;

	const initials = $derived.by(() => {
		if (profile.given_name && profile.family_name) {
			return (profile.given_name[0] + profile.family_name[0]).toUpperCase();
		}
		return (profile.email?.[0] ?? '?').toUpperCase();
	});

	const displayName = $derived(
		profile.given_name && profile.family_name
			? `${profile.given_name} ${profile.family_name}`
			: (profile.email ?? '')
	);

	async function reposition() {
		if (!triggerEl || !menuEl) return;
		const { x, y } = await computePosition(triggerEl, menuEl, {
			placement: 'bottom-end',
			middleware: [offset(6), flip(), shift({ padding: 8 })]
		});
		Object.assign(menuEl.style, { left: `${x}px`, top: `${y}px` });
	}

	$effect(() => {
		if (menuOpen) reposition();
	});

	function onwindowpointerdown(e: PointerEvent) {
		if (!menuOpen) return;
		const t = e.target as Node;
		if (!triggerEl?.contains(t) && !menuEl?.contains(t)) menuOpen = false;
	}

	function onwindowkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') menuOpen = false;
	}
</script>

<svelte:window onpointerdown={onwindowpointerdown} onkeydown={onwindowkeydown} />

<header class="header">
	<!-- Scope / org indicator -->
	<div class="scope">
		<Icon name="building" size={14} />
		<span class="scope__label">{organization?.metadata.name ?? 'Loading…'}</span>
	</div>

	<div style="flex:1"></div>

	<!-- User avatar trigger -->
	<button
		bind:this={triggerEl}
		class="avatar-btn"
		onclick={() => (menuOpen = !menuOpen)}
		aria-label="User menu"
		aria-haspopup="menu"
		aria-expanded={menuOpen}
	>
		{#if profile.picture}
			<img src={profile.picture} alt={displayName} class="avatar-img" />
		{:else}
			<span class="avatar-initials">{initials}</span>
		{/if}
	</button>
</header>

{#if menuOpen}
	<div bind:this={menuEl} class="menu" role="menu" style="position:fixed;z-index:200;">
		<div class="menu-user">
			<div class="menu-user__name">{displayName}</div>
			<div class="menu-user__email">{profile.email}</div>
		</div>
		<hr class="menu__sep" />
		<button
			class="menu__item"
			role="menuitem"
			onclick={() => {
				menuOpen = false;
				logout();
			}}
		>
			<Icon name="logout" size={14} />
			Sign out
		</button>
	</div>
{/if}

<style>
	.avatar-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent);
		color: var(--accent-ink);
		font: 600 12px/1 var(--font-sans);
		flex-shrink: 0;
		transition: box-shadow 120ms var(--ease);
	}

	.avatar-btn:hover {
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-initials {
		pointer-events: none;
	}

	.menu-user {
		padding: 8px 10px 6px;
	}

	.menu-user__name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-1);
	}

	.menu-user__email {
		font-size: 11.5px;
		color: var(--text-3);
		margin-top: 2px;
	}
</style>
