export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { locations: number };
}

export interface Location {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  shortDesc: string;
  shortDescEn: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  category: Category;
  images: string[];
  visitHours: string | null;
  fee: string | null;
  feeEn: string | null;
  address: string | null;
  addressEn: string | null;
  phone: string | null;
  website: string | null;
  accessibility: string | null;
  publicTransport: string | null;
  publicTransportEn: string | null;
  isActive: boolean;
  isFeatured: boolean;
}

export type Locale = "tr" | "en";
