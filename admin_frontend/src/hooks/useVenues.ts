import { useQuery } from "@tanstack/react-query";
import { venueService } from "@/api/venues";

export function useVenues() {
  return useQuery({
    queryKey: ["venues"],
    queryFn: venueService.getAll,
  });
}
