// Every customer-facing sentence about paying by bank transfer, Raast,
// JazzCash or Easypaisa: the checkout options, the cart line, the payment
// panel (order confirmation and /track) and the step-by-step guides. Plain
// strings only, so the wording can be edited here without touching any
// component. Rules: DECISIONS.md → Bank transfer and mobile wallet payments.
//
// CHECK BEFORE RELEASE: the guide steps use generic menu names. JazzCash and
// Easypaisa rename menus between app versions, so read every guide against
// the current apps (and a bank app for Raast) before shipping.

import type { PaymentAccountType } from "@/types";

export interface PaymentGuide {
    /** The collapsible guide's title. */
    title: string;
    /** Short numbered steps, at most 5. */
    steps: string[];
    /** Optional closing line under the steps (not numbered). */
    footnote?: string;
}

export type PaymentGuideKey = "jazzcashToBank" | "easypaisaToBank" | "raast";

export const PAYMENT_GUIDES: Record<PaymentGuideKey, PaymentGuide> = {
    jazzcashToBank: {
        title: "How to send from JazzCash to a bank account",
        steps: [
            "Open the JazzCash app and choose Send Money, then Bank Account or Raast.",
            "Choose our bank from the list, then enter the IBAN shown above.",
            "Check that the account title shown matches ours.",
            "Enter the exact amount. If asked for a purpose or reference, use your order number.",
            "Confirm with your MPIN and take a screenshot of the receipt.",
        ],
    },
    easypaisaToBank: {
        title: "How to send from Easypaisa to a bank account",
        steps: [
            "Open the Easypaisa app and choose Send Money, then Bank Transfer or Raast.",
            "Choose our bank from the list, then enter the IBAN shown above.",
            "Check that the account title shown matches ours.",
            "Enter the exact amount. If asked for a purpose or reference, use your order number.",
            "Confirm with your PIN and take a screenshot of the receipt.",
        ],
    },
    raast: {
        title: "How to pay with Raast",
        steps: [
            "Open your bank, JazzCash or Easypaisa app and choose Raast (send to a Raast ID or mobile number).",
            "Enter our Raast ID shown above.",
            "Check that the account title shown matches ours.",
            "Enter the exact amount. If asked for a purpose or reference, use your order number.",
            "Confirm and take a screenshot of the receipt.",
        ],
    },
};

/** QR guide step 1, by the type of the account the QR belongs to. */
export function qrFirstStep(type: PaymentAccountType): string {
    if (type === "JAZZCASH") return "Open the JazzCash app and choose Scan QR.";
    if (type === "EASYPAISA") return "Open the Easypaisa app and choose Scan QR.";

    return "Open your bank, JazzCash or Easypaisa app and choose Scan QR.";
}

/** The QR guide for one account's QR code. */
export function qrGuide(type: PaymentAccountType): PaymentGuide {
    return {
        title: "How to pay with the QR code",
        steps: [
            qrFirstStep(type),
            "Scan the QR code above, or pick a screenshot of it from your gallery.",
            "Check that the account title shown matches ours.",
            "Enter the exact amount and confirm.",
            "Take a screenshot of the receipt.",
        ],
        footnote: "If your app can't read this code, use the account details above instead.",
    };
}

export const PAYMENT_TEXT = {
    // Checkout (shown only while the Store offers bank transfer).
    methodLegend: "Payment method",
    codLabel: "Cash on delivery",
    codDescription: "Pay in cash when your order arrives.",
    bankLabel: "Bank transfer / JazzCash / Easypaisa",
    bankDescription: "You'll get our account details after placing your order.",
    /** Admin's exact 400 when bank transfer was switched off during checkout. */
    bankUnavailable: "Bank transfer isn't available for this store",

    // Cart, under "Continue to Checkout".
    cartCodOnly: "Pay with cash on delivery",
    cartBoth: "Cash on delivery or bank transfer",

    // Payment panel (order confirmation and /track).
    panelHeading: "Complete your payment",
    pay: (amount: string) => `Pay ${amount}`,
    /** {order} is replaced by the order number (shown with a Copy button). */
    reference: "Use your order number {order} as the payment reference.",
    confirmNote: "The store will confirm your order after checking your payment.",
    tabsLabel: "Ways to pay",
    tabBank: "Bank / Raast",
    tabJazzcash: "JazzCash",
    tabEasypaisa: "Easypaisa",
    /** Wallet tab, after the wallet's own accounts. */
    viaBankAfterWallet: (wallet: string) => `Or send from ${wallet} to our bank account`,
    /** Wallet tab of a Store without that wallet: the bank accounts only. */
    viaBankOnly: (wallet: string) => `Send from ${wallet} to our bank account`,
    qrAlt: (accountTitle: string) => `Payment QR code for ${accountTitle}`,
    qrOpen: "Open QR image",
    qrHint: "On your phone? Take a screenshot, then in your app choose Scan QR and pick the image from your gallery.",
    noAccounts: "Contact the store on WhatsApp for payment details.",
    whatsappButton: "Send payment screenshot on WhatsApp",
    whatsappMessage: (amount: string, trackingId: string) =>
        `Hi! I've paid ${amount} for order ${trackingId}. Here's my payment screenshot.`,

    // Account card labels.
    accountTitle: "Account title",
    iban: "IBAN",
    accountNumber: "Account number",
    raastId: "Raast ID",
    mobileNumber: "Mobile number",
    tillId: "Till ID",
    orderNumber: "order number",

    // Copy buttons.
    copy: "Copy",
    copied: "Copied",
    copyLabel: (what: string) => `Copy ${what}`,
    copiedAnnouncement: (what: string) => `${what} copied`,
    copyFailed: "Couldn't copy. Press and hold the text to copy it.",

    // /track "Payment" line.
    trackCod: "Cash on delivery",
    trackBank: "Bank transfer",
    trackAwaiting: "Bank transfer · Awaiting payment",
    trackReceived: "Bank transfer · Payment received",
};
