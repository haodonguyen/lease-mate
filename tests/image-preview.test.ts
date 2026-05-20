import { describe, expect, it } from "vitest";
import { getListingImagePreviewState } from "../src/lib/image-preview";

describe("listing image preview", () => {
  it("waits for an image URL before showing a preview", () => {
    expect(getListingImagePreviewState("   ")).toEqual({
      status: "empty",
      message: "Add an image URL to preview the listing photo.",
    });
  });

  it("rejects unsupported or malformed image URLs", () => {
    expect(getListingImagePreviewState("not-a-url")).toEqual({
      status: "invalid",
      message: "Use a valid http or https image URL.",
    });

    expect(getListingImagePreviewState("ftp://example.com/photo.jpg").status).toBe("invalid");
  });

  it("returns a ready preview state for valid http image URLs", () => {
    expect(getListingImagePreviewState("https://images.unsplash.com/photo-1")).toEqual({
      status: "ready",
      url: "https://images.unsplash.com/photo-1",
      message: "Image preview is ready.",
    });
  });

  it("surfaces a broken-image state when the preview fails to load", () => {
    expect(getListingImagePreviewState("https://example.com/broken.jpg", true)).toEqual({
      status: "error",
      url: "https://example.com/broken.jpg",
      message: "This image could not be loaded. Try another public image URL.",
    });
  });
});
