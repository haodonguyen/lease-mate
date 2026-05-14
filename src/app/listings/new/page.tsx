import Link from "next/link";
import { ListingCreateForm } from "@/components/listing-create-form";
import { canManageListings, getCurrentUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  const canCreate = user && canManageListings(user.role);

  return (
    <main className="section">
      <Link className="secondary-button" href="/">Back to marketplace</Link>
      <div className="page-heading">
        <span className="eyebrow">Owner workflow</span>
        <h1>Create lease transfer listing</h1>
        <p className="muted">Demo owner/admin roles can create persisted listings in the local Prisma database.</p>
      </div>
      {canCreate ? <ListingCreateForm /> : <div className="notice">Switch to Owner or Admin role to create listings.</div>}
    </main>
  );
}
