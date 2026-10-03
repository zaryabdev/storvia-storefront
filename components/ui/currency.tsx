"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

interface CurrencyProps {
    value?: string | number;
    currency?: string; // default "PKR"
    locale?: string; // default "en-PK"
    noDecimals?: boolean; // optional: true => Rs 1,234 (no .00)
    className?: string; // optional: merged onto the root element
}

const Currency: React.FC<CurrencyProps> = ({
    value = 0,
    currency = "PKR",
    locale = "en-PK",
    noDecimals = true,
    className,
}) => {
    // No isMounted gate: locale/currency are fixed explicit arguments (not
    // derived from the browser's system locale), so Intl.NumberFormat
    // produces the same output on the server and the client — there is no
    // hydration mismatch to guard against here.
    const formatter = useMemo(() => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            maximumFractionDigits: noDecimals ? 0 : 2,
            minimumFractionDigits: noDecimals ? 0 : 2,
        });
    }, [currency, locale, noDecimals]);

    return (
        <div className={cn("font-semibold text-foreground", className)}>{formatter.format(Number(value))}</div>
    );
};

export default Currency;
