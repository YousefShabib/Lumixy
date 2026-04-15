import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'react-native';

type PrepareImageOptions = {
  compress?: number;
  maxDimension?: number;
};

function getImageSize(uri: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
}

export async function prepareImageForUpload(
  uri: string,
  options: PrepareImageOptions = {}
) {
  const { compress = 0.72, maxDimension = 1600 } = options;
  const actions: Array<{ resize: { width?: number; height?: number } }> = [];

  try {
    const { width, height } = await getImageSize(uri);

    if (Math.max(width, height) > maxDimension) {
      actions.push(
        width >= height
          ? { resize: { width: maxDimension } }
          : { resize: { height: maxDimension } }
      );
    }
  } catch {
    // If we fail to measure the image, we still convert it to a backend-safe JPEG.
  }

  const result = await manipulateAsync(uri, actions, {
    compress,
    format: SaveFormat.JPEG,
  });

  return result.uri;
}
