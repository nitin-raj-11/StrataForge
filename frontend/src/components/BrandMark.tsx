import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & { size?: number };

/**
 * StrataForge brand icon.
 * Loads from /strataforge-logo.png in the public folder.
 */
export default function BrandMark({ size = 36, ...props }: Props) {
  return (
    <img
      src="/strataforge-logo.png"
      alt="StrataForge"
      width={size}
      height={size}
      style={{ display: 'block' }}
      {...props}
    />
  );
}
