import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#06070a" }}>
      {children}
    </div>
  );
}
