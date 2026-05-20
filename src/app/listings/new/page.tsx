import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingCreateForm } from "@/components/listing-create-form";
import { canManageListings, getCurrentAuthenticatedUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/listings/new");
  }

  const canCreate = user && canManageListings(user.role);

  return (
    <main className="section">
      <Link className="secondary-button" href="/">Back to marketplace</Link>
      <div className="page-heading">
        <span className="eyebrow">Owner workflow</span>
        <h1>Create lease transfer listing</h1>
        <p className="muted">Signed-in owners and admins can create persisted lease transfer listings.</p>
      </div>
      {canCreate ? <ListingCreateForm /> : <div className="notice">Switch to Owner or Admin role to create listings.</div>}
    </main>
  );
}
