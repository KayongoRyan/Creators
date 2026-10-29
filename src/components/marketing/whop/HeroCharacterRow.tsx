import Image from "next/image";
import { heroCharacterGroup } from "@/content/heroCharacters";

export function HeroCharacterRow() {
  return (
    <div
      className="relative z-10 mx-auto flex max-w-5xl justify-center px-4 pb-10 sm:px-6 sm:pb-12"
      aria-label="Creators at work"
    >
      <Image
        src={heroCharacterGroup.src}
        alt={heroCharacterGroup.alt}
        width={1588}
        height={795}
        priority
        className="hero-character-art h-[220px] w-auto max-w-[min(100vw-0.5rem,1200px)] object-contain object-bottom sm:h-[280px] lg:h-[320px]"
        sizes="(max-width: 1024px) 100vw, 1200px"
      />
    </div>
  );
}
