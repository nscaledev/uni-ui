<script lang="ts">
	interface Props {
		name: string;
		size?: number;
		class?: string;
	}

	let { name, size = 20, class: cls = '' }: Props = $props();
</script>

<!-- nav -->
{#if name === 'dashboard'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="3" y="3" width="6" height="8" rx="1.5" />
		<rect x="3" y="13" width="6" height="4" rx="1.5" />
		<rect x="11" y="3" width="6" height="4" rx="1.5" />
		<rect x="11" y="9" width="6" height="8" rx="1.5" />
	</svg>
{:else if name === 'user'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="7" r="3" />
		<path d="M4 17c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5" />
	</svg>
{:else if name === 'users'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="7" cy="7" r="2.5" />
		<path d="M2 16c.5-2.5 2.5-4 5-4s4.5 1.5 5 4" />
		<circle cx="14" cy="6" r="2" />
		<path d="M12 12c2.5 0 4.5 1.5 5 4" />
	</svg>
{:else if name === 'network'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="2.5" y="12" width="5" height="4" rx="1" />
		<rect x="12.5" y="12" width="5" height="4" rx="1" />
		<rect x="7.5" y="4" width="5" height="4" rx="1" />
		<path d="M10 8v2M10 10H5v2M10 10h5v2" />
	</svg>
{:else if name === 'cpu'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="5" y="5" width="10" height="10" rx="1.5" />
		<rect x="8" y="8" width="4" height="4" rx="0.5" />
		<path d="M8 2v3M12 2v3M8 15v3M12 15v3M2 8h3M2 12h3M15 8h3M15 12h3" />
	</svg>
{:else if name === 'k8s'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" />
		<circle cx="10" cy="10" r="2.5" />
		<path d="M10 2v5M10 13v5M5 7l3.5 2M11.5 11l3.5 2M15 7l-3.5 2M8.5 11L5 13" />
	</svg>
{:else if name === 'globe'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="10" r="7" />
		<path d="M3 10h14M10 3c2.5 2 3.5 4.5 3.5 7s-1 5-3.5 7c-2.5-2-3.5-4.5-3.5-7s1-5 3.5-7z" />
	</svg>
{:else if name === 'log'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="4" y="3" width="12" height="14" rx="1.5" />
		<path d="M7 7h6M7 10h6M7 13h4" />
	</svg>
{:else if name === 'settings'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="10" r="2.5" />
		<path
			d="M10 2v2.5M10 15.5V18M18 10h-2.5M4.5 10H2M15.7 4.3l-1.8 1.8M6.1 13.9l-1.8 1.8M15.7 15.7l-1.8-1.8M6.1 6.1L4.3 4.3"
		/>
	</svg>

	<!-- actions / ui -->
{:else if name === 'search'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="9" cy="9" r="5" />
		<path d="M13 13l4 4" />
	</svg>
{:else if name === 'plus'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M10 4v12M4 10h12" /></svg
	>
{:else if name === 'minus'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M4 10h12" /></svg
	>
{:else if name === 'check'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M4 10l4 4 8-8" /></svg
	>
{:else if name === 'checkCircle'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="10" r="7" />
		<path d="M7 10l2 2 4-4" />
	</svg>
{:else if name === 'x'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M5 5l10 10M15 5L5 15" /></svg
	>
{:else if name === 'chevronDown'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M5 8l5 5 5-5" /></svg
	>
{:else if name === 'chevronUp'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M5 12l5-5 5 5" /></svg
	>
{:else if name === 'chevronRight'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M8 5l5 5-5 5" /></svg
	>
{:else if name === 'chevronLeft'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M12 5l-5 5 5 5" /></svg
	>
{:else if name === 'sortAsc'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M5 12l5-5 5 5" /></svg
	>
{:else if name === 'sortDesc'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M5 8l5 5 5-5" /></svg
	>
{:else if name === 'arrowsUpDown'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M7 4v12M4 13l3 3 3-3M13 16V4M10 7l3-3 3 3" />
	</svg>
{:else if name === 'more'}
	<svg
		width={size}
		height={size}
		viewBox="0 0 20 20"
		aria-hidden="true"
		fill="currentColor"
		stroke="none"
		class={cls}
	>
		<circle cx="5" cy="10" r="1" />
		<circle cx="10" cy="10" r="1" />
		<circle cx="15" cy="10" r="1" />
	</svg>
{:else if name === 'trash'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M3.5 5h13M7 5V3.5h6V5M5 5l1 11.5h8L15 5" /></svg
	>
{:else if name === 'copy'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="5" y="3" width="10" height="12" rx="1.5" />
		<path d="M13 17H5a2 2 0 01-2-2V7" />
	</svg>
{:else if name === 'refresh'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M3 10a7 7 0 0112-5M17 10a7 7 0 01-12 5" />
		<path d="M15 2v4h-4M5 18v-4h4" />
	</svg>
{:else if name === 'restartAlert'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M4 10a6 6 0 0110.5-4M16 10a6 6 0 01-10.5 4" />
		<path d="M14 4v3h-3" />
		<path d="M10 13v1.5" />
		<circle cx="10" cy="17" r=".75" fill="currentColor" stroke="none" />
	</svg>
{:else if name === 'filter'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M3 5h14L12 11v5l-4 1v-6z" /></svg
	>
{:else if name === 'download'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M10 3v10M6 9l4 4 4-4" />
		<path d="M3 17h14" />
	</svg>
{:else if name === 'columns'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="3" y="4" width="14" height="12" rx="1.5" />
		<path d="M8 4v12M12 4v12" />
	</svg>
{:else if name === 'eye'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M1.5 10C3.5 6 6.5 4 10 4s6.5 2 8.5 6c-2 4-5 6-8.5 6s-6.5-2-8.5-6z" />
		<circle cx="10" cy="10" r="2" />
	</svg>
{:else if name === 'star'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M10 3l2.3 4.6 5.2.7-3.8 3.6.9 5.1L10 14.8 5.4 17l.9-5.1L2.5 8.3l5.2-.7L10 3z" /></svg
	>
{:else if name === 'folder'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path
			d="M2.5 5.5a1 1 0 011-1H8l1.5 1.5h7a1 1 0 011 1v7.5a1 1 0 01-1 1h-13a1 1 0 01-1-1v-8z"
		/></svg
	>
{:else if name === 'tag'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M10 2H3v7l9 9 7-7-9-9z" />
		<circle cx="6.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
	</svg>
{:else if name === 'clock'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="10" r="7" />
		<path d="M10 6v4l3 2" />
	</svg>
{:else if name === 'edit'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M4 16h4l9-9-4-4-9 9v4z" />
		<path d="M12 5l3 3" />
	</svg>
{:else if name === 'link'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M8 12l4-4" />
		<path d="M10 6l1-1a3 3 0 014 4l-1 1" />
		<path d="M10 14l-1 1a3 3 0 01-4-4l1-1" />
	</svg>
{:else if name === 'bolt'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" /></svg
	>
{:else if name === 'shield'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M10 2l6 2v6c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8V4l6-2z" /></svg
	>
{:else if name === 'layers'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M10 3L3 7l7 4 7-4-7-4z" />
		<path d="M3 12l7 4 7-4" stroke-opacity="0.5" />
		<path d="M3 17l7-4 7 4" stroke-opacity="0.3" />
	</svg>
{:else if name === 'list'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M4 5h12M4 10h12M4 15h12" /></svg
	>
{:else if name === 'grid'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="3" y="3" width="6" height="6" rx="1" />
		<rect x="11" y="3" width="6" height="6" rx="1" />
		<rect x="3" y="11" width="6" height="6" rx="1" />
		<rect x="11" y="11" width="6" height="6" rx="1" />
	</svg>
{:else if name === 'sun'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="10" r="3.5" />
		<path
			d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4"
		/>
	</svg>
{:else if name === 'moon'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M15.5 11.5A6 6 0 018.5 4.5 6 6 0 1015.5 11.5z" /></svg
	>
{:else if name === 'dim'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M10 3a7 7 0 100 14 5 5 0 010-10 5 5 0 000 10A7 7 0 0010 3z" /></svg
	>

	<!-- app-specific additions -->
{:else if name === 'alert'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="10" r="7" />
		<path d="M10 7v4" />
		<circle cx="10" cy="14" r=".6" fill="currentColor" stroke="none" />
	</svg>
{:else if name === 'info'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="10" cy="10" r="7" />
		<path d="M10 10v4" />
		<circle cx="10" cy="7" r=".6" fill="currentColor" stroke="none" />
	</svg>
{:else if name === 'building'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M3 17V5a1 1 0 011-1h12a1 1 0 011 1v12" />
		<path d="M1 17h18" />
		<rect x="7" y="11" width="6" height="6" rx=".5" />
		<rect x="7" y="6" width="2.5" height="2.5" rx=".3" />
		<rect x="10.5" y="6" width="2.5" height="2.5" rx=".3" />
	</svg>
{:else if name === 'key'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="7.5" cy="10" r="3.5" />
		<path d="M11 10h6M15 10v2" />
	</svg>
{:else if name === 'id'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="3" y="5" width="14" height="10" rx="1.5" />
		<path d="M7 8v4M10 8c1.5 0 3 .5 3 2s-1.5 2-3 2" />
	</svg>
{:else if name === 'logout'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M8 5H5a1 1 0 00-1 1v8a1 1 0 001 1h3" />
		<path d="M13 7l3 3-3 3M8 10h8" />
	</svg>
{:else if name === 'menu'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}
		><path d="M3 6h14M3 10h14M3 14h14" /></svg
	>
{:else if name === 'connection'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<circle cx="5" cy="10" r="2.5" />
		<circle cx="15" cy="10" r="2.5" />
		<path d="M7.5 10h5" />
	</svg>
{:else if name === 'dns'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="3" y="4" width="14" height="5" rx="1" />
		<rect x="3" y="11" width="14" height="5" rx="1" />
		<circle cx="6.5" cy="6.5" r=".75" fill="currentColor" stroke="none" />
		<circle cx="6.5" cy="13.5" r=".75" fill="currentColor" stroke="none" />
		<path d="M9 6.5h5M9 13.5h5" />
	</svg>
{:else if name === 'checkNetwork'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="2.5" y="12" width="5" height="4" rx="1" />
		<rect x="12.5" y="12" width="5" height="4" rx="1" />
		<rect x="7.5" y="4" width="5" height="4" rx="1" />
		<path d="M10 8v2M10 10H5v2M10 10h5v2" />
		<path d="M15 6l-1.5 1.5L12.5 6" />
	</svg>
{:else if name === 'usb'}
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<path d="M10 3v11" />
		<path d="M7.5 11c0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5" />
		<path d="M8 5.5L10 3l2 2.5" />
		<path d="M8 7.5h4M8 7.5v2M12 7.5v1.5" />
	</svg>
{:else}
	<!-- Unknown icon: render a small placeholder square so missing icons are obvious -->
	<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" class={cls}>
		<rect x="5" y="5" width="10" height="10" rx="2" stroke-dasharray="3 2" />
	</svg>
{/if}

<style>
	svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		display: inline-block;
		vertical-align: middle;
		flex-shrink: 0;
	}
</style>
