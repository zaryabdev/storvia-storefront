"use client";

import Button from "@/components/ui/button";
import type { CreateOrderPayload } from "@/types";
import { useMemo, useState } from "react";

type FormValues = {
    name: string;
    phone: string;
    email: string;
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    notes: string;
};

export default function CODDetailsForm({
    items,
    onSubmit,
    submitting,
    onCancel,
    children,
}: {
    items: Array<{ productId: string; quantity: number }>;
    submitting: boolean;
    onCancel: () => void;
    onSubmit: (payload: CreateOrderPayload) => Promise<void>;
    /**
     * Rendered inside the `<form>`, after the delivery fields and before
     * the action buttons — used by the checkout page to show Order Summary
     * / Payment Method alongside the fields without duplicating the
     * form/validation logic that lives entirely in this component.
     */
    children?: React.ReactNode;
}) {
    const [vals, setVals] = useState<FormValues>({
        name: "",
        phone: "",
        email: "",
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        notes: "",
    });

    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const errors = useMemo(() => {
        const e: Record<string, string> = {};
        // minimal COD requirements (unchanged semantics from before this refactor)
        if (!vals.name.trim()) e.name = "Name is required";
        if (!vals.phone.trim()) e.phone = "Phone is required";
        if (!vals.line1.trim()) e.line1 = "Address line 1 is required";
        if (!vals.city.trim()) e.city = "City is required";
        return e;
    }, [vals]);

    const isValid = Object.keys(errors).length === 0;

    const set =
        (key: keyof FormValues) =>
        (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setVals((p) => ({ ...p, [key]: ev.target.value }));
        };

    const markTouched = (key: keyof FormValues) => () =>
        setTouched((p) => ({ ...p, [key]: true }));

    const showError = (key: keyof FormValues) => Boolean(touched[key] && errors[key]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // mark all as touched if invalid
        if (!isValid) {
            setTouched({
                name: true,
                phone: true,
                email: true,
                line1: true,
                line2: true,
                city: true,
                postalCode: true,
                notes: true,
            });
            return;
        }

        const payload: CreateOrderPayload = {
            items,
            paymentMethod: "COD",
            customer: {
                name: vals.name.trim(),
                phone: vals.phone.trim(),
                email: vals.email.trim() || undefined,
            },
            shipping: {
                line1: vals.line1.trim(),
                line2: vals.line2.trim() || undefined,
                city: vals.city.trim(),
                postalCode: vals.postalCode.trim() || undefined,
                country: "PK",
                notes: vals.notes.trim() || undefined,
            },
            notes: vals.notes.trim() || undefined,
        };

        await onSubmit(payload);
    };

    const inputClassName =
        "w-full rounded-control border border-border bg-surface px-3 py-2.5 text-body text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

    return (
        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-8">
            {/* `max-w-xl` prevents a lone full-width input from stretching
                edge-to-edge on tablet, before the `lg` two-column split
                (which naturally constrains this column's width) engages.
                Released at `lg` since the grid column already bounds it. */}
            <div className="max-w-xl space-y-8 lg:max-w-none lg:col-span-7">
                {/* Customer */}
                <div>
                    <h2 className="text-subheading text-foreground">
                        Customer details
                    </h2>
                    <div className="mt-3 grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="cod-name" className="text-meta font-medium text-muted-foreground">
                                Name *
                            </label>
                            <input
                                id="cod-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                className={inputClassName}
                                value={vals.name}
                                onChange={set("name")}
                                onBlur={markTouched("name")}
                                placeholder="Your name"
                                aria-invalid={showError("name")}
                                aria-describedby={showError("name") ? "cod-name-error" : undefined}
                            />
                            {showError("name") && (
                                <p id="cod-name-error" className="mt-1 text-meta text-danger">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="cod-phone" className="text-meta font-medium text-muted-foreground">
                                Phone *
                            </label>
                            <input
                                id="cod-phone"
                                name="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                className={inputClassName}
                                value={vals.phone}
                                onChange={set("phone")}
                                onBlur={markTouched("phone")}
                                placeholder="+92..."
                                aria-invalid={showError("phone")}
                                aria-describedby={showError("phone") ? "cod-phone-error" : undefined}
                            />
                            {showError("phone") && (
                                <p id="cod-phone-error" className="mt-1 text-meta text-danger">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="cod-email" className="text-meta font-medium text-muted-foreground">
                                Email (optional)
                            </label>
                            <input
                                id="cod-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={inputClassName}
                                value={vals.email}
                                onChange={set("email")}
                                placeholder="name@email.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping */}
                <div>
                    <h2 className="text-subheading text-foreground">
                        Delivery address
                    </h2>
                    <div className="mt-3 grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="cod-line1" className="text-meta font-medium text-muted-foreground">
                                Address line 1 *
                            </label>
                            <input
                                id="cod-line1"
                                name="address-line1"
                                type="text"
                                autoComplete="address-line1"
                                className={inputClassName}
                                value={vals.line1}
                                onChange={set("line1")}
                                onBlur={markTouched("line1")}
                                placeholder="House, street, area"
                                aria-invalid={showError("line1")}
                                aria-describedby={showError("line1") ? "cod-line1-error" : undefined}
                            />
                            {showError("line1") && (
                                <p id="cod-line1-error" className="mt-1 text-meta text-danger">
                                    {errors.line1}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="cod-line2" className="text-meta font-medium text-muted-foreground">
                                Address line 2 (optional)
                            </label>
                            <input
                                id="cod-line2"
                                name="address-line2"
                                type="text"
                                autoComplete="address-line2"
                                className={inputClassName}
                                value={vals.line2}
                                onChange={set("line2")}
                                placeholder="Apartment, landmark"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="cod-city" className="text-meta font-medium text-muted-foreground">
                                    City *
                                </label>
                                <input
                                    id="cod-city"
                                    name="address-level2"
                                    type="text"
                                    autoComplete="address-level2"
                                    className={inputClassName}
                                    value={vals.city}
                                    onChange={set("city")}
                                    onBlur={markTouched("city")}
                                    placeholder="Karachi"
                                    aria-invalid={showError("city")}
                                    aria-describedby={showError("city") ? "cod-city-error" : undefined}
                                />
                                {showError("city") && (
                                    <p id="cod-city-error" className="mt-1 text-meta text-danger">
                                        {errors.city}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="cod-postal" className="text-meta font-medium text-muted-foreground">
                                    Postal code (optional)
                                </label>
                                <input
                                    id="cod-postal"
                                    name="postal-code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    className={inputClassName}
                                    value={vals.postalCode}
                                    onChange={set("postalCode")}
                                    placeholder="74200"
                                />
                            </div>
                        </div>

                        {/*
                          Country is not an input — it's always "PK" in the
                          payload (see handleSubmit below). Shown here as
                          fixed display text ("Pakistan", never the raw "PK"
                          code) so the shopper can see where delivery is
                          scoped to, without implying a selector exists.
                        */}
                        <div>
                            <span className="text-meta font-medium text-muted-foreground">Country</span>
                            <p className="mt-1 text-body text-foreground">Pakistan</p>
                        </div>

                        <div>
                            <label htmlFor="cod-notes" className="text-meta font-medium text-muted-foreground">
                                Delivery notes (optional)
                            </label>
                            <textarea
                                id="cod-notes"
                                name="notes"
                                className={inputClassName}
                                value={vals.notes}
                                onChange={set("notes")}
                                rows={3}
                                placeholder="Leave at reception, call on arrival..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {children && (
                <div className="mt-8 space-y-6 lg:col-span-5 lg:mt-0">
                    {children}
                </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end lg:col-span-12">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="w-full border border-border bg-surface text-foreground hover:bg-surface-muted sm:w-auto"
                >
                    Back to Cart
                </Button>

                <Button
                    type="submit"
                    disabled={!isValid || submitting}
                    className="w-full sm:w-auto"
                >
                    {submitting ? "Placing Order..." : "Place Order"}
                </Button>
            </div>
        </form>
    );
}
