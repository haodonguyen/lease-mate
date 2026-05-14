"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function EnquiryForm({
  listingSlug,
  listingTitle,
}: {
  listingSlug: string;
  listingTitle: string;
}) {
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  return (
    <form
      className="form-grid"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setSubmission({ status: "submitting" });

        try {
          const formData = new FormData(form);
          const response = await fetch("/api/enquiries", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              listingSlug,
              name: formData.get("name"),
              email: formData.get("email"),
              message: formData.get("message"),
            }),
          });

          if (!response.ok) {
            setSubmission({
              status: "error",
              message: "Please check your details and try again.",
            });
            return;
          }

          form.reset();
          setSubmission({
            status: "success",
            message: "Enquiry sent. The lister would be notified in the production version.",
          });
        } catch {
          setSubmission({
            status: "error",
            message: "Something went wrong while sending this enquiry.",
          });
        }
      }}
    >
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="Your name" required />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          defaultValue={`Hi, I am interested in ${listingTitle}. Is it still available for inspection?`}
          required
        />
      </div>
      <button className="primary-button" type="submit" disabled={submission.status === "submitting"}>
        <Send size={18} />
        {submission.status === "submitting" ? "Sending..." : "Send enquiry"}
      </button>
      {submission.status === "success" || submission.status === "error" ? (
        <div className="notice" role="status">
          {submission.message}
        </div>
      ) : null}
    </form>
  );
}
