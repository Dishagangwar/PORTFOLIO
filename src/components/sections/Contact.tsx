"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { site } from "@/content/site";
import { SplitReveal, FadeIn } from "@/components/ui/Reveal";
import { Button, ArrowIcon } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/Icons";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";
import { cn, isPlaceholder } from "@/lib/cn";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const EASE = [0.16, 1, 0.3, 1] as const;

const socials = [
  { label: "GitHub", href: site.socials.github, icon: <GithubIcon className="h-4 w-4" /> },
  {
    label: "LinkedIn",
    href: site.socials.linkedin,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: site.socials.instagram,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
];

function Field({
  id,
  label,
  error,
  textarea,
  value,
  onChange,
  onBlur,
  type = "text",
  autoComplete,
}: {
  id: keyof ContactInput;
  label: string;
  error?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  type?: string;
  autoComplete?: string;
}) {
  const common = {
    id,
    name: id,
    value,
    onBlur,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    placeholder: " ",
    className: cn(
      "peer w-full resize-none border-b bg-transparent pt-7 pb-3 text-lg text-fg outline-none transition-colors duration-300 placeholder-transparent",
      error ? "border-[#ff6b86]" : "border-white/15 focus:border-cyan",
    ),
  };
  return (
    <div className="relative">
      {textarea ? (
        <textarea {...common} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-0 left-0 font-mono text-[11px] tracking-[0.18em] text-muted uppercase transition-colors peer-focus:text-cyan"
      >
        {label}
      </label>
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-cyan to-violet transition-transform duration-700 ease-[var(--ease-expo)] peer-focus:scale-x-100"
      />
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-[#ff8ea2]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Contact() {
  const [values, setValues] = useState<ContactInput & { company: string }>({
    name: "",
    email: "",
    message: "",
    company: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInput, boolean>>>({});
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  const emailReady = !isPlaceholder(site.email);

  const update = (key: keyof ContactInput) => (v: string) => {
    const next = { ...values, [key]: v };
    setValues(next);
    if (touched[key]) setErrors(validateContact(next));
    if (status.kind === "error") setStatus({ kind: "idle" });
  };
  const blur = (key: keyof ContactInput) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateContact(values));
  };

  const visibleErrors: ContactErrors = Object.fromEntries(
    Object.entries(errors).filter(([k]) => touched[k as keyof ContactInput]),
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateContact(values);
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errs).length) {
      const first = (Object.keys(errs) as (keyof ContactInput)[])[0];
      document.getElementById(first)?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: ContactErrors };
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setStatus({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setStatus({ kind: "success" });
      setValues({ name: "", email: "", message: "", company: "" });
      setTouched({});
      setErrors({});
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <section id="contact" className="relative overflow-hidden py-32 md:py-44">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -bottom-1/3 left-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(139_123_255/0.14),rgb(91_233_255/0.05)_40%,transparent_65%)]" />

      <div className="container-x relative">
        <FadeIn className="mb-8 flex items-center gap-4">
          <span className="font-mono text-xs text-cyan">05</span>
          <span className="h-px w-12 bg-gradient-to-r from-cyan/70 to-transparent" />
          <span className="eyebrow">Contact</span>
        </FadeIn>

        <h2 className="max-w-6xl text-[clamp(2.6rem,7.5vw,7.5rem)] leading-[0.92] font-medium tracking-[-0.05em]">
          <SplitReveal text="Have an idea?" />{" "}
          <SplitReveal text="Let's build something" delay={0.1} wordClassName="text-gradient" />{" "}
          <SplitReveal
            text="meaningful."
            delay={0.25}
            className="font-serif font-normal italic tracking-[-0.02em]"
            wordClassName="pr-[0.05em] text-accent-gradient"
          />
        </h2>

        <div className="mt-20 grid gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Direct channels */}
          <div className="lg:col-span-5">
            <FadeIn>
              <p className="eyebrow mb-4">Email</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={emailReady ? `mailto:${site.email}` : undefined}
                  className="text-[clamp(1.4rem,2.6vw,2.2rem)] font-medium tracking-[-0.03em] break-all text-fg transition-colors hover:text-cyan"
                >
                  {site.email}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-muted transition-colors hover:border-cyan/60 hover:text-fg"
                  aria-live="polite"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="mt-14">
              <p className="eyebrow mb-4">Elsewhere</p>
              <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between py-5 text-lg"
                    >
                      <span className="flex items-center gap-4 text-fg/80 transition-colors group-hover:text-fg">
                        <span className="text-muted transition-colors group-hover:text-cyan">{s.icon}</span>
                        {s.label}
                      </span>
                      <span className="overflow-hidden">
                        <ArrowIcon
                          diagonal
                          className="text-muted transition-all duration-500 ease-[var(--ease-expo)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-cyan"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.2} className="mt-12">
              <Button
                href={site.resumeUrl}
                download
                variant="ghost"
                icon={
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                    <path d="M8 2v9m0 0L4.5 7.5M8 11l3.5-3.5M3 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                Download Resume
              </Button>
            </FadeIn>
          </div>

          {/* Form */}
          <FadeIn delay={0.1} className="lg:col-span-7">
            <div className="glass relative rounded-[2rem] p-6 md:p-10">
              <AnimatePresence mode="wait">
                {status.kind === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="flex min-h-[420px] flex-col items-start justify-center"
                    role="status"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet text-ink">
                      <svg viewBox="0 0 16 16" className="h-6 w-6" fill="none" aria-hidden>
                        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <h3 className="mt-8 text-4xl font-medium tracking-[-0.04em]">Message sent.</h3>
                    <p className="mt-3 max-w-sm text-muted">Thanks for reaching out. I&apos;ll get back to you as soon as I can.</p>
                    <button
                      type="button"
                      onClick={() => setStatus({ kind: "idle" })}
                      className="mt-8 border-b border-white/20 pb-0.5 text-sm text-fg/80 hover:border-cyan hover:text-fg"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    noValidate
                    onSubmit={onSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-10"
                    aria-describedby={status.kind === "error" ? "form-error" : undefined}
                  >
                    <div className="grid gap-10 md:grid-cols-2">
                      <Field id="name" label="Your name" value={values.name} onChange={update("name")} onBlur={blur("name")} error={visibleErrors.name} autoComplete="name" />
                      <Field id="email" label="Email" type="email" value={values.email} onChange={update("email")} onBlur={blur("email")} error={visibleErrors.email} autoComplete="email" />
                    </div>
                    <Field id="message" label="Tell me about your idea" textarea value={values.message} onChange={update("message")} onBlur={blur("message")} error={visibleErrors.message} />

                    {/* Honeypot (hidden from people and assistive tech) */}
                    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor="company">Company</label>
                      <input id="company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={(e) => setValues({ ...values, company: e.target.value })} />
                    </div>

                    <AnimatePresence>
                      {status.kind === "error" && (
                        <motion.div
                          id="form-error"
                          role="alert"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-3 rounded-2xl border border-[#ff6b86]/30 bg-[#ff6b86]/[0.06] p-4 text-sm text-[#ffc2cd]">
                            <span aria-hidden className="mt-0.5">⚠</span>
                            <span>
                              {status.message}
                              {emailReady && (
                                <>
                                  {" "}
                                  <a href={`mailto:${site.email}`} className="underline underline-offset-2">
                                    {site.email}
                                  </a>
                                </>
                              )}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-dim">I&apos;ll only use your email to reply.</p>
                      <Button type="submit" disabled={status.kind === "sending"} icon={status.kind === "sending" ? undefined : <ArrowIcon />}>
                        {status.kind === "sending" ? (
                          <span className="flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                            Sending…
                          </span>
                        ) : (
                          "Send message"
                        )}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
