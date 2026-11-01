/** Sized Unsplash CDN URLs — keep widths modest for faster loads (especially in dev unoptimized mode). */
export function unsplashPhoto(
  photoId: string,
  width: number,
  quality = 75,
): string {
  const id = photoId.replace(/^https:\/\/images\.unsplash\.com\//, "").split("?")[0];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

export const unsplashWidths = {
  hero: 960,
  section: 768,
  card: 640,
  thumb: 480,
  tile: 400,
} as const;
