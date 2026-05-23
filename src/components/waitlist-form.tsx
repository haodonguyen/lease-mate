"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMessage(response.ok ? "Joined the Australian validation waitlist." : "Could not join waitlist.");
  }

  return (
    <form className="waitlist-form" onSubmit={submit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="suburb" placeholder="Suburb" defaultValue="Carlton" required />
      <select name="role" defaultValue="renter">
        <option value="renter">Renter</option>
        <option value="lister">Lister</option>
        <option value="agent">Agent</option>
      </select>
      <button className="primary-button" type="submit">Join waitlist</button>
      {message ? <span>{message}</span> : null}
    </form>
  );
}
