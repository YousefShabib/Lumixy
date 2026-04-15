type PrepareImageOptions = {
  compress?: number;
  maxDimension?: number;
};

export async function prepareImageForUpload(
  uri: string,
  options: PrepareImageOptions = {}
) {
  void options;
  return uri;
}
