import type * as Compute from '$lib/openapi/compute';

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
