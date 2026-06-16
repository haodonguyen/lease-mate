import type { MetadataRoute } from "next";
import { listPublishedListings } from "@/lib/server/listing-service";

function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/marketplace`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/signup`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const listings = await listPublishedListings();
    listingRoutes = listings.map((listing) => ({
      url: `${baseUrl}/listings/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to build listing sitemap entries", error);
  }

  return [...staticRoutes, ...listingRoutes];
}
