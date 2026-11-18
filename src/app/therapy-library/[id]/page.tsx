import { DISEASE_THERAPY_AREAS } from "@/features/workspace/ad-options";
import TherapyAreaClient from "./therapy-area-client";

/* Every therapy area is known up front, so a static export can render each one. */
export function generateStaticParams() {
  return DISEASE_THERAPY_AREAS.map((area) => ({ id: area.id }));
}

export default function TherapyAreaPage() {
  return <TherapyAreaClient />;
}
