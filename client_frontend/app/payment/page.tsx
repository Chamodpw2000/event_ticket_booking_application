"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentPage() {
  const router = useRouter();
  
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);
  
  const [cardName, setCardName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvc, setCvc] = React.useState("");

  React.useEffect(() => {
    const storedBookingId = globalThis.window.localStorage.getItem("PENDING_BOOKING_ID");
    if (!storedBookingId) {
      router.replace("/");
      return;
    }
    setBookingId(storedBookingId);
  }, [router]);

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!bookingId) return;

    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvc.trim()) {
      setMessage({ type: "error", text: "Please fill in all card details." });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        bookingId: /^\d+$/.test(bookingId) ? Number(bookingId) : bookingId,
        paymentMethod: "CARD",
        providerName: "stripe",
        providerReference: `ref-${Math.random().toString(36).substring(2, 10)}`,
        transactionType: "INITIATED"
      };

      const baseUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ?? "http://localhost:3006";
      const res = await fetch(`${baseUrl}/payments/saga`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Payment processing failed");
      }

      setMessage({ type: "success", text: "Payment successful! Your tickets are confirmed." });
      globalThis.window.localStorage.removeItem("PENDING_BOOKING_ID");
      
      // Optionally redirect after a few seconds
      setTimeout(() => {
        router.push("/events");
      }, 3000);
      
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "Failed to process payment. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingId) {
    return (
      <main className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-12">
        <p className="text-slate-400">Loading payment details...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full border-white/10 bg-slate-900/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Complete Payment</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your card details to finalize your booking #{bookingId}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message?.type === "success" ? (
            <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-400/20 text-green-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-400">{message.text}</h3>
              <p className="mt-2 text-sm text-slate-300">Redirecting to your events...</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200" htmlFor="cardName">
                  Name on Card
                </label>
                <input
                  id="cardName"
                  type="text"
                  placeholder="John Doe"
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus-visible:border-cyan-400"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200" htmlFor="cardNumber">
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus-visible:border-cyan-400"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-200" htmlFor="expiry">
                    Expiry (MM/YY)
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus-visible:border-cyan-400"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-200" htmlFor="cvc">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus-visible:border-cyan-400"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                  />
                </div>
              </div>

              {message && message.type === 'error' && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {message.text}
                </div>
              )}

              <Button type="submit" className="mt-6 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Pay Now"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
