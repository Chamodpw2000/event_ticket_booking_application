"use client";

import { PaymentList } from "@/features/payments/PaymentList";
import { Button } from "@/components/ui/button";
import { Receipt, Download, Filter } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Financial Operations</h1>
          <p className="text-slate-500 mt-1 text-left">Audit all successfully processed payments and manage refund offsets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 shadow-sm text-left">
          <p className="text-sm text-slate-500 font-medium">Total Volume</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">$42,500.00</h3>
          <p className="text-[10px] text-green-600 mt-1 font-medium">+12% from last week</p>
        </Card>
        <Card className="p-6 border-slate-200 shadow-sm text-left">
          <p className="text-sm text-slate-500 font-medium">Refund Ratio</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">1.2%</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Industry avg: 2.5%</p>
        </Card>
        <Card className="p-6 border-slate-200 shadow-sm text-left">
          <p className="text-sm text-slate-500 font-medium">Settled Payouts</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">84 Transactions</h3>
          <p className="text-[10px] text-blue-600 mt-1 font-medium">Next payout in 2 days</p>
        </Card>
      </div>

      <PaymentList />
    </div>
  );
}

import { Card } from "@/components/ui/card";
