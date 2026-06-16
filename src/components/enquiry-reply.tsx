"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EnquiryReplyProps {
  enquiryId: string;
  name: string;
  email: string;
  message: string;
  status: string;
  replyText: string | null;
}

export function EnquiryReply({ enquiryId, name, email, message, status, replyText }: EnquiryReplyProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const responded = status === "RESPONDED";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: value }),
      });

      if (!response.ok) {
        setError("Reply could not be sent. Please try again.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong while sending the reply.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inbox-item">
      <div className="inbox-item-head">
        <strong>{name}</strong>
        {responded ? (
          <span className="badge ready inbox-status-badge">
            <CheckCircle2 size={13} />
            Responded
          </span>
        ) : (
          <span className="badge pending inbox-status-badge">New</span>
        )}
      </div>
      <span>{email}</span>
      <p>{message}</p>

      {responded && replyText ? (
        <div className="inbox-reply">
          <span className="muted">Your reply</span>
          <p>{replyText}</p>
        </div>
      ) : null}

      {!responded ? (
        open ? (
          <form className="inbox-reply-form" onSubmit={submit}>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={`Reply to ${name}…`}
              rows={3}
              required
            />
            <div className="action-stack horizontal">
              <button className="primary-button compact-button" type="submit" disabled={pending}>
                <Send size={15} />
                {pending ? "Sending…" : "Send reply"}
              </button>
              <button
                className="secondary-button compact-button"
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </button>
            </div>
            {error ? <div className="notice">{error}</div> : null}
          </form>
        ) : (
          <button className="secondary-button compact-button" type="button" onClick={() => setOpen(true)}>
            <Send size={15} />
            Reply
          </button>
        )
      ) : null}
    </div>
  );
}
