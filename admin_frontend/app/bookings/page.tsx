"use client";

import { BookingList } from "@/features/bookings/BookingList";
import { Button } from "@/components/ui/button";
import { useExpireStaleBookings } from "@/hooks/useBookings";
import { Trash2, Download, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
  const expireStale = useExpireStaleBookings();

  const handleCleanup = async () => {
    try {
      const result = await expireStale.mutateAsync();
      toast.success(result.message || "Stale bookings expired");
    } catch (err: any) {
      toast.error(err.message || "Failed to cleanup bookings");
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Booking Monitoring</h1>
          <p className="text-slate-500 mt-1">Track ticket sales, payment statuses, and transaction health.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-slate-200 text-slate-600"
            onClick={handleCleanup}
            disabled={expireStale.isPending}
          >
            {expireStale.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Cleanup Stale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BookingList />
      </div>
    </div>
  );
}
