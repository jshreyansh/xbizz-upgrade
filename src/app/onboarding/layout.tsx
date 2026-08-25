import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
}
