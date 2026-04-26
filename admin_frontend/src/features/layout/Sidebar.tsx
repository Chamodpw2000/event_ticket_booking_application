"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Ticket, 
  MapPin, 
  Music, 
  CreditCard,
  Settings,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Users", href: "/users", icon: Users },
  { name: "Bookings", href: "/bookings", icon: Ticket },
  { name: "Artists", href: "/artists", icon: Music },
  { name: "Venues", href: "/venues", icon: MapPin },
  { name: "Payments", href: "/payments", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Ticket className="w-5 h-5" />
          </div>
          <span>Tickety Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Admin User</span>
            <span className="text-xs text-slate-500">Super Admin</span>
          </div>
          <Link href="/settings" className="ml-auto p-1.5 rounded-md hover:bg-slate-100 text-slate-400">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
