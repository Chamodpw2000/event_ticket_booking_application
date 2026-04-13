export default function Home() {
  const metrics = [
    { label: "Live events", value: "128" },
    { label: "Tickets sold today", value: "9.4k" },
    { label: "Average fill rate", value: "87%" },
    { label: "Pending settlements", value: "18" },
  ];

  const operations = [
    {
      title: "Inventory sync",
      detail: "Keep venue capacity, reserved seats, and ticket types aligned across services.",
    },
    {
      title: "Booking oversight",
      detail: "Review checkout activity, failed reservations, and refund requests from one place.",
    },
    {
      title: "Artist and venue routing",
      detail: "Coordinate show listings, room allocations, and published schedules before launch.",
    },
  ];

  const queue = [
    "Festival launch packet ready for approval",
    "12 seats released after payment timeout",
    "Settlement report generated for last night",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_24px_120px_rgba(15,23,42,0.12)] backdrop-blur md:rounded-[2.5rem]">
        <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">Tickety Admin</span>
              <span>Event control center</span>
            </div>

            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Run events, ticket inventory, and payouts from one command panel.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Monitor live sales, approve releases, and keep every venue in sync while the
                customer experience stays fast and reliable.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                href="#operations"
              >
                Open operations
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
                href="#queue"
              >
                Review queue
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="text-3xl font-semibold tracking-tight text-slate-950">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-[1.75rem] bg-slate-950 p-5 text-slate-50 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Tonight’s top event</p>
                <h2 className="text-xl font-semibold">Arena Summer Pass</h2>
              </div>
              <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                94% full
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {operations.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="operations" className="grid gap-6 py-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-lg shadow-slate-950/5 backdrop-blur">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Workflow
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Operational priorities</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              Updated in real time
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {operations.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-500">0{index + 1}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="queue" className="rounded-[2rem] border border-slate-200 bg-amber-50/70 p-6 shadow-lg shadow-slate-950/5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
            Queue
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Live admin alerts</h2>
          <div className="mt-6 space-y-3">
            {queue.map((item, index) => (
              <div key={item} className="flex items-start gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
