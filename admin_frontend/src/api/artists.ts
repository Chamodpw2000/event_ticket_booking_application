import { artistClient } from "./client";

export interface Artist {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  genre?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const artistService = {
  getAll: async (): Promise<Artist[]> => {
    const response = await artistClient.get("/");
    return response.data;
  },

  create: async (data: any): Promise<Artist> => {
    const response = await artistClient.post("/", data);
    return response.data;
  }
};
