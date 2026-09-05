export type ProductType = "Tablet" | "Device" | "Syrup" | "Injection" | "Capsule";

export interface LibraryProduct {
  id: string;
  name: string;
  genericName: string;
  type: ProductType;
  gradient: string;
  dossiersVerified: number;
  dossiersTotal: number;
  claimsApproved: number;
  views: number;
  updated: string;
}
