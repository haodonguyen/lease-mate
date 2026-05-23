# LeaseMate Product Requirements Document

## 1. Product Summary

LeaseMate is an Australia-wide lease transfer marketplace for renters who need to move into, take over, or transfer an existing rental agreement. The product replaces informal Facebook group posts and scattered private messages with structured listings, transfer readiness checks, saved shortlists, renter enquiries, owner listing management, and admin moderation.

The platform is designed for renters, outgoing tenants, property owners, and moderators who need a clearer and more accountable workflow for rental handovers.

## 2. Problem Statement

Lease transfers and rental takeovers are commonly handled through social media groups, screenshots, direct messages, and informal comment threads. This creates several issues:

- Renters cannot easily verify whether a listing is legitimate.
- Important lease information is often missing or hard to compare.
- Consent from the rental provider or agent may be unclear.
- Bond transfer, lease dates, availability, and sublet risk are often not visible upfront.
- Outgoing tenants have no structured way to manage enquiries.
- Community groups rely on manual moderation with limited listing context.

LeaseMate addresses these problems by turning lease transfers into structured, searchable, account-based marketplace workflows.

## 3. Product Goals

- Help renters discover and compare lease transfer opportunities across Australia.
- Give outgoing tenants and owners a professional listing workflow.
- Make lease readiness, dates, consent status, and key rental details visible before enquiry.
- Reduce reliance on unstructured social media posts.
- Provide saved listings and enquiry workflows for account-based rental search.
- Support moderation to improve trust and marketplace quality.
- Create a foundation for a future production-grade rental transfer startup.

## 4. Target Users

### Guest Renter

A visitor who wants to browse available lease transfers before creating an account.

Needs:
- Understand what LeaseMate does quickly.
- Search and filter listings.
- Review listing details and transfer readiness.
- Sign up when they want to save or enquire.

### Registered Renter

A renter actively searching for a lease transfer, room replacement, or short-term sublet.

Needs:
- Save listings to compare later.
- Track saved listing status.
- Send enquiries to listers.
- Understand which listings are ready to transfer and which need caution.

### Listing Owner

An outgoing tenant, property owner, or approved representative creating lease transfer listings.

Needs:
- Create structured listings with rent, bond, dates, photos, and transfer status.
- Manage listing status and enquiries.
- Keep readiness information updated.
- Share a professional listing page outside the platform.

### Admin Moderator

A marketplace operator responsible for reviewing reported listings.

Needs:
- View reported listings.
- Review report reasons and listing context.
- Mark reports as reviewed or dismissed.
- Maintain marketplace trust.

## 5. MVP Scope

The MVP focuses on validating whether renters prefer a structured lease transfer marketplace over informal social media posts.

### In Scope

- Guest landing page
- Public marketplace
- Listing search and filtering
- Listing detail pages
- Email/password signup and login
- Renter saved listings
- Renter enquiry submission
- Owner listing creation and editing
- Owner dashboard
- Admin moderation queue
- Waitlist capture
- Readiness scoring and warning labels
- PostgreSQL-backed data persistence
- Production deployment on Vercel

### Out of Scope

- Payments
- Bond transfer processing
- Legal document signing
- Real-time chat
- Identity verification
- Rental application submission
- Agent CRM integration
- Mobile app
- Automated legal advice

## 6. User Journeys

### Guest Browsing Journey

1. User lands on the homepage.
2. User reads the product positioning and trust signals.
3. User searches or filters available listings.
4. User opens a listing detail page.
5. User reviews rent, bond, availability, lease dates, location, and readiness status.
6. User signs up or logs in to save the listing or send an enquiry.

### Renter Shortlist Journey

1. User signs in as a renter.
2. User browses the marketplace.
3. User saves listings of interest.
4. User opens the saved listings page.
5. User updates shortlist status such as interested, inspecting, applied, or rejected.
6. User sends enquiries from listing detail pages.

### Owner Listing Journey

1. User signs in as an owner.
2. User opens the dashboard.
3. User creates a lease transfer listing.
4. User adds rent, bond, state, suburb, postcode, availability dates, lease end date, image URL, description, and readiness checklist details.
5. User publishes the listing.
6. User manages enquiries and listing status from the dashboard.

### Admin Moderation Journey

1. Admin signs in.
2. Admin opens the moderation queue.
3. Admin reviews reported listings.
4. Admin marks reports as reviewed or dismissed.
5. Marketplace quality metrics update through analytics events.

## 7. Functional Requirements

### 7.1 Marketplace

- The system must display public listings to guests and authenticated users.
- The system must support filtering by listing type.
- The system must support filtering by readiness status.
- The system must support suburb, postcode, and title search.
- The system must display listing cards with rent, location, availability, listing type, and readiness status.
- The system must support Australia-wide state and territory codes.

### 7.2 Listing Detail

- The system must show full listing information including title, location, rent, bond, bedrooms, bathrooms, availability, lease end date, highlights, and description.
- The system must show transfer readiness score and warnings.
- The system must allow authenticated users to save a listing.
- The system must allow users to report a listing.
- The system must allow users to submit an enquiry.

### 7.3 Authentication

- The system must support email and password signup.
- The system must support email and password login.
- The system must create server-side sessions after successful authentication.
- The system must redirect unauthenticated users to login when they attempt account-only actions.
- The system must redirect users back to the intended destination after login where safe.

### 7.4 Saved Listings

- The system must allow authenticated renters to save listings.
- The system must show saved listings on a dedicated saved page.
- The system must allow users to update saved listing shortlist status.
- The system must allow users to remove saved listings.

