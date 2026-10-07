"use client";

import { Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRupees, type DeliveryNudge as Nudge } from "@/lib/delivery-display";

// "Add Rs X more for free delivery" / "You've got free delivery!" (cart and
// checkout). Renders nothing without a nudge.
const DeliveryNudge = ({ nudge, className }: { nudge: Nudge | null; className?: string }) => {
    if (!nudge) return null;

    return (
        <p
            aria-live="polite"
            className={cn(
                "flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-meta text-foreground",
                className,
            )}
        >
            <Truck size={16} aria-hidden="true" className="shrink-0" />
            {nudge.kind === "met"
                ? "You've got free delivery!"
                : `Add ${formatRupees(nudge.amount)} more for free delivery`}
        </p>
    );
};

export default DeliveryNudge;
