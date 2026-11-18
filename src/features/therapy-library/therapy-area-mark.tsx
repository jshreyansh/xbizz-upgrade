import {
  Bean, Biohazard, Bone, Brain, Dna, Droplet, Eye, Hand, HeartPulse, Ribbon, Salad, Smile, Stethoscope, Users, Wind,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* Illustration only: each area's icon and the wash behind it. */
const MARK: Record<string, { icon: LucideIcon; wash: string }> = {
  cardiology: { icon: HeartPulse, wash: "linear-gradient(135deg,#ffd9d9,#f7a8b8)" },
  dermatology: { icon: Hand, wash: "linear-gradient(135deg,#ffe8d6,#f5c2a0)" },
  endocrinology: { icon: Droplet, wash: "linear-gradient(135deg,#dff4ff,#a9d8f5)" },
  gastroenterology: { icon: Salad, wash: "linear-gradient(135deg,#e6f7dc,#b9e3a0)" },
  "general-medicine": { icon: Stethoscope, wash: "linear-gradient(135deg,#eceff4,#c9d1de)" },
  immunology: { icon: Bone, wash: "linear-gradient(135deg,#fff3d1,#f5d78a)" },
  "infectious-diseases": { icon: Biohazard, wash: "linear-gradient(135deg,#e2f8f2,#9fe0cc)" },
  "nephrology-and-hepatology": { icon: Bean, wash: "linear-gradient(135deg,#f3e6ff,#d2b3f2)" },
  neurology: { icon: Brain, wash: "linear-gradient(135deg,#e7e8ff,#b4b8f5)" },
  oncology: { icon: Ribbon, wash: "linear-gradient(135deg,#fde2f0,#e8a9cf)" },
  "ophthalmology-and-ent": { icon: Eye, wash: "linear-gradient(135deg,#dcf3f7,#9fd6e2)" },
  psychiatry: { icon: Smile, wash: "linear-gradient(135deg,#fff0e0,#f7c99a)" },
  "rare-diseases": { icon: Dna, wash: "linear-gradient(135deg,#ece3ff,#c3aef5)" },
  respiratory: { icon: Wind, wash: "linear-gradient(135deg,#e0f1ff,#a8cdf0)" },
  "women-s-and-men-s-health": { icon: Users, wash: "linear-gradient(135deg,#ffe6ee,#f3b4c8)" },
};

export const areaMark = (id: string) => MARK[id] ?? MARK["general-medicine"];

/** The area's icon on its wash, at any size. */
export function TherapyAreaMark({ areaId, className, iconClassName }: { areaId: string; className?: string; iconClassName?: string }) {
  const { icon: Icon, wash } = areaMark(areaId);
  return (
    <span className={cn("grid shrink-0 place-items-center text-ink-2", className)} style={{ background: wash }}>
      <Icon className={cn("size-5", iconClassName)} strokeWidth={1.75} />
    </span>
  );
}