### 7.5 Enquiries

- The system must allow users to send enquiries from listing detail pages.
- The system must validate enquiry name, email, and message fields.
- The system must associate enquiries with the relevant listing.
- The system must show owner enquiries in the dashboard.

### 7.6 Owner Dashboard

- The system must restrict dashboard access to owners and admins.
- The system must display owner listings.
- The system must display listing enquiries and reports.
- The system must allow owners and admins to create listings.
- The system must allow owners and admins to edit listings.
- The system must allow listing status updates.

### 7.7 Admin Moderation

- The system must restrict admin moderation access to admin users.
- The system must display reported listings.
- The system must show report reason, report status, and listing context.
- The system must allow admins to mark reports as reviewed or dismissed.

### 7.8 Waitlist

- The system must allow visitors to join a waitlist.
- The system must collect name, email, suburb, and role.
- The system must avoid duplicate waitlist entries for the same email.

### 7.9 Analytics

- The system must track key marketplace events such as listing views, saves, enquiries, reports, and waitlist signups.
- The system must expose basic aggregate analytics for dashboards.

## 8. Non-Functional Requirements

### Performance

- Marketplace and listing pages should load quickly on desktop and mobile.
- Server-rendered pages should avoid unnecessary client-side data fetching where possible.
- Listing cards should remain stable during filtering and interaction.

### Security

- Passwords must be hashed before storage.
- Sessions must be stored server-side and referenced through secure cookies.
- Protected routes must check the authenticated user role on the server.
- API routes must validate input before writing to the database.
- Sensitive environment variables must not be committed to source control.

### Reliability

- Database schema changes must be managed through Prisma migrations.
- Production deployment must run migrations before building the application.
- The app should handle missing listings, invalid input, and unauthorized access gracefully.

### Accessibility

- Navigation and forms should use semantic HTML.
- Buttons, links, inputs, and selects should have accessible labels.
- UI text should maintain readable contrast.
- Core workflows should be usable through keyboard navigation.

### Responsiveness

- The product must support mobile, tablet, and desktop layouts.
- Marketplace cards, auth pages, detail pages, and dashboards should not overflow their containers.
- Primary actions should remain visible and usable on smaller screens.

## 9. Data Requirements

Core data entities:

- User
- Session
- Listing
- ListingPhoto
- Enquiry
- Report
- SavedListing
- Notification
- AnalyticsEvent
- WaitlistSignup

Important listing fields:

- Title
- Slug
- Suburb
- State
- Postcode
- Listing type
- Housing type
- Consent status
- Rent per week
- Bond amount
- Bedrooms
- Bathrooms
- Available from
- Available until
- Lease end date
- Image URL
- Highlights
- Description
- Transfer checklist
- Owner

## 10. Success Metrics

### Product Metrics

- Number of listing views
- Number of saved listings
- Number of enquiries submitted
- Number of waitlist signups
- Percentage of users who save at least one listing
- Percentage of listing detail views that lead to an enquiry
- Number of reported listings reviewed by admin

### Quality Metrics

- Successful production deployments
- Passing unit tests
- Passing end-to-end tests
- Low rate of failed form submissions caused by validation issues
- Low number of unresolved reported listings

## 11. Release Criteria

The MVP is considered ready when:

- Guests can browse listings and view listing details.
- Renters can sign up, sign in, save listings, update saved status, and send enquiries.
- Owners can create, edit, and manage listings.
- Admins can review reports.
- Listing readiness is visible across marketplace and detail pages.
- Database migrations run successfully in production.
- CI passes lint, unit tests, and build checks.
- The production site is accessible through the Vercel URL.

## 12. Risks and Assumptions

### Risks

- Users may still prefer existing social media groups because they already have network effects.
- Lease transfer rules vary by state, property type, rental provider, and lease agreement.
- Users may misinterpret readiness labels as legal approval.
- Listing quality may be inconsistent without stronger verification.
- Image URLs and external assets may break over time.

### Assumptions

- Renters are willing to use a structured marketplace if it saves time and reduces uncertainty.
- Outgoing tenants want a cleaner way to manage enquiries than social media messages.
- Readiness checklists can improve trust without replacing legal or agent approval.
- Admin moderation is necessary for a marketplace handling rental listings.

## 13. Future Roadmap

### Phase 1: MVP Stabilisation

- Improve listing quality controls.
- Add stronger empty states and error states.
- Improve dashboard filtering and sorting.
- Add richer listing photo support.

### Phase 2: Trust and Verification

- Email verification.
- Password reset.
- Identity verification.
- Agent or rental provider verification.
- Document upload for consent and lease documents.

### Phase 3: Communication

- In-app renter-owner messaging.
- Message notifications.
- Enquiry status tracking.
- Inspection scheduling.

### Phase 4: Marketplace Growth

- Suburb-level search insights.
- Saved search alerts.
- State-specific rental guidance.
- Listing quality scoring.
- Admin audit trail.

### Phase 5: Commercialisation

- Premium listing placement.
- Verified transfer service.
- Partner integrations with property managers.
- Optional handover support package.

## 14. Open Questions

- Should LeaseMate focus first on renters, outgoing tenants, or property managers as the primary acquisition channel?
- Should listing verification be manual, automated, or partner-led?
- Should state-specific legal guidance be built into the transfer checklist?
- Should enquiries stay as simple forms or evolve into a full messaging inbox?
- Should payments or bond-related workflows remain outside the platform permanently?

