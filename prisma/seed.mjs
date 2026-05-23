import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

const users = [
  {
    email: "renter@leasemate.dev",
    name: "Riley Nguyen",
    role: "RENTER",
  },
  {
    email: "owner@leasemate.dev",
    name: "Mia Tran",
    role: "OWNER",
  },
  {
    email: "admin@leasemate.dev",
    name: "Alex Morgan",
    role: "ADMIN",
  },
];

const listings = [
  {
    slug: "brunswick-east-light-filled-apartment",
    title: "Light-filled 1 bed apartment near Lygon Street",
    suburb: "Brunswick East",
    state: "VIC",
    postcode: "3057",
    listingType: "LEASE_TRANSFER",
    consentStatus: "APPROVED",
    housingType: "PRIVATE_RENTAL",
    status: "PUBLISHED",
    rentPerWeek: 480,
    bondAmount: 2080,
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: new Date("2026-06-10T00:00:00.000Z"),
    leaseEnds: new Date("2027-02-28T00:00:00.000Z"),
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    description:
      "A tidy one-bedroom apartment suited to a single renter or couple. The rental provider has approved a lease transfer process and the current renter is ready to organise inspection times.",
    highlights: JSON.stringify([
      "Written consent received",
      "Tram 96 nearby",
      "Pet-friendly building",
    ]),
    hasWrittenConsent: true,
    bondTransferDiscussed: true,
    agentOrLandlordAware: true,
    newRenterAddedToLease: true,
    understandsSubletRisk: true,
  },
  {
    slug: "box-hill-student-room-close-to-station",
    title: "Private room close to Box Hill station",
    suburb: "Box Hill",
    state: "VIC",
    postcode: "3128",
    listingType: "ROOM_REPLACEMENT",
    consentStatus: "PENDING",
    housingType: "SHARE_HOUSE",
    status: "PUBLISHED",
    rentPerWeek: 260,
    bondAmount: 1040,
    bedrooms: 1,
    bathrooms: 2,
    availableFrom: new Date("2026-06-01T00:00:00.000Z"),
    leaseEnds: new Date("2026-12-15T00:00:00.000Z"),
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80",
    description:
      "A room replacement in a friendly share house. The agent has been contacted and the lister is collecting applicant details before the final approval step.",
    highlights: JSON.stringify(["Housemates have met", "Consent request sent", "Walk to train"]),
    hasWrittenConsent: false,
    bondTransferDiscussed: true,
    agentOrLandlordAware: true,
    newRenterAddedToLease: false,
    understandsSubletRisk: true,
  },
  {
    slug: "southbank-short-term-studio",
    title: "Short-term studio while renter travels",
    suburb: "Southbank",
    state: "VIC",
    postcode: "3006",
    listingType: "TEMPORARY_SUBLET",
    consentStatus: "NOT_STARTED",
    housingType: "PRIVATE_RENTAL",
    status: "PUBLISHED",
    rentPerWeek: 530,
    bondAmount: 0,
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: new Date("2026-07-05T00:00:00.000Z"),
    availableUntil: new Date("2026-09-20T00:00:00.000Z"),
    leaseEnds: new Date("2027-01-10T00:00:00.000Z"),
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    description:
      "A furnished studio listed for a temporary stay. This listing is intentionally marked as cautionary because written consent has not started yet.",
    highlights: JSON.stringify(["Fully furnished", "Short stay", "Consent not started"]),
    hasWrittenConsent: false,
    bondTransferDiscussed: false,
    agentOrLandlordAware: false,
    newRenterAddedToLease: false,
    understandsSubletRisk: false,
  },
];

async function main() {
  const demoPasswordHash = await hashPassword("LeaseMate123!");

  await prisma.analyticsEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.report.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.waitlistSignup.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        passwordHash: demoPasswordHash,
        emailVerifiedAt: new Date(),
      },
    });
  }

  const owner = await prisma.user.findUniqueOrThrow({
    where: { email: "owner@leasemate.dev" },
  });
  const renter = await prisma.user.findUniqueOrThrow({
    where: { email: "renter@leasemate.dev" },
  });

  for (const listing of listings) {
    const created = await prisma.listing.create({
      data: {
        ...listing,
        ownerId: owner.id,
        photos: {
          create: [
            {
              url: listing.imageUrl,
              alt: listing.title,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        name: "listing_seeded",
        listingId: created.id,
        metadata: JSON.stringify({ suburb: created.suburb }),
      },
    });
  }

  const firstListing = await prisma.listing.findUniqueOrThrow({
    where: { slug: "brunswick-east-light-filled-apartment" },
  });

  await prisma.enquiry.create({
    data: {
      listingId: firstListing.id,
      userId: renter.id,
      name: renter.name,
      email: renter.email,
      message: "Can I inspect this lease transfer this week?",
    },
  });

  await prisma.savedListing.create({
    data: {
      userId: renter.id,
      listingId: firstListing.id,
    },
  });

  await prisma.report.create({
    data: {
      listingId: firstListing.id,
      userId: renter.id,
      reason: "Missing inspection details",
      details: "Demo moderation item for the admin queue.",
    },
  });

  await prisma.waitlistSignup.create({
    data: {
      name: "Jordan Lee",
      email: "jordan@example.com",
      suburb: "Carlton",
      role: "renter",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
