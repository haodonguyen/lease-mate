import { z } from "zod";

export interface Enquiry {
  id: string;
  listingSlug: string;
  name: string;
  email: string;
  message: string;
  status: "new";
  createdAt: string;
}

const enquirySchema = z.object({
  listingSlug: z.string().trim().min(1, "Listing is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  message: z.string().trim().min(20, "Message must be at least 20 characters"),
});

const enquiries: Enquiry[] = [];

export type CreateEnquiryInput = z.input<typeof enquirySchema>;

export type CreateEnquiryResult =
  | { ok: true; enquiry: Enquiry }
  | { ok: false; errors: Record<string, string> };

export function createEnquiry(input: CreateEnquiryInput): CreateEnquiryResult {
  const parsed = enquirySchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.reduce<Record<string, string>>((errors, issue) => {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = issue.message;
        }
        return errors;
      }, {}),
    };
  }

  const enquiry: Enquiry = {
    id: `enq_${crypto.randomUUID()}`,
    ...parsed.data,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  enquiries.push(enquiry);

  return { ok: true, enquiry };
}

export function listEnquiries() {
  return [...enquiries];
}

export function resetEnquiriesForTests() {
  enquiries.length = 0;
}
