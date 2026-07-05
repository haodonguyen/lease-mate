import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingCreateForm } from "@/components/listing-create-form";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/listings/new");
  }

  return (
    <main className="section">
      <Link className="secondary-button" href="/">Back to marketplace</Link>
      <div className="page-heading">
        <span className="eyebrow">List a transfer</span>
        <h1>Create lease transfer listing</h1>
        <p className="muted">Add your rental details, photos, and readiness so the next renter can take over with confidence.</p>
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
      <ListingCreateForm />
    </main>
  );
}
