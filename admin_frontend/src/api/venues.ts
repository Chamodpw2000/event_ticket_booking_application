import { venueClient } from "./client";

export interface Venue {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  capacity: number;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const venueService = {
  getAll: async (): Promise<Venue[]> => {
    const response = await venueClient.get("/");
    return response.data;
  },

  create: async (data: any): Promise<Venue> => {
    const response = await venueClient.post("/", data);
    return response.data;
  }
};
