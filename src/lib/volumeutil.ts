import type * as Region from '$lib/openapi/region';

export function attachableVolumes(
	volumes: Array<Region.VolumeV2Read>,
	volumeClasses: Array<Region.VolumeClassV2Read>,
	flavorID: string,
	retainedVolumeIDs: Array<string> = []
): Array<Region.VolumeV2Read> {
	const retained = new Set(retainedVolumeIDs);

	return volumes.filter((volume) => {
		if (retained.has(volume.metadata.id)) return true;
		if (volume.metadata.provisioningStatus === 'deprovisioning' || volume.status.attachedAt)
			return false;

		return volumeCompatible(volume, volumeClasses, flavorID);
	});
}

export function volumeCompatible(
	volume: Region.VolumeV2Read | undefined,
	volumeClasses: Array<Region.VolumeClassV2Read>,
	flavorID: string
): boolean {
	const volumeClass = volumeClasses.find(
		(volumeClass) => volumeClass.metadata.id === volume?.spec.volumeClassId
	);
	if (!volumeClass) return false;

	const supportedFlavorIDs = volumeClass.spec.supportedFlavorIds;
	return !!supportedFlavorIDs && Array.from(supportedFlavorIDs).includes(flavorID);
}

export function changedVolumeSelection(
	volumes: Array<string>,
	initialVolumes: Array<string>
): Array<string> | undefined {
	const volumeIDs = new Set(volumes);
	const initialVolumeIDs = new Set(initialVolumes);
	if (
		volumeIDs.size === initialVolumeIDs.size &&
		[...volumeIDs].every((id) => initialVolumeIDs.has(id))
	)
		return undefined;

	return volumes;
}
