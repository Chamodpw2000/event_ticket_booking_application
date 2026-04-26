"use client";

import { VenueList } from "@/features/venues/VenueList";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Download } from "lucide-react";

export default function VenuesPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Venue Management</h1>
          <p className="text-slate-500 mt-1">Manage locations, seating capacities, and physical addresses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-md">
            <Plus className="h-4 w-4" />
            Add Venue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <VenueList />
      </div>
    </div>
  );
}
