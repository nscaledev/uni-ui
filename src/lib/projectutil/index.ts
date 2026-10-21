interface NamedProject {
	metadata: { id: string; name: string };
}

export interface ProjectDisplay {
	name: string;
	color: string;
}

const palette: Array<string> = [
	'oklch(0.65 0.18 220)',
	'oklch(0.65 0.18 290)',
	'oklch(0.68 0.16 30)',
	'oklch(0.65 0.18 340)',
	'oklch(0.65 0.16 170)',
	'oklch(0.68 0.16 80)'
];

export function color(index: number): string {
	return palette[index % palette.length];
}

export function lookup(
	projects: Array<NamedProject>,
	projectID: string | undefined
): ProjectDisplay | null {
	const index = projects.findIndex((project) => project.metadata.id === projectID);
	return index < 0 ? null : { name: projects[index].metadata.name, color: color(index) };
}
