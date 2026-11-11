export type ContactInput = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the client form and the API route so both enforce the same rules. */
export function validateContact(input: Partial<ContactInput>): ContactErrors {
  const errors: ContactErrors = {};
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const message = (input.message ?? "").trim();

  if (name.length < 2) errors.name = "Please enter your name.";
  else if (name.length > 80) errors.name = "Name must be under 80 characters.";

  if (!email) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "That email doesn't look right.";

  if (message.length < 10) errors.message = "Message should be at least 10 characters.";
  else if (message.length > 2000) errors.message = "Message must be under 2000 characters.";

  return errors;
}
