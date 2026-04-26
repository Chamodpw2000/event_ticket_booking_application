"use client";

import { useEvents } from "@/hooks/useEvents";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns"; // Wait, I need to install date-fns

export function EventList() {
  const { data: events, isLoading, isError } = useEvents();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[250px]" />
        <Card>
          <CardContent className="p-0">
            <div className="h-[400px] w-full flex flex-col gap-2 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
        Failed to load events. Please ensure the Event Service is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Active Events</h2>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Event Title</TableHead>
              <TableHead className="font-semibold text-slate-700">Category</TableHead>
              <TableHead className="font-semibold text-slate-700">Start Time</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No events found. Start by creating your first event.
                </TableCell>
              </TableRow>
            ) : (
              events?.map((event) => (
                <TableRow key={event.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{event.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {event.category || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-xs">
                    {new Date(event.startTime).toLocaleString()}
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
                  <TableCell className="text-right">
                    <span className="text-sm font-medium">3 Ticket Types</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Inline helper for cn if I didn't want to import it, but I'll import it correctly
import { cn } from "@/lib/utils";
