"use client";

import { createContext } from "react";

import { FALLBACK_DELIVERY, type DeliveryInfo } from "@/lib/delivery-display";

export const DeliveryContext = createContext<DeliveryInfo>(FALLBACK_DELIVERY);

// Delivery settings read once per request by the root layout (server side),
// shared with the client components that show delivery (PDP/Quick View note,
// cart, checkout, confirmation). Plain JSON only (money as strings).
const DeliveryProvider = ({ value, children }: { value: DeliveryInfo; children: React.ReactNode }) => (
    <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>
);

export default DeliveryProvider;
