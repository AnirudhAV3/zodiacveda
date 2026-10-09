import HomeCalculatorButton from "@/components/HomeCalculatorButton";
import SavedReportsButton from "@/components/SavedReportsButton";

export default function HomeActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SavedReportsButton />
      <HomeCalculatorButton className="rounded-full border border-amber-400/40 px-5 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10">
        Build Chart
      </HomeCalculatorButton>
    </div>
  );
}
