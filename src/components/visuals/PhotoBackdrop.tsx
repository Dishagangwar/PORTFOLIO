"use client";

import Image from "next/image";
import { motion, type MotionValue } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Faint portrait backdrop shared by the hero and About sections so both look identical:
 * tightly cropped on the face, slightly desaturated, ~20% visible, and dissolving into
 * the dark page at the top, bottom and left edges.
 */
export function PhotoBackdrop({
  src,
  y,
  priority,
  className,
}: {
  src: string;
  /** Optional scroll-linked vertical drift. */
  y?: MotionValue<string>;
  priority?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      aria-hidden
      style={y ? { y } : undefined}
      className={cn(
        "pointer-events-none absolute top-0 right-0 h-[85vh] w-full opacity-[0.16] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_60%,transparent)] lg:h-[115vh] lg:w-[45%] lg:opacity-[0.2]",
        className,
      )}
    >
      <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_45%)]">
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="origin-[50%_22%] scale-[1.3] object-cover object-[50%_20%] grayscale-[35%]"
        />
      </div>
    </motion.div>
  );
}
