import HomeCalculatorButton from "@/components/HomeCalculatorButton";

export default function HomeIntro() {
  return (
    <>
      <p className="label-caps !text-amber-300">Vedic Astrology · Jyotiṣa Śāstra</p>
      <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
        <span className="text-shimmer">Decode the sky</span>
        <br />
        <span className="text-slate-100">the moment you were born</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-slate-300">Precise birth charts, divisional charts, dashas and time-tested predictions of your past, present and future — career, marriage, children, wealth and more.</p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <HomeCalculatorButton className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-9 py-4 text-lg font-semibold text-slate-950 shadow-[0_10px_40px_rgba(249,115,22,0.45)] transition hover:scale-[1.03]">
          <span className="glyph text-xl">✦</span> Build Chart
          <span className="transition group-hover:translate-x-1">→</span>
        </HomeCalculatorButton>
        <span className="text-sm text-slate-400">Free · No sign-up · Takes 30 seconds</span>
      </div>
    </>
  );
}
