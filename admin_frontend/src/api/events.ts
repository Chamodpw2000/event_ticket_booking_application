import { eventClient } from "./client";

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
  eventTicketTypes: any[];
  eventArtists: any[];
}

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const response = await eventClient.get("/");
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await eventClient.get(`/${id}`);
    return response.data;
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    const response = await eventClient.post("/", data);
    return response.data;
  },

  addTicketType: async (eventId: number, data: any) => {
    const response = await eventClient.post(`/${eventId}/ticket-types`, data);
    return response.data;
  },

  addTicketWithInventorySaga: async (data: any): Promise<any> => {
    const response = await eventClient.post("/ticket-types/saga", data);
    return response.data;
  },

  addArtists: async (eventId: number, artistIds: number[]): Promise<any> => {
    const response = await eventClient.post(`/${eventId}/artists`, { artistIds });
    return response.data;
  },
};
