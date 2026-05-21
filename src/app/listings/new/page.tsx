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
      <div className="workflow-stepper" aria-label="Create listing steps">
        {[
          ["1", "Details", "Address, rent, and property type"],
          ["2", "Consent", "Provider approval and renter checks"],
          ["3", "Visuals", "Photo, description, and highlights"],
          ["4", "Review", "Publish when the listing is transfer-ready"],
        ].map(([number, title, description]) => (
          <div className="workflow-step" key={number}>
            <span>{number}</span>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        ))}
      </div>
      {canCreate ? <ListingCreateForm /> : <div className="notice">Switch to Owner or Admin role to create listings.</div>}
    </main>
  );
}
