<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import * as Clients from '$lib/clients';
	import type { OrganizationRead, ProjectRead } from '$lib/openapi/identity';
	import Icon from '$lib/primitives/Icon.svelte';

	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)',
		'oklch(0.65 0.18 290)',
		'oklch(0.68 0.16 30)',
		'oklch(0.65 0.18 340)',
		'oklch(0.65 0.16 170)',
		'oklch(0.68 0.16 80)'
	];

	const MAX_RECENT = 5;
	const RECENT_KEY = 'scope_recent_orgs';

	interface Props {
		organizations: Array<OrganizationRead>;
		organizationID: string;
		projects: Array<ProjectRead>;
		projectID: string | null;
		onclose: () => void;
	}

	let { organizations, organizationID, projects, projectID, onclose }: Props = $props();

	let orgQuery = $state('');
	let projQuery = $state('');
	let browseOrgID = $state(organizationID);
	let browseProjects = $state<Array<ProjectRead>>(projects);
	let browseLoading = $state(false);

	// ── recents ────────────────────────────────────────────────
	function loadRecents(): Array<string> {
		if (!browser) return [];
		try {
			return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
		} catch {
			return [];
		}
	}

	function pushRecent(id: string) {
		const next = [id, ...loadRecents().filter((x) => x !== id)].slice(0, MAX_RECENT);
		localStorage.setItem(RECENT_KEY, JSON.stringify(next));
	}

	const recentOrgIDs = $derived(
		loadRecents().filter((id) => organizations.some((o) => o.metadata.id === id))
	);
	const recentOrgs = $derived(
		recentOrgIDs
			.map((id) => organizations.find((o) => o.metadata.id === id))
			.filter(Boolean) as Array<OrganizationRead>
	);

	// ── filtered lists ─────────────────────────────────────────
	const searching = $derived(!!orgQuery.trim());
	const filteredOrgs = $derived(
		searching
			? organizations.filter((o) => o.metadata.name.toLowerCase().includes(orgQuery.toLowerCase()))
			: organizations
	);
	// In non-search mode, show recents above, then the rest below.
	const nonRecentOrgs = $derived(
		searching ? filteredOrgs : filteredOrgs.filter((o) => !recentOrgIDs.includes(o.metadata.id))
	);

	const filteredProjects = $derived(
		projQuery.trim()
			? browseProjects.filter((p) =>
					p.metadata.name.toLowerCase().includes(projQuery.toLowerCase())
				)
			: browseProjects
	);

	// ── org selection (commits + updates right panel) ──────────
	async function selectOrg(org: OrganizationRead) {
		pushRecent(org.metadata.id);
		if (org.metadata.id !== organizationID) {
			window.localStorage.setItem('organization_id', org.metadata.id);
			window.localStorage.removeItem('project_id');
			invalidate('app:organization_id');
			invalidate('app:project_id');
		}
		if (org.metadata.id === browseOrgID) return;
		browseOrgID = org.metadata.id;
		projQuery = '';
		if (org.metadata.id === organizationID) {
			browseProjects = projects;
			return;
		}
		browseLoading = true;
		try {
			browseProjects = await Clients.identity().apiV1OrganizationsOrganizationIDProjectsGet({
				organizationID: org.metadata.id
			});
		} catch {
			browseProjects = [];
		} finally {
			browseLoading = false;
		}
	}

	// ── project selection (commits + closes) ───────────────────
	function selectProject(id: string | null) {
		if (id) window.localStorage.setItem('project_id', id);
		else window.localStorage.removeItem('project_id');
		invalidate('app:project_id');
		onclose();
	}

	function orgInitials(name: string): string {
		const w = name.trim().split(/\s+/);
		return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
	}
</script>

