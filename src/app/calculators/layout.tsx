import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";

export default function CalculatorsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
