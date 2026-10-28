export type PropertyCategory = "apartments" | "estates" | "schemes" | "commercial";

export interface PropertySpec {
  label: string;
  value: string;
}

export interface PropertyItem {
  id: string;
  title: string;
  category: PropertyCategory;
  price: string;
  location: string;
  size: string;
  tag: string;
  status: string;
  description: string;
  image: string;
  gallery?: string[];
  highlights: string[];
  specs: PropertySpec[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CuratedImagePreset {
  id: string;
  label: string;
  category: PropertyCategory;
  url: string;
}