<div class="menu-split">
	<!-- ── LEFT: organizations ── -->
	<div class="menu-col">
		<div class="menu-col__head">
			<div class="menu__title" style="padding: 0">
				Organization
				<span class="menu-col__count">{organizations.length}</span>
			</div>
			<div class="menu-search">
				<Icon name="search" size={13} class="menu-search-icon" />
				<input type="search" placeholder="Search…" bind:value={orgQuery} autofocus />
				{#if orgQuery}
					<button class="menu-search__clear" onclick={() => (orgQuery = '')}>
						<Icon name="x" size={11} />
					</button>
				{/if}
			</div>
		</div>

		<div class="menu-col__body">
			{#if !searching && recentOrgs.length > 0}
				<div class="menu-col__label">Recent</div>
				{#each recentOrgs as org}
					<button
						class="menu__item"
						class:menu__item--on={org.metadata.id === browseOrgID}
						onclick={() => selectOrg(org)}
					>
						<span class="org-avatar">{orgInitials(org.metadata.name)}</span>
						{org.metadata.name}
					</button>
				{/each}
				{#if nonRecentOrgs.length > 0}
					<div class="menu-col__label">All</div>
				{/if}
			{/if}

			{#each nonRecentOrgs as org}
				<button
					class="menu__item"
					class:menu__item--on={org.metadata.id === browseOrgID}
					onclick={() => selectOrg(org)}
				>
					<span class="org-avatar">{orgInitials(org.metadata.name)}</span>
					{org.metadata.name}
				</button>
			{/each}

			{#if filteredOrgs.length === 0}
				<div class="menu-col__empty">No organizations match</div>
			{/if}
		</div>

		<div class="menu-col__foot">
			{organizations.length} organization{organizations.length === 1 ? '' : 's'}
		</div>
	</div>

	<!-- ── RIGHT: projects ── -->
	<div class="menu-col">
		<div class="menu-col__head">
			<div class="menu__title" style="padding: 0">
				Project
				<span class="menu-col__count">{browseProjects.length}</span>
			</div>
			<div class="menu-search">
				<Icon name="search" size={13} class="menu-search-icon" />
				<input type="search" placeholder="Search…" bind:value={projQuery} />
				{#if projQuery}
					<button class="menu-search__clear" onclick={() => (projQuery = '')}>
						<Icon name="x" size={11} />
					</button>
				{/if}
			</div>
		</div>

		<div class="menu-col__body">
			{#if browseLoading}
				<div class="menu-col__empty">Loading…</div>
			{:else}
				<button
					class="menu__item"
					class:menu__item--on={browseOrgID === organizationID && !projectID}
					onclick={() => selectProject(null)}
				>
					<span class="proj-pip proj-pip--all"></span>
					All projects
				</button>

				{#each filteredProjects as proj, i}
					<button
						class="menu__item"
						class:menu__item--on={browseOrgID === organizationID && proj.metadata.id === projectID}
						onclick={() => selectProject(proj.metadata.id)}
					>
						<span class="proj-pip" style="background:{PROJECT_PALETTE[i % PROJECT_PALETTE.length]}"
						></span>
						{proj.metadata.name}
					</button>
				{/each}

				{#if filteredProjects.length === 0}
					<div class="menu-col__empty">{projQuery ? 'No projects match' : 'No projects'}</div>
				{/if}
			{/if}
		</div>

		<div class="menu-col__foot">
			{browseProjects.length} project{browseProjects.length === 1 ? '' : 's'}
		</div>
	</div>
</div>

<style>
	:global(.menu-search-icon) {
		color: var(--text-4);
		flex-shrink: 0;
	}

	.org-avatar {
		width: 20px;
		height: 20px;
		border-radius: 5px;
		display: grid;
		place-items: center;
		font: 600 9px/1 var(--font-sans);
		color: var(--accent-ink);
		background: linear-gradient(
			135deg,
			var(--accent),
			color-mix(in oklch, var(--accent) 40%, var(--violet))
		);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
		flex-shrink: 0;
	}

	.proj-pip {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		flex-shrink: 0;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
	}

	.proj-pip--all {
		background: var(--line-strong);
	}
</style>
