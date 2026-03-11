// Side-arrow marker: PNG icon on left + arrow pointing right to exact location

const CATEGORY_IMAGES: Record<string, string> = {
  historical: "/kategoriler/Antik.png",
  ancient: "/kategoriler/Antik.png",
  museum: "/kategoriler/kulturel.png",
  nature: "/kategoriler/dogall.png",
  beach: "/kategoriler/Plajlar.png",
  cultural: "/kategoriler/kulturel.png",
  gastronomy: "/kategoriler/gastronomi.png",
  thermal: "/kategoriler/Termal.png",
  religious: "/kategoriler/dini.png",
};

// Exported so other components (category filter, nearby panel) can use it
export function getCategoryImageSrc(slug: string): string {
  return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.historical;
}

export function createCategoryMarkerHtml(
  slug: string,
  color: string,
  selected: boolean,
  scale: number = 1,
): string {
  const imgSrc = CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.historical;
  const baseImg = selected ? 38 : 30;
  const baseArrow = selected ? 10 : 8;

  const imgSize = Math.round(baseImg * scale);
  const arrowSize = Math.max(5, Math.round(baseArrow * scale));
  const gap = Math.max(2, Math.round(3 * scale));

  return `
    <div style="display:flex;align-items:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
      <div style="background:white;border-radius:${Math.round(8 * scale)}px;padding:${Math.round(3 * scale)}px;display:flex;align-items:center;justify-content:center;border:2px solid ${color};${selected ? `box-shadow:0 0 8px ${color}80;` : ""}">
        <img src="${imgSrc}" alt="" style="width:${imgSize}px;height:${imgSize}px;object-fit:contain;" />
      </div>
      <div style="width:0;height:0;border-top:${arrowSize}px solid transparent;border-bottom:${arrowSize}px solid transparent;border-left:${arrowSize}px solid ${color};margin-left:${gap}px;"></div>
    </div>
  `;
}
