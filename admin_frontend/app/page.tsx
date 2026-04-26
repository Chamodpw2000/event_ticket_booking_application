import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Ticket, CreditCard, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const stats = [
    { name: "Active Events", value: "12", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Users", value: "2,450", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Tickets Sold", value: "8,920", icon: Ticket, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Revenue", value: "$124,500", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Operations Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here is what is happening across your platform today.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.name}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12% from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Recent Service Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">New Event Created: "Global Tech Summit 2026"</p>
                    <p className="text-xs text-slate-500">24 minutes ago • event-service</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-slate-500 text-xs py-1 h-auto">View All Activity</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 bg-slate-900 text-white dark">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link 
              href="/events" 
              className="group flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="font-medium">Manage Events Catalog</span>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link 
              href="/bookings" 
              className="group flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-emerald-400" />
                <span className="font-medium">Audit Booking Transactions</span>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link 
              href="/users" 
              className="group flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="font-medium">Manage User Permissions</span>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
