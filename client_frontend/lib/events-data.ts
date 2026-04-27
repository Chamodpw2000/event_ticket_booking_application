export type HomeEventCard = {
  key: string;
  name: string;
  meta: string;
  price: string;
  date: string;
  location: string;
  imageUrl: string | null;
};

type BackendEvent = {
  id: number | string;
  title?: string | null;
  category?: string | null;
  startTime?: string | null;
  bannerUrl?: string | null;
  eventTicketTypes?: Array<{ price?: number | null }>;
  venueDetails?: {
    name?: string | null;
    city?: string | null;
  } | null;
};

const FALLBACK_EVENTS: HomeEventCard[] = [
  {
    key: "fallback-1",
    name: "Neon Nights Festival",
    meta: "Electronic · Riverfront Grounds",
    price: "From $42",
    date: "Fri, Jun 14",
    location: "Colombo",
    imageUrl: null,
  },
  {
    key: "fallback-2",
    name: "Champions Derby",
    meta: "Sports · National Stadium",
    price: "From $19",
    date: "Sat, Jun 22",
    location: "Kandy",
    imageUrl: null,
  },
  {
    key: "fallback-3",
    name: "Broadway Spotlight",
    meta: "Theatre · Grand Hall",
    price: "From $28",
    date: "Sun, Jul 07",
    location: "Galle",
    imageUrl: null,
  },
  {
    key: "fallback-4",
    name: "Comedy After Dark",
    meta: "Stand-up · Blue Box Arena",
    price: "From $16",
    date: "Thu, Jul 18",
    location: "Negombo",
    imageUrl: null,
  },
];

const formatDateLabel = (input?: string | null) => {
  if (!input) return "Date TBA";
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return "Date TBA";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  }).format(parsed);
};

const formatPriceLabel = (event: BackendEvent) => {
  const prices = (event.eventTicketTypes ?? [])
    .map((ticket) => Number(ticket.price))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (prices.length === 0) return "See pricing";

  const minPrice = Math.min(...prices);
  return Number.isInteger(minPrice) ? `From $${minPrice}` : `From $${minPrice.toFixed(2)}`;
};

const mapBackendEventToCard = (event: BackendEvent): HomeEventCard => {
  const venueName = event.venueDetails?.name?.trim();
  const venueCity = event.venueDetails?.city?.trim();
  const category = event.category?.trim();
  const categoryLabel = category ? `${category.charAt(0).toUpperCase()}${category.slice(1)}` : null;

  return {
    key: String(event.id),
    name: event.title?.trim() || "Untitled Event",
    meta: [categoryLabel, venueName].filter(Boolean).join(" · ") || "Live event",
    price: formatPriceLabel(event),
    date: formatDateLabel(event.startTime),
    location: venueCity || venueName || "Venue TBA",
    imageUrl: event.bannerUrl?.trim() || null,
  };
};

const filterCards = (cards: HomeEventCard[], query?: string) => {
  const q = query?.trim().toLowerCase();
  if (!q) return cards;

  return cards.filter((card) => {
    const haystack = [card.name, card.meta, card.location, card.date].join(" ").toLowerCase();
    return haystack.includes(q);
  });
};

export const fetchEventCards = async (options?: {
  limit?: number;
  query?: string;
}): Promise<HomeEventCard[]> => {
  const baseUrl =
    process.env.EVENT_SERVICE_URL ?? process.env.NEXT_PUBLIC_EVENT_SERVICE_URL ?? "http://localhost:3001";

  try {
    const response = await fetch(`${baseUrl}/events`, { cache: "no-store" });
    if (!response.ok) {
      const fallback = filterCards(FALLBACK_EVENTS, options?.query);
      return options?.limit ? fallback.slice(0, options.limit) : fallback;
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      const fallback = filterCards(FALLBACK_EVENTS, options?.query);
      return options?.limit ? fallback.slice(0, options.limit) : fallback;
    }

    const mapped = payload.map((event) => mapBackendEventToCard(event as BackendEvent));
    const filtered = filterCards(mapped, options?.query);

    if (filtered.length === 0 && !options?.query) {
      return options?.limit ? FALLBACK_EVENTS.slice(0, options.limit) : FALLBACK_EVENTS;
    }

    return options?.limit ? filtered.slice(0, options.limit) : filtered;
  } catch {
    const fallback = filterCards(FALLBACK_EVENTS, options?.query);
    return options?.limit ? fallback.slice(0, options.limit) : fallback;
  }
};
