/** API / stored shape for primary recipients. Legacy docs may use plain strings (driver id only). */
export type DriverRecipient = {
  driverId: string;
  email: string;
  name: string;
};

/** API / stored shape for CC. Legacy docs may use plain strings (email only). */
export type CcRecipient = {
  id: string;
  email: string;
  name: string;
};

/** Incoming create body (before normalization). */
export type CreateNoteInput = {
  title?: string;
  description?: string;
  type?: string;
  toDriverIds?: unknown[];
  ccEmails?: unknown[];
  subject?: string;
  message?: string;
  gifUrl?: string;
};

/** Normalized payload passed to persistence. */
export type CreateNotePayload = {
  title?: string;
  description?: string;
  type?: string;
  toDriverIds: DriverRecipient[];
  ccEmails: CcRecipient[];
  subject?: string;
  message?: string;
  gifUrl?: string;
};

/** Aurora MySQL row shape (snake_case columns). */
export type NoteRow = {
  id: number;
  title: string | null;
  description: string | null;
  type: string | null;
  to_driver_ids: unknown;
  cc_emails: unknown;
  subject: string | null;
  message: string | null;
  gif_url: string | null;
  created_at: Date;
  updated_at: Date;
};

/** Lean note document from MongoDB (legacy; for mapping to API). */
export type NoteLean = {
  _id?: unknown;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  toDriverIds?: unknown[];
  ccEmails?: unknown[];
  subject?: string | null;
  message?: string | null;
  gifUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

/** Single note in API responses. */
export type NoteResponse = {
  id: unknown;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  toDriverIds: DriverRecipient[];
  ccEmails: CcRecipient[];
  subject?: string | null;
  message?: string | null;
  gifUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};
