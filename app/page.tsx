import Link from "next/link";

const PHASES = [
  { n: 1, name: "Scaffold", detail: "Next.js + TypeScript + Tailwind + Prisma", done: true },
  { n: 2, name: "Quote CRUD", detail: "Schema migrated; create/save/load a quote; register list", done: true },
  { n: 3, name: "Intake form", detail: "The eleven sections, ported from the prototype" },
  { n: 4, name: "Pricing & validation", detail: "computeShipping, updateSummary, validateQuote" },
  { n: 5, name: "HubSpot", detail: "Deal pre-fill, live population options, quote-code cron" },
  { n: 6, name: "Docx generation", detail: "Internal draft and sponsor quote" },
  { n: 7, name: "Shared data", detail: "Cost log, comparables, rate card, quote codes" },
  { n: 8, name: "Auth + deploy", detail: "Magic-link sign-in, soft launch" },
  { n: 9, name: "Handoff", detail: "Extend access to the rest of the team" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest opacity-50">
          The MT Group
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Quote Builder</h1>
        <p className="max-w-prose text-sm leading-relaxed opacity-70">
          Structured quote intake that produces an internal pricing draft and a
          sponsor-facing quote from one form. The scaffold is up — no quote
          logic is wired in yet.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-widest opacity-50">
          Build progress
        </h2>
        <ol className="flex flex-col gap-px overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
          {PHASES.map((phase) => (
            <li
              key={phase.n}
              className="flex items-baseline gap-3 border-b border-black/5 px-4 py-2.5 text-sm last:border-b-0 dark:border-white/10"
            >
              <span
                className={`font-mono text-xs tabular-nums ${
                  phase.done ? "opacity-100" : "opacity-40"
                }`}
                aria-hidden
              >
                {phase.done ? "✓" : String(phase.n).padStart(2, "0")}
              </span>
              <span className={phase.done ? "font-medium" : "opacity-60"}>
                {phase.name}
              </span>
              <span className="ml-auto hidden text-right text-xs opacity-40 sm:block">
                {phase.detail}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div>
        <Link
          href="/quotes"
          className="inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Open the quote register
        </Link>
      </div>

      <footer className="text-xs opacity-40">
        <a href="/api/health" className="underline underline-offset-4">
          /api/health
        </a>{" "}
        reports app and database status.
      </footer>
    </main>
  );
}
