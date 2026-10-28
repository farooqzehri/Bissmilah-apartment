export * from "./cms";
import { Property } from "./cms";

export type PropertyItem = Property;

export interface CuratedImagePreset {
  id: string;
  label: string;
  category: "apartments" | "estates" | "schemes" | "commercial";
  url: string;
}
