export type ListingStatus = "pending" | "approved" | "rejected";
export type ContactType = "phone" | "whatsapp" | "phone_whatsapp" | "email";

export interface Listing {
  id: string;
  name: string;
  category: string;
  description: string;
  contact_type: ContactType;
  contact_value: string;
  photo_url: string | null;
  status: ListingStatus;
  created_at: string;
}

export const CATEGORIES = [
  "Medical / Doctors",
  "Legal",
  "Business / Trade",
  "Real Estate",
  "Education / Tutoring",
  "IT / Tech Services",
  "Government / Bureaucracy",
  "Armed Forces",
  "Travel / Visa",
  "Other",
] as const;
