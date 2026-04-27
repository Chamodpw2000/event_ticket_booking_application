export default function Home() {
  const featuredEvents = [
    {
      name: "Neon Nights Festival",
      meta: "Electronic · Riverfront Grounds",
      price: "From $42",
      date: "Fri, Jun 14",
      location: "Colombo",
    },
    {
      name: "Champions Derby",
      meta: "Sports · National Stadium",
      price: "From $19",
      date: "Sat, Jun 22",
      location: "Kandy",
    },
    {
      name: "Broadway Spotlight",
      meta: "Theatre · Grand Hall",
      price: "From $28",
      date: "Sun, Jul 07",
      location: "Galle",
    },
    {
      name: "Comedy After Dark",
      meta: "Stand-up · Blue Box Arena",
      price: "From $16",
      date: "Thu, Jul 18",
      location: "Negombo",
    },
  ];

  const popularCategories = [
    "Concerts",
    "Sports",
    "Theatre",
    "Festivals",
    "Comedy",
    "Family",
    "Conferences",
    "Workshops",
  ];

  const trustHighlights = [
    "Instant e-ticket delivery",
    "Verified event organizers",
    "Seat map previews",
    "Secure card checkout",
    "24/7 customer support",
    "Fast refund handling",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-slate-950/90 via-slate-900/85 to-cyan-950/70 shadow-[0_24px_120px_rgba(2,6,23,0.45)] backdrop-blur-md">
        <section className="p-6 lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Live Event Marketplace
            </div>

            <div className="space-y-4">
              <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
                Find your next live moment in seconds.
              </h1>
              <p className="max-w-4xl text-base leading-7 text-slate-300 sm:text-lg">
                Search concerts, sports, theatre, and more. Compare availability, secure your seats,
                and get tickets delivered instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="grid gap-2 md:grid-cols-[1.2fr_0.9fr_0.7fr_auto]">
                <input
                  placeholder="Search artist, team, venue..."
                  className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/50"
                />
                <input
                  placeholder="City"
                  className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/50"
                />
                <input
                  placeholder="Any date"
                  className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/50"
                />
                <button
                  type="button"
                  className="h-11 rounded-xl bg-amber-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Find Tickets
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {popularCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                Trending This Week
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Popular events near you</h2>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
            >
              View all events
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredEvents.map((item) => (
              <article key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-4 h-28 rounded-xl bg-linear-to-br from-cyan-300/35 via-cyan-100/10 to-transparent" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{item.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.meta}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-semibold text-amber-200">{item.location}</span>
                  <span className="text-sm font-semibold text-white">{item.price}</span>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg border border-white/15 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  Get Tickets
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h2 className="text-2xl font-semibold text-white">Why people book with Tickety</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {trustHighlights.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-linear-to-br from-amber-300/20 via-white/5 to-cyan-300/20 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">Never Miss Out</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Get event alerts in your inbox</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Be first to know about presales, venue announcements, and weekend trending events.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              placeholder="Enter your email"
              className="h-11 flex-1 rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-200/60"
            />
            <button
              type="button"
              className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Subscribe
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-300">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Need Group Bookings?</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Corporate events, schools, and fan clubs</h2>
          </div>
          <button
            type="button"
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Contact Sales
          </button>
        </div>
      </section>
    </main>
  );
}
