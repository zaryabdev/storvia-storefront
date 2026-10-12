// Bank transfer / mobile wallet payment details shown after checkout (order
// confirmation and /track). Pure functions, no React. Admin is authoritative
// and validates every account; this only shows what the merchant entered,
// defensively: an account missing a required field is skipped and a
// non-https QR image is ignored. Never invents details.
// Rules: DECISIONS.md → Bank transfer and mobile wallet payments.

import { toPakistaniMobile } from "./phone";
import type { PaymentAccount, PaymentAccountType } from "@/types";

const ACCOUNT_TYPES: PaymentAccountType[] = ["BANK", "JAZZCASH", "EASYPAISA"];

// Trimmed non-empty string, else null.
const text = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value.trim() : null;

// An https URL, else null (the Store-logo rule).
function httpsUrl(value: unknown): string | null {
    const url = text(value);
    if (!url) return null;

    try {
        return new URL(url).protocol === "https:" ? url : null;
    } catch {
        return null;
    }
}

// One account in Admin's public shape, or null when it can't be shown.
function readAccount(raw: unknown): PaymentAccount | null {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

    const value = raw as Record<string, unknown>;
    const type = value.type as PaymentAccountType;
    const accountTitle = text(value.accountTitle);
    if (!ACCOUNT_TYPES.includes(type) || !accountTitle) return null;

    const qrImageUrl = httpsUrl(value.qrImageUrl);
    const note = text(value.note);

    if (type === "BANK") {
        const bankName = text(value.bankName);
        const iban = text(value.iban);
        if (!bankName || !iban) return null;

        return {
            type,
            accountTitle,
            bankName,
            iban: compact(iban).toUpperCase(),
            accountNumber: text(value.accountNumber),
            raastId: text(value.raastId),
            walletNumber: null,
            tillId: null,
            qrImageUrl,
            note,
        };
    }

    const walletNumber = text(value.walletNumber);
    const tillId = text(value.tillId);
    // A wallet needs something to pay to.
    if (!walletNumber && !tillId && !qrImageUrl) return null;

    return {
        type,
        accountTitle,
        bankName: null,
        iban: null,
        accountNumber: null,
        raastId: null,
        walletNumber,
        tillId,
        qrImageUrl,
        note,
    };
}

/** The usable accounts, in the merchant's order ([] for anything that isn't an array). */
export function readPaymentAccounts(raw: unknown): PaymentAccount[] {
    if (!Array.isArray(raw)) return [];

    const accounts: PaymentAccount[] = [];
    for (const item of raw) {
        const account = readAccount(item);
        if (account) accounts.push(account);
    }

    return accounts;
}

/** Spaces and dashes removed: what a Copy button puts on the clipboard. */
export const compact = (value: string) => value.replace(/[\s-]/g, "");

/** "PK36 SCBL 0000 0011 2345 6702": groups of 4 (Admin's formatIban). */
export const formatIban = (iban: string) => compact(iban).replace(/(.{4})(?=.)/g, "$1 ");

/** A Pakistani mobile copied as "03001234567" (what wallet apps expect); anything else compacted. */
export function copyableMobile(value: string): string {
    const mobile = toPakistaniMobile(value);

    return mobile ? `0${mobile.slice(2)}` : compact(value);
}

export type PaymentTabKey = "bank" | "jazzcash" | "easypaisa";

export interface PaymentTab {
    key: PaymentTabKey;
    /** BANK accounts on the bank tab; that wallet's accounts on a wallet tab. */
    accounts: PaymentAccount[];
    /** Wallet tabs only: the bank accounts the wallet can send to ([] on the bank tab). */
    viaBank: PaymentAccount[];
}

/**
 * The tabs to show, in order, each only when it has content:
 * - "bank": every BANK account;
 * - "jazzcash" / "easypaisa": that wallet's accounts, plus every BANK account
 *   (a wallet can send to a bank account or IBAN).
 * So a Store with only a bank account still gets all three tabs.
 */
export function paymentTabs(accounts: PaymentAccount[]): PaymentTab[] {
    const bank = accounts.filter((account) => account.type === "BANK");
    const tabs: PaymentTab[] = [];

    if (bank.length > 0) tabs.push({ key: "bank", accounts: bank, viaBank: [] });

    for (const [key, type] of [
        ["jazzcash", "JAZZCASH"],
        ["easypaisa", "EASYPAISA"],
    ] as const) {
        const own = accounts.filter((account) => account.type === type);
        if (own.length > 0 || bank.length > 0) tabs.push({ key, accounts: own, viaBank: bank });
    }

    return tabs;
}

/** Rupees for a sentence or a WhatsApp message: "Rs 1,500" with a plain space. */
export const plainRupees = (formatted: string) => formatted.replace(/ /g, " ");

/** wa.me link with a prefilled message; null without a number. */
export function whatsappLink(number: string | null | undefined, message: string): string | null {
    if (!number) return null;

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
