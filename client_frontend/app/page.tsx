export default function Home() {
  const featuredEvents = [
    {
      name: "Sunset Sessions",
      meta: "Music festival · Downtown Park",
      price: "$48",
      seats: "Almost sold out",
    },
    {
      name: "Arena Match Night",
      meta: "Sports · North Arena",
      price: "$22",
      seats: "Seats in sections B and C",
    },
    {
      name: "City Stage Live",
      meta: "Theatre · Grand Hall",
      price: "$36",
      seats: "Matinee and evening slots",
    },
  ];

  const steps = [
    "Browse events by date, venue, and category.",
    "Choose seats with a clear view of the stage or field.",
    "Reserve instantly and get your ticket confirmation.",
  ];

  const benefits = [
    "No cluttered checkout flow",
    "Real-time seat availability",
    "Mobile-first booking experience",
    "Fast ticket confirmation",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-[0_24px_120px_rgba(2,6,23,0.4)] backdrop-blur-md">
        <div className="grid gap-10 px-6 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-300">
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-200">Tickety</span>
              <span>Book the next thing you want to attend</span>
            </div>

            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover events and lock in the best seats before they’re gone.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                From concerts to sports nights and theatre shows, Tickety keeps discovery, seat
                selection, and checkout in one smooth flow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
                href="#events"
              >
                Browse events
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                href="#how-it-works"
              >
                How booking works
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 text-slate-50 shadow-2xl shadow-cyan-950/30">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Tonight’s pick</p>
                <h2 className="text-xl font-semibold">Sunset Sessions</h2>
              </div>
              <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm font-semibold text-cyan-300">
                4.8 rating
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-300 to-cyan-300 p-5 text-slate-950">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Featured booking</p>
              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-semibold">$48</p>
                  <p className="mt-1 text-sm font-medium">General admission</p>
                </div>
                <div className="rounded-2xl bg-white/40 px-4 py-3 text-right text-sm font-semibold">
                  Doors open
                  <div className="text-lg">7:30 PM</div>
                </div>
              </div>
            </div>

            <div id="how-it-works" className="mt-5 space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="events" className="grid gap-6 py-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-lg shadow-cyan-950/20 backdrop-blur-md">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Trending now
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Popular events to book</h2>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
              Live availability
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredEvents.map((event) => (
              <article key={event.name} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
                    {event.price}
                  </p>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {event.seats}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{event.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{event.meta}</p>
                <a
                  href="#"
                  className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/10"
                >
                  View seats
                </a>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-cyan-300/10 p-6 shadow-lg shadow-cyan-950/20 backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Checkout</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Simple booking, clear confirmation</h2>
          <div className="mt-6 space-y-3">
            {[
              ["Search", "Filter events by city, date, and vibe."],
              ["Select", "Pick your seats and see the final price immediately."],
              ["Confirm", "Complete payment and receive your ticket details."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl bg-slate-950/55 p-4">
                <div className="text-sm font-semibold text-cyan-200">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-white p-5 text-slate-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Your next ticket</p>
                <h3 className="text-xl font-semibold">Saturday headline show</h3>
              </div>
              <div className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                Save 10%
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Book early to get the best section, faster entry, and instant confirmation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
