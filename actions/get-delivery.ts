import { FALLBACK_DELIVERY, type DeliveryInfo } from "@/lib/delivery-display";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/delivery`;

type DeliveryResponse = Omit<DeliveryInfo, "available"> & {
    cities: Array<{ key: string; name: string; fee: string }>;
};

// The Store's public delivery settings (Admin GET /api/{storeId}/delivery).
// Never throws: on a 404 (an Admin deployed before delivery charges), a
// network error or an unexpected body it returns FALLBACK_DELIVERY, so
// checkout still works and Admin computes the fee.
const getDelivery = async (): Promise<DeliveryInfo> => {
    try {
        const res = await fetch(URL, { cache: "no-store" });

        if (!res.ok) return FALLBACK_DELIVERY;

        const data = (await res.json()) as DeliveryResponse;

        if (!data || !Array.isArray(data.cities) || typeof data.defaultFee !== "string") {
            return FALLBACK_DELIVERY;
        }

        return {
            available: true,
            area: data.area,
            defaultFee: data.defaultFee,
            freeDeliveryThreshold: data.freeDeliveryThreshold ?? null,
            daysMin: data.daysMin,
            daysMax: data.daysMax,
            daysLabel: data.daysLabel ?? null,
            cities: data.cities.map(({ key, name, fee }) => ({ key, name, fee })),
            otherCityAllowed: Boolean(data.otherCityAllowed),
            lockedCityKey: data.lockedCityKey ?? null,
        };
    } catch {
        return FALLBACK_DELIVERY;
    }
};

export default getDelivery;
