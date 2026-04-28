<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import Icon from '$lib/primitives/Icon.svelte';
	import { logout } from '$lib/credentials';
	import type { IDToken } from '$lib/oidc';
	import type { OrganizationRead } from '$lib/openapi/identity';
	import { tweaksOpen } from '$lib/stores/theme';

	interface Props {
		profile: IDToken;
		organizations: Array<OrganizationRead>;
		organizationID: string;
	}

	let { profile, organizations, organizationID }: Props = $props();

	const organization = $derived(organizations.find((o) => o.metadata.id === organizationID));

	// ── scope picker ──────────────────────────────────────────
	let scopeOpen = $state(false);
	let scopeTriggerEl: HTMLButtonElement;
	let scopeMenuEl: HTMLDivElement;

	async function repositionScope() {
		if (!scopeTriggerEl || !scopeMenuEl) return;
		const { x, y } = await computePosition(scopeTriggerEl, scopeMenuEl, {
			placement: 'bottom-start',
			middleware: [offset(6), flip(), shift({ padding: 8 })]
		});
		Object.assign(scopeMenuEl.style, { left: `${x}px`, top: `${y}px` });
	}

	$effect(() => {
		if (scopeOpen) repositionScope();
	});

	function switchOrg(id: string) {
		if (!browser) return;
		scopeOpen = false;
		if (id === organizationID) return;
		window.localStorage.setItem('organization_id', id);
		invalidate('app:organization_id');
	}

	const orgInitials = $derived.by(() => {
		const name = organization?.metadata.name ?? '';
		const words = name.trim().split(/\s+/);
		if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
		return name.slice(0, 2).toUpperCase();
	});

	// ── user menu ─────────────────────────────────────────────
	let menuOpen = $state(false);
	let avatarTriggerEl: HTMLButtonElement;
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

	async function repositionMenu() {
		if (!avatarTriggerEl || !menuEl) return;
		const { x, y } = await computePosition(avatarTriggerEl, menuEl, {
			placement: 'bottom-end',
			middleware: [offset(6), flip(), shift({ padding: 8 })]
		});
		Object.assign(menuEl.style, { left: `${x}px`, top: `${y}px` });
	}

	$effect(() => {
		if (menuOpen) repositionMenu();
	});

	// ── shared close on outside click ─────────────────────────
	function onwindowpointerdown(e: PointerEvent) {
		const t = e.target as Node;
		if (scopeOpen && !scopeTriggerEl?.contains(t) && !scopeMenuEl?.contains(t)) scopeOpen = false;
		if (menuOpen && !avatarTriggerEl?.contains(t) && !menuEl?.contains(t)) menuOpen = false;
	}

	function onwindowkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			scopeOpen = false;
			menuOpen = false;
		}
	}
</script>

<svelte:window onpointerdown={onwindowpointerdown} onkeydown={onwindowkeydown} />

<header class="header">
	<!-- Scope / org picker -->
	<button
		bind:this={scopeTriggerEl}
		class="scope"
		onclick={() => (scopeOpen = !scopeOpen)}
		aria-haspopup="listbox"
		aria-expanded={scopeOpen}
		aria-label="Switch organization"
	>
		<span class="scope__avatar">{orgInitials}</span>
		<span class="scope__label">{organization?.metadata.name ?? 'Loading…'}</span>
		<Icon name="chevronDown" size={12} />
	</button>

	<div style="flex:1"></div>

	<!-- Tweaks toggle -->
	<button
		class="header-icon-btn"
		class:header-icon-btn--active={$tweaksOpen}
		onclick={() => tweaksOpen.update((v) => !v)}
		aria-label="Toggle display settings"
		title="Display settings"
	>
		<Icon name="sliders" size={16} />
	</button>

	<!-- User avatar -->
	<button
		bind:this={avatarTriggerEl}
		class="avatar"
		onclick={() => (menuOpen = !menuOpen)}
		aria-label="User menu"
		aria-haspopup="menu"
		aria-expanded={menuOpen}
	>
		{#if profile.picture}
			<img src={profile.picture} alt={displayName} class="avatar-img" />
		{:else}
			{initials}
		{/if}
	</button>
</header>

<!-- Org picker popover -->
{#if scopeOpen}
	<div
		bind:this={scopeMenuEl}
		class="menu"
		role="listbox"
		style="position:fixed;z-index:200;min-width:200px;"
	>
		<div class="menu__title">Organization</div>
		{#each organizations as org}
			<button
				class="menu__item"
				class:menu__item--active={org.metadata.id === organizationID}
				role="option"
				aria-selected={org.metadata.id === organizationID}
				onclick={() => switchOrg(org.metadata.id)}
			>
				<span class="scope__avatar scope__avatar--sm"
					>{(org.metadata.name.trim().split(/\s+/).length >= 2
						? org.metadata.name.trim().split(/\s+/)[0][0] +
							org.metadata.name.trim().split(/\s+/)[1][0]
						: org.metadata.name.slice(0, 2)
					).toUpperCase()}</span
				>
				{org.metadata.name}
				{#if org.metadata.id === organizationID}
					<Icon name="check" size={14} class="check-icon" />
				{/if}
			</button>
		{/each}
	</div>
{/if}

<!-- User menu popover -->
{#if menuOpen}
	<div bind:this={menuEl} class="menu" role="menu" style="position:fixed;z-index:200;">
		<div class="menu-user">
			<div class="menu-user__name">{displayName}</div>
			<div class="menu-user__email">{profile.email}</div>
		</div>
		<hr class="menu__sep" />
		<button
			class="menu__item menu__item--danger"
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
	.header-icon-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--r-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-3);
		transition:
			background 120ms var(--ease),
			color 120ms var(--ease);
	}

	.header-icon-btn:hover {
		background: var(--bg-2);
		color: var(--text-1);
	}

	.header-icon-btn--active {
		background: var(--bg-2);
		color: var(--accent);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 999px;
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

	.menu__item--active {
		color: var(--text-1);
	}

	.menu__item--danger {
		color: var(--danger);
	}

	.scope__avatar--sm {
		width: 18px;
		height: 18px;
		font-size: 9px;
		border-radius: 4px;
	}

	:global(.check-icon) {
		margin-left: auto;
		color: var(--accent);
	}
</style>
