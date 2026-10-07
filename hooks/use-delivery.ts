import { useContext } from "react";

import { DeliveryContext } from "@/providers/delivery-provider";

const useDelivery = () => useContext(DeliveryContext);

export default useDelivery;
