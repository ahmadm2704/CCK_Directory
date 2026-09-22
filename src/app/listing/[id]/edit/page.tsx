import Link from "next/link";
import EditListingForm from "./EditListingForm";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link href={`/listing/${id}`} className="text-sm font-medium text-navy/70 hover:text-navy hover:underline">
        ← Back to listing
      </Link>

      <p className="mt-6 font-display text-xs uppercase tracking-[0.3em] text-gold">Edit your listing</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-navy-dark sm:text-3xl">
        Update your details
      </h1>
      <p className="mt-2 text-sm text-muted">
        Since listings aren&apos;t tied to an account, enter the phone number or email on file for
        this listing to verify it&apos;s yours before editing.
      </p>

      <div className="mt-8">
        <EditListingForm id={id} />
      </div>
    </div>
  );
}
