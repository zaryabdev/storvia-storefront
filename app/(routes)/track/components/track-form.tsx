"use client";

import { Check } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import { formatRupees } from "@/lib/delivery-display";
import {
    STATUS_TEXT,
    STEPS_DONE,
    TrackedOrder,
    formatPakistanDate,
    trackOrder,
} from "@/lib/track-order";

const inputClassName =
    "w-full rounded-control border border-border bg-surface px-3 py-2.5 text-body text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const STEPS = ["Received", "Confirmed", "Delivered"];

const isFree = (fee: string) => /^0*(\.0*)?$/.test(fee);

/**
 * The phone lives only in component state and the POST body: never in the
 * URL, localStorage or sessionStorage. Only `?order=` may appear in the URL.
 */
export default function TrackForm({ initialOrder }: { initialOrder: string }) {
    const router = useRouter();
    const [orderNumber, setOrderNumber] = useState(initialOrder);
    const [phone, setPhone] = useState("");
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<TrackedOrder | null>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const orderInputRef = useRef<HTMLInputElement>(null);
    const requestId = useRef(0);

    useEffect(() => {
        if (result) headingRef.current?.focus();
    }, [result]);

    const orderError = touched && !orderNumber.trim() ? "Enter your order number" : null;
    const phoneError = touched && !phone.trim() ? "Enter your phone number" : null;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setTouched(true);
        if (!orderNumber.trim() || !phone.trim() || loading) return;

        const id = ++requestId.current;
        setLoading(true);
        setError(null);
        setResult(null);

        const res = await trackOrder(orderNumber.trim(), phone.trim());
        if (id !== requestId.current) return;

        setLoading(false);
        if (res.ok) setResult(res.order);
        else setError(res.message);
    };

    const reset = () => {
        requestId.current++;
        setOrderNumber("");
        setPhone("");
        setTouched(false);
        setError(null);
        setResult(null);
        setLoading(false);
        if (initialOrder) router.replace("/track");
        orderInputRef.current?.focus();
    };

    const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    return (
        <>
            <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl space-y-4">
                <div>
                    <label htmlFor="track-order" className="text-meta font-medium text-muted-foreground">
                        Order number
                    </label>
                    <input
                        id="track-order"
                        ref={orderInputRef}
                        name="order"
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. ORD-261009-7KQ2MXRP"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        required
                        aria-invalid={Boolean(orderError)}
                        aria-describedby={orderError ? "track-order-error" : undefined}
                        className={inputClassName}
                    />
                    {orderError && (
                        <p id="track-order-error" className="mt-1 text-meta text-danger">
                            {orderError}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="track-phone" className="text-meta font-medium text-muted-foreground">
                        Phone number
                    </label>
                    <input
                        id="track-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300 1234567"
                        autoComplete="tel"
                        required
                        aria-invalid={Boolean(phoneError)}
                        aria-describedby={phoneError ? "track-phone-error" : undefined}
                        className={inputClassName}
                    />
                    {phoneError && (
                        <p id="track-phone-error" className="mt-1 text-meta text-danger">
                            {phoneError}
                        </p>
                    )}
                </div>

                {error && (
                    <div
                        role="alert"
                        className="rounded-surface border border-danger bg-surface-muted px-4 py-3 text-body text-danger"
                    >
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Checking…" : "Track order"}
                </Button>
            </form>

            <div aria-live="polite" className="mt-8 max-w-xl">
                {result && (
                    <section className="rounded-surface border border-border bg-surface p-4 sm:p-6">
                        <h2
                            ref={headingRef}
                            tabIndex={-1}
                            className="break-all text-subheading text-foreground outline-none"
                        >
                            Order {result.trackingId}
                        </h2>

                        <p className="mt-3 text-body font-semibold text-foreground">{STATUS_TEXT[result.status]}</p>

                        {STEPS_DONE[result.status] > 0 && (
                            <ol className="mt-4 grid grid-cols-3 gap-2">
                                {STEPS.map((label, index) => {
                                    const done = index < STEPS_DONE[result.status];

                                    return (
                                        <li key={label} className="flex flex-col items-center gap-1 text-center">
                                            <span
                                                aria-hidden
                                                className={
                                                    done
                                                        ? "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                                        : "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground"
                                                }
                                            >
                                                {done ? <Check size={16} /> : index + 1}
                                            </span>
                                            <span className={done ? "text-meta font-medium text-foreground" : "text-meta text-muted-foreground"}>
                                                {label}
                                                <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}

                        <div className="mt-4 space-y-1 text-meta text-muted-foreground">
                            <p>Placed {formatPakistanDate(result.createdAt)}</p>
                            {result.confirmedAt && <p>Confirmed {formatPakistanDate(result.confirmedAt)}</p>}
                            {(result.status === "DRAFT" || result.status === "CONFIRMED") && result.city && (
                                <p>
                                    Delivering to {result.city}
                                    {result.deliveryDays && ` · usually ${result.deliveryDays} days after confirmation`}
                                </p>
                            )}
                        </div>

                        <ul className="mt-4 divide-y divide-border border-t border-border">
                            {result.items.map((item, index) => {
                                const detail = [item.size, item.color].filter(Boolean).join(" · ");

                                return (
                                    <li key={index} className="flex items-start justify-between gap-4 py-3">
                                        <div className="min-w-0">
                                            <p className="break-words text-body font-medium text-foreground">{item.name}</p>
                                            {detail && <p className="text-meta text-muted-foreground">{detail}</p>}
                                            <p className="text-meta text-muted-foreground">Qty {item.quantity}</p>
                                        </div>
                                        <p className="shrink-0 text-body font-semibold text-foreground">
                                            {formatRupees(item.lineTotal)}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>

                        <dl className="space-y-1 border-t border-border pt-3 text-body">
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Subtotal</dt>
                                <dd className="text-foreground">{formatRupees(result.subtotal)}</dd>
                            </div>
                            {result.deliveryFee !== null && (
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Delivery</dt>
                                    <dd className="text-foreground">
                                        {isFree(result.deliveryFee) ? "Free" : formatRupees(result.deliveryFee)}
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-4 font-semibold">
                                <dt className="text-foreground">Total</dt>
                                <dd className="text-foreground">{formatRupees(result.total)}</dd>
                            </div>
                        </dl>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            {whatsapp && (
                                <a
                                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                                        `Hi! I have a question about my order ${result.trackingId}.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-5 py-2.5 text-body font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                >
                                    Message the store on WhatsApp
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={reset}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-body font-semibold text-foreground hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                                Track another order
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
