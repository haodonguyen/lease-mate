import { describe, expect, it } from "vitest";
import {
  buildListingUpdateData,
  buildListingPhotoCreateData,
  getRemovedListingPhotoStorageKeys,
  canEditListing,
  buildListingCreateData,
  canUpdateListingStatus,
  getListingReadinessFromRecord,
  normaliseListingFormInput,
} from "../src/lib/server/listing-service";

describe("listing service", () => {
  it("normalises listing form input into typed data", () => {
    const input = normaliseListingFormInput({
      title: "  Carlton lease transfer ",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Written consent received\nClose to tram",
      hasWrittenConsent: "on",
      bondTransferDiscussed: "on",
      agentOrLandlordAware: "on",
      newRenterAddedToLease: "on",
      understandsSubletRisk: "on",
    });

    expect(input.ok).toBe(true);
    if (input.ok) {
      expect(input.data).toEqual(
        expect.objectContaining({
          title: "Carlton lease transfer",
          rentPerWeek: 510,
          highlights: ["Written consent received", "Close to tram"],
        }),
      );
    }
  });

  it("normalises uploaded photo metadata and uses the first photo as the cover image", () => {
    const input = normaliseListingFormInput({
      title: "Sydney lease transfer near station",
      suburb: "Parramatta",
      state: "NSW",
      postcode: "2150",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "650",
      bondAmount: "2600",
      bedrooms: "2",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter with uploaded photos.",
      imageUrl: "",
      uploadedPhotos: JSON.stringify([
        {
          url: "https://utfs.io/f/photo-cover.jpg",
          key: "lease_photos/photo-cover.jpg",
          name: "living-room.jpg",
          size: 820000,
        },
        {
          url: "https://utfs.io/f/photo-bedroom.jpg",
          key: "lease_photos/photo-bedroom.jpg",
          name: "bedroom.jpg",
          size: 640000,
        },
      ]),
      highlights: "Near train\nBalcony",
      hasWrittenConsent: "on",
      bondTransferDiscussed: "on",
      agentOrLandlordAware: "on",
      newRenterAddedToLease: "on",
      understandsSubletRisk: "on",
    });

    expect(input.ok).toBe(true);
    if (input.ok) {
      expect(input.data.imageUrl).toBe("https://utfs.io/f/photo-cover.jpg");
      expect(input.data.uploadedPhotos).toEqual([
        {
          url: "https://utfs.io/f/photo-cover.jpg",
          storageKey: "lease_photos/photo-cover.jpg",
          name: "living-room.jpg",
          size: 820000,
        },
        {
          url: "https://utfs.io/f/photo-bedroom.jpg",
          storageKey: "lease_photos/photo-bedroom.jpg",
          name: "bedroom.jpg",
          size: 640000,
        },
      ]);
    }
  });

  it("rejects listing forms with more than eight uploaded photos", () => {
    const input = normaliseListingFormInput({
      title: "Sydney lease transfer near station",
      suburb: "Parramatta",
      state: "NSW",
      postcode: "2150",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "650",
      bondAmount: "2600",
      bedrooms: "2",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter with uploaded photos.",
      imageUrl: "",
      uploadedPhotos: JSON.stringify(
        Array.from({ length: 9 }, (_, index) => ({
          url: `https://utfs.io/f/photo-${index}.jpg`,
          key: `lease_photos/photo-${index}.jpg`,
        })),
      ),
      highlights: "Near train",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        uploadedPhotos: "Upload up to 8 listing photos",
      },
    });
  });

  it("does not treat the string false as checked consent", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "pending",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Close to tram",
      hasWrittenConsent: "false",
      bondTransferDiscussed: "false",
      agentOrLandlordAware: "false",
      newRenterAddedToLease: "false",
      understandsSubletRisk: "false",
    });

    expect(input.ok).toBe(true);
    if (input.ok) {
      expect(input.data.hasWrittenConsent).toBe(false);
      expect(input.data.agentOrLandlordAware).toBe(false);
    }
  });

  it("rejects invalid lease end dates before creating Prisma date values", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "not-a-date",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Close to tram",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        leaseEnds: "Lease end date must use YYYY-MM-DD format",
      },
    });
  });

  it("rejects image URLs that cannot be loaded by a browser as public http resources", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "ftp://example.com/photo.jpg",
      highlights: "Close to tram",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        imageUrl: "Image URL must use an approved image host",
      },
    });
  });

  it("rejects fallback image URLs from hosts that Next Image will not render", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://example.com/photo.jpg",
      highlights: "Close to tram",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        imageUrl: "Image URL must use an approved image host",
      },
    });
  });

  it("rejects uploaded photo metadata without an UploadThing storage key", () => {
    const input = normaliseListingFormInput({
      title: "Sydney lease transfer near station",
      suburb: "Parramatta",
      state: "NSW",
      postcode: "2150",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "650",
      bondAmount: "2600",
      bedrooms: "2",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter with uploaded photos.",
      imageUrl: "",
      uploadedPhotos: JSON.stringify([{ url: "https://utfs.io/f/photo-cover.jpg" }]),
      highlights: "Near train",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        uploadedPhotos: "Uploaded photos must include a storage key",
      },
    });
  });

  it("rejects listings where availability extends beyond the lease end date", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "temporary_sublet",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2027-03-01",
      availableUntil: "2027-04-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Close to tram",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        leaseEnds: "Lease end date must be on or after the available dates",
      },
    });
  });

  it("builds a stable slug and JSON highlights for Prisma create", () => {
    const data = buildListingCreateData(
      {
        title: "Carlton lease transfer",
        suburb: "Carlton",
        state: "VIC",
        postcode: "3053",
        listingType: "lease_transfer",
        consentStatus: "approved",
        housingType: "private_rental",
        genderPreference: "any",
        buildingName: "",
        furnished: true,
        billsIncluded: false,
        datesFlexible: false,
        rentPerWeek: 510,
        bondAmount: 2040,
        bedrooms: 1,
        bathrooms: 1,
        availableFrom: "2026-08-01",
        availableUntil: undefined,
        leaseEnds: "2027-02-01",
        description: "A detailed listing description for a renter.",
        imageUrl: "https://images.unsplash.com/photo-1",
        highlights: ["Written consent received"],
        hasWrittenConsent: true,
        bondTransferDiscussed: true,
        agentOrLandlordAware: true,
        newRenterAddedToLease: true,
        understandsSubletRisk: true,
      },
      "owner_123",
    );

    expect(data.slug).toMatch(/^carlton-lease-transfer-/);
    expect(data.highlights).toBe("[\"Written consent received\"]");
    expect(data.ownerId).toBe("owner_123");
  });

  it("builds Prisma update data without changing immutable ownership or slug fields", () => {
    const data = buildListingUpdateData({
      title: "Updated Carlton lease transfer",
      suburb: "Carlton North",
      state: "VIC",
      postcode: "3054",
      listingType: "room_replacement",
      consentStatus: "pending",
      housingType: "share_house",
      genderPreference: "female",
      buildingName: "Botanic Building",
      furnished: false,
      billsIncluded: true,
      datesFlexible: true,
      rentPerWeek: 540,
      bondAmount: 2160,
      bedrooms: 2,
      bathrooms: 1,
      availableFrom: "2026-09-01",
      availableUntil: undefined,
      leaseEnds: "2027-03-01",
      description: "Updated listing description with inspection availability and transfer details.",
      imageUrl: "https://images.unsplash.com/photo-2",
      highlights: ["Updated inspection times", "Close to train"],
      hasWrittenConsent: true,
      bondTransferDiscussed: true,
      agentOrLandlordAware: true,
      newRenterAddedToLease: false,
      understandsSubletRisk: true,
    });

    expect(data).toEqual(
      expect.objectContaining({
        title: "Updated Carlton lease transfer",
        suburb: "Carlton North",
        listingType: "ROOM_REPLACEMENT",
        consentStatus: "PENDING",
        housingType: "SHARE_HOUSE",
        genderPreference: "FEMALE",
        buildingName: "Botanic Building",
        furnished: false,
        billsIncluded: true,
        datesFlexible: true,
        highlights: "[\"Updated inspection times\",\"Close to train\"]",
      }),
    );
    expect(data).not.toHaveProperty("ownerId");
    expect(data).not.toHaveProperty("slug");
  });

  it("builds ordered listing photo records with storage keys", () => {
    const photos = buildListingPhotoCreateData(
      {
        title: "Sydney lease transfer near station",
        suburb: "Parramatta",
        state: "NSW",
        postcode: "2150",
        listingType: "lease_transfer",
        consentStatus: "approved",
        housingType: "private_rental",
        rentPerWeek: 650,
        bondAmount: 2600,
        bedrooms: 2,
        bathrooms: 1,
        availableFrom: "2026-08-01",
        availableUntil: undefined,
        leaseEnds: "2027-02-01",
        description: "A detailed listing description for a renter with uploaded photos.",
        imageUrl: "https://utfs.io/f/photo-cover.jpg",
        uploadedPhotos: [
          {
            url: "https://utfs.io/f/photo-cover.jpg",
            storageKey: "lease_photos/photo-cover.jpg",
            name: "living-room.jpg",
            size: 820000,
          },
          {
            url: "https://utfs.io/f/photo-bedroom.jpg",
            storageKey: "lease_photos/photo-bedroom.jpg",
            name: "bedroom.jpg",
            size: 640000,
          },
        ],
        highlights: ["Near train"],
        hasWrittenConsent: true,
        bondTransferDiscussed: true,
        agentOrLandlordAware: true,
        newRenterAddedToLease: true,
        understandsSubletRisk: true,
      },
    );

    expect(photos).toEqual([
      {
        url: "https://utfs.io/f/photo-cover.jpg",
        storageKey: "lease_photos/photo-cover.jpg",
        fileName: "living-room.jpg",
        fileSize: 820000,
        alt: "Sydney lease transfer near station photo 1",
        sortOrder: 0,
      },
      {
        url: "https://utfs.io/f/photo-bedroom.jpg",
        storageKey: "lease_photos/photo-bedroom.jpg",
        fileName: "bedroom.jpg",
        fileSize: 640000,
        alt: "Sydney lease transfer near station photo 2",
        sortOrder: 1,
      },
    ]);
  });

  it("identifies stored UploadThing files removed during an edit", () => {
    const removedKeys = getRemovedListingPhotoStorageKeys(
      [
        { storageKey: "lease_photos/photo-cover.jpg" },
        { storageKey: "lease_photos/photo-old-bedroom.jpg" },
        { storageKey: null },
      ],
      [
        {
          url: "https://utfs.io/f/photo-cover.jpg",
          storageKey: "lease_photos/photo-cover.jpg",
          name: "living-room.jpg",
          size: 820000,
        },
      ],
    );

    expect(removedKeys).toEqual(["lease_photos/photo-old-bedroom.jpg"]);
  });

  it("assesses readiness from a database listing record", () => {
    const readiness = getListingReadinessFromRecord({
      listingType: "LEASE_TRANSFER",
      consentStatus: "APPROVED",
      housingType: "PRIVATE_RENTAL",
      hasWrittenConsent: true,
      bondTransferDiscussed: true,
      agentOrLandlordAware: true,
      newRenterAddedToLease: true,
      understandsSubletRisk: true,
    });

    expect(readiness.visibilityLabel).toBe("Ready to transfer");
  });

  it("allows the listing owner to update status and edit details", () => {
    expect(canUpdateListingStatus({ id: "owner_1" }, "owner_1")).toBe(true);
    expect(canEditListing({ id: "owner_1" }, "owner_1")).toBe(true);
  });

  it("rejects anyone who does not own the listing from status updates and edits", () => {
    expect(canUpdateListingStatus({ id: "someone_else" }, "owner_1")).toBe(false);
    expect(canEditListing({ id: "someone_else" }, "owner_1")).toBe(false);
  });
});
