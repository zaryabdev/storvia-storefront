import { useContext } from "react";

import { BankTransferContext } from "@/providers/bank-transfer-provider";

/** true while the Store offers bank transfer (see providers/bank-transfer-provider.tsx). */
const useBankTransfer = () => useContext(BankTransferContext);

export default useBankTransfer;
