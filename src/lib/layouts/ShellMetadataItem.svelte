<script lang="ts">
	interface Props {
		icon?: string;
		label: string;
		value: string;
	}

	// icon prop retained for API compatibility but not rendered —
	// the rcard__grid dt/dd layout is self-labelling.
	let { label, value }: Props = $props();
</script>

<dt>{label}</dt>
<dd>{value}</dd>
