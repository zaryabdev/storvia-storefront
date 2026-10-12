"use client";

import { createContext } from "react";

export const BankTransferContext = createContext(false);

// Whether the Store offers bank transfer at checkout: the public Store GET's
// `bankTransferEnabled`, read once per request by the root layout. false when
// the field is missing (older Admin) or getStore fails, so checkout stays COD
// only. The server re-checks at order time.
const BankTransferProvider = ({ value, children }: { value: boolean; children: React.ReactNode }) => (
    <BankTransferContext.Provider value={value}>{children}</BankTransferContext.Provider>
);

export default BankTransferProvider;
