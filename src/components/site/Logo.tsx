import Image from "next/image";

import markBlack from "@/assets/brand/nulle-mark-black.png";
import markGradient from "@/assets/brand/nulle-mark-gradient.png";
import wordmarkBlack from "@/assets/brand/nulle-wordmark-black.png";
import wordmarkWhite from "@/assets/brand/nulle-wordmark-white.png";

type LogoProps = {
  /** Load eagerly. Use for the header, which is always in the first paint. */
  priority?: boolean;
  /** Show only the wordmark (used in the footer). */
  wordmarkOnly?: boolean;
};

// Source artwork proportions. Geometry is never altered, only scaled.
const MARK_RATIO = markGradient.width / markGradient.height;
const WORDMARK_RATIO = wordmarkWhite.width / wordmarkWhite.height;

const MARK_HEIGHT = 22;
const WORDMARK_HEIGHT = 17;

/**
 * The official Nulle logo. Both colour variants are rendered and the
 * surrounding theme class decides which one is visible, so the logo
 * always has contrast against whatever sits behind the header.
 */
export function Logo({ priority = false, wordmarkOnly = false }: LogoProps) {
  const markWidth = Math.round(MARK_HEIGHT * MARK_RATIO);
  const wordmarkWidth = Math.round(WORDMARK_HEIGHT * WORDMARK_RATIO);

  return (
    <span className="inline-flex items-center gap-[9px]">
      {!wordmarkOnly && (
        <span className="relative block" style={{ width: markWidth, height: MARK_HEIGHT }}>
          <Image
            src={markGradient}
            alt=""
            width={markWidth}
            height={MARK_HEIGHT}
            priority={priority}
            className="logo-variant logo-for-dark absolute inset-0 h-full w-full"
          />
          <Image
            src={markBlack}
            alt=""
            width={markWidth}
            height={MARK_HEIGHT}
            priority={priority}
            className="logo-variant logo-for-light absolute inset-0 h-full w-full"
          />
        </span>
      )}
      <span className="relative block" style={{ width: wordmarkWidth, height: WORDMARK_HEIGHT }}>
        <Image
          src={wordmarkWhite}
          alt=""
          width={wordmarkWidth}
          height={WORDMARK_HEIGHT}
          priority={priority}
          className="logo-variant logo-for-dark absolute inset-0 h-full w-full"
        />
        <Image
          src={wordmarkBlack}
          alt=""
          width={wordmarkWidth}
          height={WORDMARK_HEIGHT}
          priority={priority}
          className="logo-variant logo-for-light absolute inset-0 h-full w-full"
        />
      </span>
    </span>
  );
}
