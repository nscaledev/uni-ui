import type * as Compute from '#lib/openapi/compute/index.ts';

export function selectableInstanceFlavors(
	flavors: Array<Compute.Flavor>,
	images: Array<Compute.Image>
): Array<Compute.Flavor> {
	return flavors.filter((flavor) =>
		images.some(
			(image) =>
				flavor.spec.disk >= image.spec.sizeGiB &&
				flavor.spec.architecture === image.spec.architecture
		)
	);
}

export function imageFitsFlavor(image: Compute.Image, flavor: Compute.Flavor | undefined): boolean {
	return (
		!!flavor &&
		image.spec.sizeGiB <= flavor.spec.disk &&
		image.spec.architecture === flavor.spec.architecture
	);
}

// Only images in the catalog can be checked against the flavor; any other
// image is left for the server to validate.
export function imageIncompatible(
	images: Array<Compute.Image>,
	flavor: Compute.Flavor | undefined,
	imageID: string
): boolean {
	const image = images.find((x) => x.metadata.id === imageID);
	return !!image && !imageFitsFlavor(image, flavor);
}

// The instance's current image stays selectable even when the catalog doesn't
// list it, because Compute accepts any image Region makes available.
export function editableInstanceImageIDs(
	images: Array<Compute.Image>,
	flavor: Compute.Flavor | undefined,
	currentImageID: string
): Array<string> {
	const ids = images.filter((x) => imageFitsFlavor(x, flavor)).map((x) => x.metadata.id);
	if (ids.includes(currentImageID) || imageIncompatible(images, flavor, currentImageID)) return ids;
	return [currentImageID, ...ids];
}

// Returns the user data text, or null when the stored value isn't UTF-8 text
// (for example gzip) and so can't be edited as text.
export function decodeUserData(encoded: string | undefined): string | null {
	if (!encoded) return '';
	try {
		return decodeURIComponent(escape(atob(encoded)));
	} catch {
		return null;
	}
}

// Chooses userData for an instance update. The stored value is always resent
// rather than omitted, because older Compute versions clear omitted user data.
// Unchanged text resends the stored bytes, as re-encoding may not reproduce
// them. Null text keeps the stored value; empty text clears it with "".
export function userDataForUpdate(
	stored: string | undefined,
	text: string | null
): string | undefined {
	if (text === null || text === decodeUserData(stored)) return stored;
	return text ? btoa(unescape(encodeURIComponent(text))) : '';
}
