import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils/cn";

type OptimizedImageProps = ImageProps & {
  /** Neutral placeholder while the file downloads */
  placeholderClassName?: string;
};

/**
 * Next/Image defaults tuned for marketing pages: lower quality, neutral loading surface.
 */
export function OptimizedImage({
  className,
  quality = 70,
  placeholderClassName,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      quality={quality}
      className={cn("bg-neutral-200", placeholderClassName, className)}
    />
  );
}
