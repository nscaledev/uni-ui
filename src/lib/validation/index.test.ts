import { describe, it, expect } from 'vitest';
import {
	validateString,
	stringSet,
	stringInt,
	stringIntOrUndefined,
	kubernetesNameValid,
	kubernetesLabelValueValid,
	unique,
	GetKubernetesNameValidators,
	GetKubernetesLabelValueValidators
} from './index';

describe('validateString', () => {
	it('returns true when all validators pass', () => {
		expect(validateString('hello', [stringSet, (s) => s.length > 3])).toBe(true);
	});

	it('returns false when any validator fails', () => {
		expect(validateString('', [stringSet, (s) => s.length > 3])).toBe(false);
	});

	it('returns true with an empty validator array', () => {
		expect(validateString('anything', [])).toBe(true);
	});
});

describe('stringSet', () => {
	it('returns false for empty string', () => {
		expect(stringSet('')).toBe(false);
	});

	it('returns true for non-empty string', () => {
		expect(stringSet('a')).toBe(true);
		expect(stringSet('hello world')).toBe(true);
	});
});

describe('stringInt', () => {
	it('returns true for valid integer strings', () => {
		expect(stringInt('0')).toBe(true);
		expect(stringInt('42')).toBe(true);
		expect(stringInt('-1')).toBe(true);
	});

	it('returns false for non-integer strings', () => {
		expect(stringInt('')).toBe(false);
		expect(stringInt('abc')).toBe(false);
		expect(stringInt('1.5')).toBe(true); // parseInt('1.5') === 1
	});
});

describe('stringIntOrUndefined', () => {
	it('returns true for empty string', () => {
		expect(stringIntOrUndefined('')).toBe(true);
	});

	it('returns true for valid integer strings', () => {
		expect(stringIntOrUndefined('0')).toBe(true);
		expect(stringIntOrUndefined('100')).toBe(true);
	});

	it('returns false for non-integer non-empty strings', () => {
		expect(stringIntOrUndefined('abc')).toBe(false);
	});
});

describe('kubernetesNameValid', () => {
	it('returns false for null and undefined', () => {
		expect(kubernetesNameValid(null)).toBe(false);
		expect(kubernetesNameValid(undefined)).toBe(false);
	});

	it('returns false for empty string', () => {
		expect(kubernetesNameValid('')).toBe(false);
	});

	it('returns true for valid RFC-1123 names', () => {
		expect(kubernetesNameValid('my-cluster')).toBe(true);
		expect(kubernetesNameValid('a')).toBe(true);
		expect(kubernetesNameValid('abc123')).toBe(true);
		expect(kubernetesNameValid('my-cluster-01')).toBe(true);
	});

	it('returns false for names starting or ending with a hyphen', () => {
		expect(kubernetesNameValid('-foo')).toBe(false);
		expect(kubernetesNameValid('foo-')).toBe(false);
	});

	it('returns false for names with uppercase letters', () => {
		expect(kubernetesNameValid('MyCluster')).toBe(false);
	});

	it('returns false for names with underscores', () => {
		expect(kubernetesNameValid('my_cluster')).toBe(false);
	});

	it('returns false for names longer than 63 characters', () => {
		expect(kubernetesNameValid('a'.repeat(64))).toBe(false);
	});

	it('returns true for names exactly 63 characters', () => {
		// 62 chars of 'a' + 1 char 'b' = 63, but pattern is [a-z0-9][a-z0-9-.]{0,61}[a-z0-9]
		// so 2 + 61 = 63 max
		expect(kubernetesNameValid('a' + 'b'.repeat(61) + 'c')).toBe(true);
	});
});

describe('kubernetesLabelValueValid', () => {
	it('returns false for null and undefined', () => {
		expect(kubernetesLabelValueValid(null)).toBe(false);
		expect(kubernetesLabelValueValid(undefined)).toBe(false);
	});

	it('returns true for valid label values', () => {
		expect(kubernetesLabelValueValid('MyValue')).toBe(true);
		expect(kubernetesLabelValueValid('my.value')).toBe(true);
		expect(kubernetesLabelValueValid('my-value')).toBe(true);
		expect(kubernetesLabelValueValid('my_value')).toBe(true);
		expect(kubernetesLabelValueValid('Value123')).toBe(true);
	});

	it('returns false for values starting with a non-alphanumeric', () => {
		expect(kubernetesLabelValueValid('-foo')).toBe(false);
		expect(kubernetesLabelValueValid('.foo')).toBe(false);
		expect(kubernetesLabelValueValid('_foo')).toBe(false);
	});

	it('returns false for values ending with a non-alphanumeric', () => {
		expect(kubernetesLabelValueValid('foo-')).toBe(false);
		expect(kubernetesLabelValueValid('foo.')).toBe(false);
	});

	it('returns false for values longer than 63 characters', () => {
		expect(kubernetesLabelValueValid('A'.repeat(64))).toBe(false);
	});
});

describe('unique', () => {
	it('returns true when haystack is undefined', () => {
		expect(unique('foo', undefined)).toBe(true);
	});

	it('returns true when needle is not in haystack', () => {
		expect(unique('foo', ['bar', 'baz'])).toBe(true);
	});

	it('returns false when needle is in haystack', () => {
		expect(unique('foo', ['foo', 'bar'])).toBe(false);
	});
});

describe('GetKubernetesNameValidators', () => {
	it('rejects empty string', () => {
		const validators = GetKubernetesNameValidators(undefined);
		expect(validateString('', validators)).toBe(false);
	});

	it('rejects invalid kubernetes names', () => {
		const validators = GetKubernetesNameValidators(undefined);
		expect(validateString('Invalid_Name', validators)).toBe(false);
	});

	it('rejects names already in the existing list', () => {
		const validators = GetKubernetesNameValidators(['existing']);
		expect(validateString('existing', validators)).toBe(false);
	});

	it('accepts a valid unique name', () => {
		const validators = GetKubernetesNameValidators(['other']);
		expect(validateString('my-cluster', validators)).toBe(true);
	});
});

describe('GetKubernetesLabelValueValidators', () => {
	it('rejects empty string', () => {
		const validators = GetKubernetesLabelValueValidators(undefined);
		expect(validateString('', validators)).toBe(false);
	});

	it('rejects duplicate names', () => {
		const validators = GetKubernetesLabelValueValidators(['pool-1']);
		expect(validateString('pool-1', validators)).toBe(false);
	});

	it('accepts a valid unique label value', () => {
		const validators = GetKubernetesLabelValueValidators(['pool-1']);
		expect(validateString('pool-2', validators)).toBe(true);
	});
});
