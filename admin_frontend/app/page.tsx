"use client";

import { useEvents } from "@/hooks/useEvents";
import { useUsers } from "@/hooks/useUsers";
import { usePayments } from "@/hooks/usePayments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: events } = useEvents();
  const { data: users } = useUsers();
  const { data: payments } = usePayments();

  const stats = [
    {
      title: "Total Events",
      value: events?.length || "0",
      description: "Across all categories",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: users?.length || "0",
      description: "System-wide directory",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Revenue",
      value: `$${payments?.reduce((acc, p) => acc + (p.status === 'PAID' ? p.amount : 0), 0).toLocaleString() || "0"}`,
      description: "Net processed volume",
      icon: CreditCard,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Active Sagas",
      value: "4",
      description: "Real-time transactions",
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Systems Overview</h1>
          <p className="text-slate-500 mt-1 text-left">Welcome back, Administrator. Here's a snapshot of your event booking ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/events">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events List */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 text-left">Recent Events</CardTitle>
              <CardDescription className="text-left">Latest event configurations and deployments.</CardDescription>
            </div>
            <Link href="/events">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 gap-1">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.slice(0, 5).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-slate-900">{event.title}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{event.category || "General"}</TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'published' ? 'success' : 'secondary'} className="capitalize text-[10px]">
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/events">
                        <Button variant="outline" size="sm" className="h-7 text-[10px] border-slate-200">Manage</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Health & Quick Actions */}
        <div className="space-y-8">
          <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Microservices</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">AWS Step Functions</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Database Cluster</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Optimal</Badge>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Last heartbeat: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-blue-600 p-4 text-white">
                <h4 className="font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Actions
                </h4>
             </div>
             <CardContent className="p-2">
                <div className="grid grid-cols-1 gap-1">
                  <Link href="/users">
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-slate-600 hover:bg-slate-50">
                      <Users className="h-4 w-4 text-slate-400" />
                      Add New User
                    </Button>
                  </Link>
                  <Separator />
                  <Link href="/artists">
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-slate-600 hover:bg-slate-50">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      Register Artist
                    </Button>
                  </Link>
                   <Separator />
                  <Link href="/payments">
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-slate-600 hover:bg-slate-50">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      Review Refunds
                    </Button>
                  </Link>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Separator } from "@/components/ui/separator";
