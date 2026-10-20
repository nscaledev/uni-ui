import { describe, expect, it } from 'vitest';
import { color, lookup } from '.';

describe('project display', () => {
	it('finds a project and cycles its color', () => {
		const projects = Array.from({ length: 7 }, (_, index) => ({
			metadata: { id: `${index}`, name: `Project ${index}` }
		}));

		expect(lookup(projects, '6')).toEqual({ name: 'Project 6', color: color(0) });
		expect(lookup(projects, 'missing')).toBeNull();
	});
});
