"use client";

import { Event } from "@/api/events";
import { useArtists } from "@/hooks/useArtists";
import { useVenues } from "@/hooks/useVenues";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  Clock,
  Info,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsSheet({ event, open, onOpenChange }: EventDetailsSheetProps) {
  const { data: artists } = useArtists();
  const { data: venues } = useVenues();

  if (!event) return null;

  const venue = venues?.find(v => v._id === event.venueId.toString());
  const eventArtistIds = event.eventArtists?.map(ea => ea.artistId.toString()) || [];
  const assignedArtists = artists?.filter(a => eventArtistIds.includes(a._id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-400">
              {event.category || "General"}
            </Badge>
            <Badge 
              variant={event.status === "published" ? "success" : "secondary"}
              className="capitalize text-[10px]"
            >
              {event.status}
            </Badge>
          </div>
          <SheetTitle className="text-2xl font-bold text-slate-900 leading-tight">
            {event.title}
          </SheetTitle>
          <SheetDescription className="text-slate-500 mt-2">
            Detailed overview of the event configuration and resource allocation.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8 pb-10">
          {/* Banner Placeholder */}
          <div className="aspect-video w-full rounded-xl bg-slate-100 flex items-center justify-center border border-dashed border-slate-200">
            {event.bannerUrl ? (
              <img src={event.bannerUrl} alt="Banner" className="w-full h-full object-cover rounded-xl" />
            ) : (
               <div className="text-center text-slate-400">
                <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <span className="text-xs">No banner image uploaded</span>
               </div>
            )}
          </div>

          {/* Time & Location */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">Schedule</h4>
                <div className="mt-1 space-y-1">
                   <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Start: {format(new Date(event.startTime), "PPP p")}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    End: {format(new Date(event.endTime), "PPP p")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">Venue</h4>
                <p className="text-sm text-slate-600 mt-0.5">
                  {venue ? venue.name : `Venue #${event.venueId}`}
                </p>
                {venue && (
                  <p className="text-xs text-slate-400 mt-1">
                    {venue.address}, {venue.city}, {venue.country}
                  </p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Artists */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Lineup
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {assignedArtists?.length || 0} Professional(s)
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {assignedArtists && assignedArtists.length > 0 ? (
                assignedArtists.map((artist) => (
                  <div key={artist._id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {artist.profileImageUrl ? (
                        <img src={artist.profileImageUrl} alt={artist.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs uppercase font-bold">
                          {artist.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{artist.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{artist.genre || "General"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400 italic py-2">No artists assigned to this event yet.</div>
              )}
            </div>
          </section>

          <Separator />

          {/* Inventory */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-slate-400" />
                Ticket Inventory
              </h4>
              <Badge className="bg-blue-600">
                {event.eventTicketTypes?.length || 0} Types Enabled
              </Badge>
            </div>

            <div className="space-y-3">
              {event.eventTicketTypes?.map((tt) => (
                <div key={tt.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-900">{tt.name}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{tt.description || "Baseline offering for this event."}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">{tt.currency} {tt.price}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Initial Allocation</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{tt.initialStock} Units</span>
                  </div>
                </div>
              ))}
              {(!event.eventTicketTypes || event.eventTicketTypes.length === 0) && (
                <div className="text-sm text-slate-400 italic py-2">No ticket types defined.</div>
              )}
            </div>
          </section>

          {/* Additional Info */}
          {event.description && (
            <section className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-slate-400" />
                Event Description
              </h4>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
