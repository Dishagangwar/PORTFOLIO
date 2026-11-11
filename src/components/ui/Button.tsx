"use client";

import type { ReactNode } from "react";
import { Magnetic } from "./Magnetic";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
  download?: boolean;
  className?: string;
  icon?: ReactNode;
};

/** Magnetic pill button with a sliding fill on hover. Renders <a> when href is set. */
export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled,
  external,
  download,
  className,
  icon,
}: Props) {
  const base = cn(
    "group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full px-5 text-[0.92rem] sm:h-13 sm:px-7 sm:text-[0.95rem] font-medium tracking-tight transition-[color,box-shadow,opacity] duration-500 ease-[var(--ease-expo)] disabled:pointer-events-none disabled:opacity-50",
    variant === "primary"
      ? "bg-fg text-ink shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_10px_40px_-10px_rgb(91_233_255/0.5)] hover:text-ink hover:shadow-[0_0_0_1px_rgb(91_233_255/0.6),0_10px_50px_-6px_rgb(91_233_255/0.7)]"
      : "text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)] hover:text-ink",
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 translate-y-[101%] rounded-full transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0",
          variant === "primary"
            ? "bg-gradient-to-r from-cyan to-violet"
            : "bg-fg",
        )}
      />
      <span className="relative">{children}</span>
      {icon && (
        <span className="relative transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </>
  );

  return (
    <Magnetic>
      {href ? (
        <a
          href={href}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick();
            }
          }}
          className={base}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...(download ? { download: "" } : {})}
        >
          {inner}
        </a>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className={base}>
          {inner}
        </button>
      )}
    </Magnetic>
  );
}

export function ArrowIcon({ className, diagonal }: { className?: string; diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn("h-4 w-4", diagonal && "-rotate-45", className)}
      aria-hidden
    >
      <path
        d="M2 8h11m0 0L8.5 3.5M13 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
