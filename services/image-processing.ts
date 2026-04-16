import { SaveFormat, manipulateAsync, type Action } from "expo-image-manipulator";
import { Image } from "react-native";

type PrepareImageOptions = {
  compress?: number;
  maxDimension?: number;
};

function clampCompression(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.82;
  }

  return Math.min(Math.max(value, 0), 1);
}

function getImageSize(uri: string) {
  return new Promise<{ height: number; width: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ height, width }),
      reject
    );
  });
}

async function buildResizeActions(uri: string, maxDimension?: number): Promise<Action[]> {
  if (!maxDimension || maxDimension <= 0) {
    return [];
  }

  const { width, height } = await getImageSize(uri);
  const largestSide = Math.max(width, height);

  if (largestSide <= maxDimension) {
    return [];
  }

  return width >= height
    ? [{ resize: { width: maxDimension } }]
    : [{ resize: { height: maxDimension } }];
}

export async function prepareImageForUpload(
  uri: string,
  options: PrepareImageOptions = {}
) {
  const normalizedUri = uri.trim();

  if (!normalizedUri) {
    return uri;
  }

  try {
    const actions = await buildResizeActions(normalizedUri, options.maxDimension);
    const result = await manipulateAsync(normalizedUri, actions, {
      compress: clampCompression(options.compress),
      format: SaveFormat.JPEG,
    });

    return result.uri;
  } catch (error) {
    console.warn("Image preparation failed, falling back to original asset.", error);
    return normalizedUri;
  }
}
