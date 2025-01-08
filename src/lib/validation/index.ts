// A function that validates a string.
type StringValidatorFunc = (s: string) => boolean;

// A list of string validators with descriptions.
export type StringValidators = Array<StringValidatorFunc>;

// Given a string and an array of validators, check the string against
// each validator, if any fails, then return false and the description,
// otheriwse true and null.
export function validateString(s: string, validators: StringValidators): boolean {
	return validators.every((v: StringValidatorFunc) => v(s));
}

export function stringSet(s: string): boolean {
	return Boolean(s);
}

export function stringInt(s: string): boolean {
	return !isNaN(parseInt(s, 10));
}

export function stringIntOrUndefined(s: string): boolean {
	return s == '' || !isNaN(parseInt(s, 10));
}

export function kubernetesNameValid(name: string | null | undefined): boolean {
	if (!name) return false;
	// RFC-1123.  Must start and end with alphanumeric.
	// Upto 63 characters, lower case alpha, numeric and -.
	return name.match(/^(?!-)[a-z0-9-]{0,62}[a-z0-9]$/) != null;
}

export function unique(needle: string, haystack: Array<string> | undefined): boolean {
	if (!haystack) return true;
	return !haystack.includes(needle);
}

export function GetKubernetesNameValidators(names: Array<string> | undefined): StringValidators {
	return [stringSet, kubernetesNameValid, (name: string) => unique(name, names)];
}
