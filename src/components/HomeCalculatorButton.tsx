"use client";

import type { ReactNode } from "react";

function scrollToCalculators() {
  const target = document.getElementById("calculators");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  if (location.hash !== "#calculators") history.replaceState(null, "", "#calculators");
}

export default function HomeCalculatorButton({
  children = "Build Chart",
  className,
}: {
  children?: ReactNode;
  className: string;
}) {
  return (
    <button type="button" onClick={scrollToCalculators} className={className}>
      {children}
    </button>
  );
}
