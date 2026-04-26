"use client";

import { useArtists } from "@/hooks/useArtists";
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
import { Music, Mail, ExternalLink, MoreVertical } from "lucide-react";

export function ArtistList() {
  const { data: artists, isLoading, error } = useArtists();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage />;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-700">Artist</TableHead>
            <TableHead className="font-semibold text-slate-700">Genre</TableHead>
            <TableHead className="font-semibold text-slate-700">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists?.map((artist) => (
            <TableRow key={artist._id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                    {artist.profileImageUrl ? (
                      <img src={artist.profileImageUrl} alt={artist.name} className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{artist.name}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3 w-3" />
                      {artist.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">
                  {artist.genre || "N/A"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={artist.isActive ? "success" : "secondary"}
                  className="capitalize"
                >
                  {artist.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="border-slate-200">
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ErrorMessage() {
  return (
    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
      <p>No artists found or service unavailable.</p>
    </div>
  );
}
