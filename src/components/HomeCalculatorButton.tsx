"use client";

import type { ReactNode } from "react";

/** Repeated clicks always scroll, even when #calculators is already in the URL. */
export default function HomeCalculatorButton({ children, className }: { children: ReactNode; className: string }) {
  const scroll = () => {
    const target = document.getElementById("calculators");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Preserve a useful deep link without relying on hashchange for scrolling.
    if (location.hash !== "#calculators") history.replaceState(null, "", "#calculators");
  };
  return <button type="button" onClick={scroll} className={className}>{children}</button>;
}
