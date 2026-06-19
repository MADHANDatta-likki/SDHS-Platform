export const STORAGE_BUCKET =
  import.meta.env.VITE_STORAGE_BUCKET || 'sdhs-public-assets';

export const STORAGE_PREFIX =
  import.meta.env.VITE_STORAGE_PREFIX || 'prod';

export const buildStoragePath = (folder: string, fileName: string): string => {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const cleanFileName = fileName.replace(/^\/+/g, '');

  return `${STORAGE_PREFIX}/${cleanFolder}/${cleanFileName}`;
};

export const extractStoragePathFromPublicUrl = (
  publicUrl: string,
  bucketName = STORAGE_BUCKET
): string | null => {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
};
