import { eventClient } from "./client";

export interface EventTicketType {
  id: number;
  eventId: number;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  initialStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventArtist {
  id: number;
  eventId: number;
  artistId: number;
  createdAt: string;
}

export interface Event {
  id: number;
  venueId: number;
  title: string;
  description: string | null;
  category: string | null;
  startTime: string;
  endTime: string;
  status: string;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
  eventTicketTypes: EventTicketType[];
  eventArtists: EventArtist[];
}

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const response = await eventClient.get("/events");
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await eventClient.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    const response = await eventClient.post("/events", data);
    return response.data;
  },

  addTicketType: async (eventId: number, data: any) => {
    const response = await eventClient.post(`/events/${eventId}/ticket-types`, data);
    return response.data;
  },

  addTicketWithInventorySaga: async (data: any): Promise<any> => {
    const response = await eventClient.post("/events/ticket-types/saga", data);
    return response.data;
  },

  addArtists: async (eventId: number, artistIds: number[]): Promise<any> => {
    const response = await eventClient.post(`/events/${eventId}/artists`, { artistIds });
    return response.data;
  },
};
