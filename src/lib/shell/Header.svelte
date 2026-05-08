<script lang="ts">
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import Icon from '$lib/primitives/Icon.svelte';
	import { logout } from '$lib/credentials';
	import type { IDToken } from '$lib/oidc';
	import type { OrganizationRead, ProjectRead } from '$lib/openapi/identity';
	import { tweaksOpen } from '$lib/stores/theme';
	import ScopePicker from '$lib/shell/ScopePicker.svelte';
	import OmniSearch from '$lib/shell/OmniSearch.svelte';

	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)',
		'oklch(0.65 0.18 290)',
		'oklch(0.68 0.16 30)',
		'oklch(0.65 0.18 340)',
		'oklch(0.65 0.16 170)',
		'oklch(0.68 0.16 80)'
	];

	interface Props {
		profile: IDToken;
		organizations: Array<OrganizationRead>;
		organizationID: string;
		projects: Array<ProjectRead>;
		projectID: string | null;
	}

	let { profile, organizations, organizationID, projects, projectID }: Props = $props();

	const organization = $derived(organizations.find((o) => o.metadata.id === organizationID));
	const project = $derived(projectID ? projects.find((p) => p.metadata.id === projectID) : null);

	function projectColor(p: ProjectRead): string {
		const i = projects.indexOf(p);
		return PROJECT_PALETTE[i % PROJECT_PALETTE.length];
	}

	// ── scope picker ──────────────────────────────────────────
	let scopeOpen = $state(false);
	let scopeTriggerEl: HTMLButtonElement;
	let scopePanelEl: HTMLDivElement;

	async function repositionScope() {
		if (!scopeTriggerEl || !scopePanelEl) return;
		const { x, y } = await computePosition(scopeTriggerEl, scopePanelEl, {
			placement: 'bottom-start',
			middleware: [offset(6), flip(), shift({ padding: 8 })]
		});
		Object.assign(scopePanelEl.style, { left: `${x}px`, top: `${y}px` });
	}

	$effect(() => {
		if (scopeOpen) repositionScope();
	});

	const orgInitials = $derived.by(() => {
		const name = organization?.metadata.name ?? '';
		const words = name.trim().split(/\s+/);
		return words.length >= 2
			? (words[0][0] + words[1][0]).toUpperCase()
			: name.slice(0, 2).toUpperCase();
	});

	// ── user menu ─────────────────────────────────────────────
	let menuOpen = $state(false);
	let avatarTriggerEl: HTMLButtonElement;
	let menuEl: HTMLDivElement;

	const initials = $derived.by(() => {
		if (profile.given_name && profile.family_name)
			return (profile.given_name[0] + profile.family_name[0]).toUpperCase();
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

	// ── shared outside-click / escape ─────────────────────────
	function onwindowpointerdown(e: PointerEvent) {
		const t = e.target as Node;
		if (scopeOpen && !scopeTriggerEl?.contains(t) && !scopePanelEl?.contains(t)) scopeOpen = false;
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
	<!-- Scope pill -->
	<button
		bind:this={scopeTriggerEl}
		class="scope"
		onclick={() => (scopeOpen = !scopeOpen)}
		aria-haspopup="dialog"
		aria-expanded={scopeOpen}
		aria-label="Switch organization or project"
	>
		<span class="scope__avatar">{orgInitials}</span>
		<span class="scope__label">{organization?.metadata.name ?? '…'}</span>
		{#if project}
			<span class="scope__sep">/</span>
			<span class="scope__soft" style="color:{projectColor(project)}">{project.metadata.name}</span>
		{/if}
		<Icon name="chevronDown" size={12} />
	</button>

	<OmniSearch />

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

<!-- Scope picker popover -->
{#if scopeOpen}
	<div bind:this={scopePanelEl} class="menu menu--wide" style="position:fixed;z-index:200;">
		<ScopePicker
			{organizations}
			{organizationID}
			{projects}
			{projectID}
			onclose={() => (scopeOpen = false)}
		/>
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
			<Icon name="logout" size={14} />Sign out
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

	.menu__item--danger {
		color: var(--danger);
	}
</style>
