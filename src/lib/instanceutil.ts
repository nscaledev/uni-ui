import { validate as isUUID } from 'uuid';
import type * as Compute from '$lib/openapi/compute';

export function selectableInstanceFlavors(
	flavors: Array<Compute.Flavor>,
	images: Array<Compute.Image>
): Array<Compute.Flavor> {
	// Ignore invalid Region inventory entries before offering them to Compute.
	return flavors.filter(
		(flavor) =>
			isUUID(flavor.metadata.id) &&
			images.some(
				(image) =>
					flavor.spec.disk >= image.spec.sizeGiB &&
					flavor.spec.architecture === image.spec.architecture
			)
	);
}
