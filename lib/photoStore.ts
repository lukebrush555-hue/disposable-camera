import * as FileSystem from "expo-file-system/legacy";

export type TempPhoto = {
  id: string;
  fileUri: string;
  createdAt: string;
  expiresAt: string;
};

const PHOTO_DIR = `${FileSystem.documentDirectory}temp-photos/`;
const METADATA_FILE = `${FileSystem.documentDirectory}temp-photos.json`;
const TEST_EXPIRATION_SECONDS = 30;

async function ensureStorageReady() {
  if (!FileSystem.documentDirectory) {
    throw new Error("App private storage is not available on this device/runtime.");
  }

  const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }

  const metadataInfo = await FileSystem.getInfoAsync(METADATA_FILE);
  if (!metadataInfo.exists) {
    await FileSystem.writeAsStringAsync(METADATA_FILE, JSON.stringify([]));
  }
}

async function readPhotosUnsafe(): Promise<TempPhoto[]> {
  await ensureStorageReady();
  const raw = await FileSystem.readAsStringAsync(METADATA_FILE);
  try {
    return JSON.parse(raw) as TempPhoto[];
  } catch {
    await FileSystem.writeAsStringAsync(METADATA_FILE, JSON.stringify([]));
    return [];
  }
}

async function writePhotos(photos: TempPhoto[]) {
  await ensureStorageReady();
  await FileSystem.writeAsStringAsync(METADATA_FILE, JSON.stringify(photos, null, 2));
}

export async function saveTempPhoto(sourceUri: string): Promise<TempPhoto> {
  await ensureStorageReady();

  const now = new Date();
  const id = `photo-${now.getTime()}`;
  const fileUri = `${PHOTO_DIR}${id}.jpg`;
  const expiresAt = new Date(now.getTime() + TEST_EXPIRATION_SECONDS * 1000);

  await FileSystem.copyAsync({ from: sourceUri, to: fileUri });

  const photo: TempPhoto = {
    id,
    fileUri,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const photos = await readPhotosUnsafe();
  await writePhotos([photo, ...photos]);
  return photo;
}

export async function listPhotos(): Promise<TempPhoto[]> {
  await cleanupExpiredPhotos();
  return readPhotosUnsafe();
}

export async function deletePhoto(id: string) {
  const photos = await readPhotosUnsafe();
  const photo = photos.find((item) => item.id === id);

  if (photo) {
    const info = await FileSystem.getInfoAsync(photo.fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(photo.fileUri, { idempotent: true });
    }
  }

  await writePhotos(photos.filter((item) => item.id !== id));
}

export async function cleanupExpiredPhotos() {
  const photos = await readPhotosUnsafe();
  const now = Date.now();
  const active: TempPhoto[] = [];

  for (const photo of photos) {
    if (new Date(photo.expiresAt).getTime() <= now) {
      const info = await FileSystem.getInfoAsync(photo.fileUri);
      if (info.exists) {
        await FileSystem.deleteAsync(photo.fileUri, { idempotent: true });
      }
    } else {
      active.push(photo);
    }
  }

  if (active.length !== photos.length) {
    await writePhotos(active);
  }
}

export function getTimeRemainingLabel(expiresAt: string) {
  const msRemaining = new Date(expiresAt).getTime() - Date.now();

  if (msRemaining <= 0) return "expired";

  const seconds = Math.ceil(msRemaining / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.ceil(hours / 24);
  return `${days}d`;
}
