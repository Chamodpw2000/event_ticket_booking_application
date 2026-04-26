"use client";

import { useEvents } from "@/hooks/useEvents";
import { TicketTypeSagaForm } from "./TicketTypeSagaForm";
import { AssignArtistsForm } from "./AssignArtistsForm";
import { EventDetailsSheet } from "./EventDetailsSheet";
import { Event } from "@/api/events";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  MoreVertical, 
  Edit, 
  TicketPlus, 
  ExternalLink,
  UserPlus,
  Zap
} from "lucide-react";
import { ServiceError } from "@/components/ServiceError";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function EventList() {
  const { data: events, isLoading, isError } = useEvents();
  const [isSagaOpen, setIsSagaOpen] = useState(false);
  const [isAssignArtistsOpen, setIsAssignArtistsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenSaga = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsSagaOpen(true);
  };

  const handleOpenAssignArtists = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsAssignArtistsOpen(true);
  };

  const handleOpenDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[250px]" />
        <Card>
          <div className="h-[400px] w-full flex flex-col gap-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <ServiceError 
        serviceName="Event Service" 
        port="3003" 
        icon={Zap} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Event</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Venue</TableHead>
              <TableHead className="font-semibold text-slate-700">Time</TableHead>
              <TableHead className="font-semibold text-slate-700">Tickets</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events?.map((event) => (
              <TableRow 
                key={event.id} 
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                onClick={() => handleOpenDetails(event)}
              >
                <TableCell className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={cn(
                      "capitalize",
                      event.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Venue #{event.venueId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-slate-500">
                    <span>{new Date(event.startTime).toLocaleDateString()}</span>
                    <span>{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50/30">
                    {event.eventTicketTypes?.length || 0} Types
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => handleOpenDetails(event)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Full Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-blue-600 focus:text-blue-600"
                        onClick={() => handleOpenSaga(event.id)}
                      >
                        <TicketPlus className="h-4 w-4" />
                        Add Tickets (Saga)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-indigo-600 focus:text-indigo-600"
                        onClick={() => handleOpenAssignArtists(event.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Assign Artists
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Live Page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isSagaOpen} onOpenChange={setIsSagaOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Ticket Inventory</DialogTitle>
            <DialogDescription>
              Create a ticket type and initialize inventory in one atomic operation.
            </DialogDescription>
          </DialogHeader>
          {selectedEventId && (
            <TicketTypeSagaForm 
              eventId={selectedEventId} 
              onSuccess={() => setIsSagaOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignArtistsOpen} onOpenChange={setIsAssignArtistsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Assign Artists</DialogTitle>
            <DialogDescription>
              Select artists from the directory to participate in this event.
            </DialogDescription>
          </DialogHeader>
          {selectedEventId && (
            <AssignArtistsForm 
              eventId={selectedEventId} 
              onSuccess={() => setIsAssignArtistsOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      <EventDetailsSheet 
        event={selectedEvent} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
      />
    </div>
  );
}
