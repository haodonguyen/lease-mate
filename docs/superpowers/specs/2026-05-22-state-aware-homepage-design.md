# State-Aware Homepage Design

## Goal

Make `/` feel like a polished startup landing page for guests and a useful personalized home for authenticated users.

## Guest Experience

Signed-out visitors see a Victoria-focused landing page inspired by the supplied mockup. The page leads with a full-width Melbourne/Victorian lease transfer hero, a suburb/postcode search box, trust proof, a three-step transfer section, a featured listing preview, a conversion CTA, and the existing footer language.

The guest page must still expose the marketplace search workflow and listing cards so existing search behavior remains discoverable.

## Authenticated Experience

Signed-in users see a compact home dashboard. It greets the user by name, shows activity cards for search continuity, messages/enquiries, saved-listing changes, and transfer progress, then recommends current published listings.

The authenticated page links users into deeper workflows:
- renters to saved listings and recommended rentals
- owners/admins to dashboard/listing management
- all users to marketplace listing details

## Architecture

`src/app/page.tsx` decides which page variant to render by calling `getCurrentAuthenticatedUser()`. Presentation logic is split into focused components so the route remains thin:
- `GuestLanding` for the signed-out landing page
- `AuthenticatedHome` for signed-in home
- shared listing preview card helpers where useful

No schema migration is required for this pass. Search history, message count, and transfer progress can be derived from existing listings, saved listings, owner listings, and analytics.

## Testing

Add e2e coverage for:
- signed-out users see the guest landing headline and can search listings
- authenticated users see the welcome home instead of guest marketing

Run lint, unit tests, e2e tests, production build, and a browser smoke check before completion.
