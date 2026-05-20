export type ListingImagePreviewState =
  | { status: "empty"; message: string }
  | { status: "invalid"; message: string }
  | { status: "ready"; url: string; message: string }
  | { status: "error"; url: string; message: string };

export function getListingImagePreviewState(value: string, hasLoadError = false): ListingImagePreviewState {
  const url = value.trim();

  if (!url) {
    return {
      status: "empty",
      message: "Add an image URL to preview the listing photo.",
    };
  }

  if (!isHttpUrl(url)) {
    return {
      status: "invalid",
      message: "Use a valid http or https image URL.",
    };
  }

  if (hasLoadError) {
    return {
      status: "error",
      url,
      message: "This image could not be loaded. Try another public image URL.",
    };
  }

  return {
    status: "ready",
    url,
    message: "Image preview is ready.",
  };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
