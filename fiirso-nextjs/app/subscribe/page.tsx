"use client";

import { Check } from "lucide-react";
import { ViewerLayout } from "@/components/layout/ViewerLayout";

const plans = [
  { name: "Free", price: "$0", period: "forever", features: ["Limited content", "SD quality", "Ads supported"], cta: "Current Plan", highlight: false },
  { name: "Standard", price: "$8.99", period: "per month", features: ["All movies & series", "HD quality", "No ads", "Download 5 titles"], cta: "Get Standard", highlight: false },
  { name: "Premium", price: "$14.99", period: "per month", features: ["Everything in Standard", "4K + HDR quality", "Unlimited downloads", "4 simultaneous screens", "Early access to new content"], cta: "Get Premium", highlight: true },
];

export default function SubscribePage() {
  return (
    <ViewerLayout>
      <div className="px-5 lg:px-12 pt-12 pb-28 lg:pb-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Choose Your Plan</h1>
          <p className="text-foreground/50 text-sm max-w-md mx-auto">Watch unlimited movies and TV series. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {plans.map(plan => (
            <div key={plan.name} className={`relative rounded-2xl p-6 border ${plan.highlight ? "border-primary bg-primary/[0.08] ring-1 ring-primary/30" : "border-border bg-card"}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold tracking-wide">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-black">{plan.price}</span>
                <span className="text-sm text-foreground/40 ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-foreground/[0.08] hover:bg-foreground/[0.12] text-foreground"}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </ViewerLayout>
  );
}
