/** Unsplash photos per area (verified CDN URLs). */
export type AreaOfWork = {
  /** Screen-reader / control label (descriptive). */
  label: string;
  /** Large headline in the gallery center. */
  creativeWord: string;
  images: string[];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const areasOfWork: AreaOfWork[] = [
  {
    label: "Sport & Outdoor",
    creativeWord: "Wild Motion",
    images: [
      unsplash("photo-1571019614242-c5c5dee9f50b"),
      unsplash("photo-1534438327276-14e5300c3a48"),
      unsplash("photo-1502904550040-7534597429ae"),
      unsplash("photo-1544531586-fde5298cdd40"),
      unsplash("photo-1518611012118-696072aa579a"),
      unsplash("photo-1558618666-fcd25c85cd64"),
      unsplash("photo-1464822759023-fed622ff2c3b"),
      unsplash("photo-1470071459604-3b5ec3a7fe05"),
    ],
  },
  {
    label: "Architecture",
    creativeWord: "Raw Form",
    images: [
      unsplash("photo-1486325212027-8081e485255e"),
      unsplash("photo-1511818966892-d7d671e672a2"),
      unsplash("photo-1449824913935-59a10b8d2000"),
      unsplash("photo-1503387762-592deb58ef4e"),
      unsplash("photo-1497366216548-37526070297c"),
      unsplash("photo-1564013799919-ab600027ffc6"),
      unsplash("photo-1600566753190-17f0baa2a6c3"),
      unsplash("photo-1600585154340-be6161a56a0c"),
    ],
  },
  {
    label: "Travel & Tourism",
    creativeWord: "Open Roam",
    images: [
      unsplash("photo-1501785888041-af3ef285b470"),
      unsplash("photo-1436491865332-7a61a109cc05"),
      unsplash("photo-1500530855697-b586d89ba3ee"),
      unsplash("photo-1469474968028-56623f02e42e"),
      unsplash("photo-1506905925346-21bda4d32df4"),
      unsplash("photo-1470071459604-3b5ec3a7fe05"),
      unsplash("photo-1464822759023-fed622ff2c3b"),
      unsplash("photo-1501785888041-af3ef285b470"),
    ],
  },
  {
    label: "Lifestyle",
    creativeWord: "Soft Rhythm",
    images: [
      unsplash("photo-1529156069898-49953e39b3ac"),
      unsplash("photo-1517248135467-4c7edcad34c4"),
      unsplash("photo-1524504388940-b1c1722653e1"),
      unsplash("photo-1522771739844-6a9f6d5f14af"),
      unsplash("photo-1492562080023-ab3db95bfbce"),
      unsplash("photo-1600210492486-724fe5c67fb0"),
      unsplash("photo-1600607687939-ce8a6c25118c"),
      unsplash("photo-1529156069898-49953e39b3ac"),
    ],
  },
  {
    label: "Interior Design",
    creativeWord: "Quiet Nest",
    images: [
      unsplash("photo-1616486338812-3dadae4b4ace"),
      unsplash("photo-1615529328331-f8917597711f"),
      unsplash("photo-1600210492486-724fe5c67fb0"),
      unsplash("photo-1600607687939-ce8a6c25118c"),
      unsplash("photo-1600566753190-17f0baa2a6c3"),
      unsplash("photo-1600585154340-be6161a56a0c"),
      unsplash("photo-1616486338812-3dadae4b4ace"),
      unsplash("photo-1615529328331-f8917597711f"),
    ],
  },
];
