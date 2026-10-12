"use client";

import { useId, useMemo, useRef, useState } from "react";

import CopyButton from "@/components/ui/copy-button";
import { formatRupees } from "@/lib/delivery-display";
import {
    compact,
    copyableMobile,
    formatIban,
    paymentTabs,
    plainRupees,
    readPaymentAccounts,
    whatsappLink,
    type PaymentTab,
    type PaymentTabKey,
} from "@/lib/payment-accounts";
import { PAYMENT_GUIDES, PAYMENT_TEXT, qrGuide, type PaymentGuide } from "@/lib/payment-guides";
import { cn } from "@/lib/utils";
import type { PaymentAccount } from "@/types";

const TAB_LABELS: Record<PaymentTabKey, string> = {
    bank: PAYMENT_TEXT.tabBank,
    jazzcash: PAYMENT_TEXT.tabJazzcash,
    easypaisa: PAYMENT_TEXT.tabEasypaisa,
};

const WALLET_LABELS: Record<string, string> = {
    JAZZCASH: PAYMENT_TEXT.tabJazzcash,
    EASYPAISA: PAYMENT_TEXT.tabEasypaisa,
};

const linkClassName =
    "inline-flex min-h-[44px] items-center text-meta font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

function Field({
    label,
    display,
    copy,
    what,
    mono = true,
}: {
    label: string;
    display: string;
    /** The clipboard value; no Copy button without it. */
    copy?: string;
    what?: string;
    mono?: boolean;
}) {
    return (
        <div>
            <dt className="text-meta text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 flex items-center justify-between gap-3">
                <span
                    className={cn(
                        "min-w-0 select-all break-words text-body text-foreground",
                        mono && "font-mono",
                    )}
                >
                    {display}
                </span>
                {copy && what && <CopyButton value={copy} what={what} />}
            </dd>
        </div>
    );
}

function AccountCard({ account }: { account: PaymentAccount }) {
    const isBank = account.type === "BANK";

    return (
        <div className="space-y-3 rounded-control border border-border bg-surface p-3 sm:p-4">
            <p className="break-words text-body font-semibold text-foreground">
                {isBank ? account.bankName : WALLET_LABELS[account.type]}
            </p>
            <dl className="space-y-2">
                <Field label={PAYMENT_TEXT.accountTitle} display={account.accountTitle} mono={false} />
                {isBank && account.iban && (
                    <Field label={PAYMENT_TEXT.iban} display={formatIban(account.iban)} copy={compact(account.iban)} what="IBAN" />
                )}
                {isBank && account.accountNumber && (
                    <Field
                        label={PAYMENT_TEXT.accountNumber}
                        display={account.accountNumber}
                        copy={compact(account.accountNumber)}
                        what="account number"
                    />
                )}
                {isBank && account.raastId && (
                    <Field
                        label={PAYMENT_TEXT.raastId}
                        display={account.raastId}
                        copy={copyableMobile(account.raastId)}
                        what="Raast ID"
                    />
                )}
                {!isBank && account.walletNumber && (
                    <Field
                        label={PAYMENT_TEXT.mobileNumber}
                        display={account.walletNumber}
                        copy={copyableMobile(account.walletNumber)}
                        what="mobile number"
                    />
                )}
                {!isBank && account.tillId && (
                    <Field label={PAYMENT_TEXT.tillId} display={account.tillId} copy={compact(account.tillId)} what="Till ID" />
                )}
            </dl>

            {account.qrImageUrl && (
                <div className="space-y-1">
                    {/* Merchant-hosted image on any https host, so not next/image. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={account.qrImageUrl}
                        alt={PAYMENT_TEXT.qrAlt(account.accountTitle)}
                        loading="lazy"
                        className="h-48 w-48 max-w-full rounded-control border border-border bg-white object-contain p-2"
                    />
                    <a href={account.qrImageUrl} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                        {PAYMENT_TEXT.qrOpen}
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <p className="text-meta text-muted-foreground">{PAYMENT_TEXT.qrHint}</p>
                    <div className="pt-1">
                        <Guide guide={qrGuide(account.type)} />
                    </div>
                </div>
            )}

            {account.note && (
                <p className="whitespace-pre-line break-words text-meta text-muted-foreground">{account.note}</p>
            )}
        </div>
    );
}

function Guide({ guide }: { guide: PaymentGuide }) {
    return (
        <details className="rounded-control border border-border bg-surface-muted">
            <summary className="flex min-h-[44px] cursor-pointer items-center px-3 text-meta font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                {guide.title}
            </summary>
            <ol className="list-decimal space-y-1 pb-3 pl-8 pr-3 text-meta text-foreground">
                {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                ))}
            </ol>
            {guide.footnote && <p className="px-3 pb-3 text-meta text-foreground">{guide.footnote}</p>}
        </details>
    );
}

function TabContent({ tab }: { tab: PaymentTab }) {
    const wallet = tab.key === "jazzcash" ? PAYMENT_TEXT.tabJazzcash : PAYMENT_TEXT.tabEasypaisa;
    const hasRaast = tab.key === "bank" && tab.accounts.some((account) => account.raastId);

    return (
        <div className="space-y-3">
            {tab.accounts.map((account, index) => (
                <AccountCard key={index} account={account} />
            ))}

            {tab.viaBank.length > 0 && (
                <>
                    <h4 className={cn("text-body font-semibold text-foreground", tab.accounts.length > 0 && "pt-2")}>
                        {tab.accounts.length > 0
                            ? PAYMENT_TEXT.viaBankAfterWallet(wallet)
                            : PAYMENT_TEXT.viaBankOnly(wallet)}
                    </h4>
                    {tab.viaBank.map((account, index) => (
                        <AccountCard key={`bank-${index}`} account={account} />
                    ))}
                    <Guide guide={tab.key === "jazzcash" ? PAYMENT_GUIDES.jazzcashToBank : PAYMENT_GUIDES.easypaisaToBank} />
                </>
            )}

            {hasRaast && <Guide guide={PAYMENT_GUIDES.raast} />}
        </div>
    );
}

/**
 * "Complete your payment" for a bank-transfer order: the amount, the order
 * number as the reference, and the Store's accounts in tabs (Bank / Raast,
 * JazzCash, Easypaisa; each only when it has content). Used by the order
 * confirmation and /track. `accounts` is Admin's raw `paymentAccounts`;
 * unusable entries are skipped, and with none left the customer is sent to
 * WhatsApp. `total` is the order total incl. delivery (decimal string).
 */
export default function PaymentPanel({
    accounts,
    total,
    trackingId,
}: {
    accounts: unknown;
    total: string;
    trackingId: string;
}) {
    const tabs = useMemo(() => paymentTabs(readPaymentAccounts(accounts)), [accounts]);
    const [active, setActive] = useState(0);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const baseId = useId();
    const headingId = `${baseId}-heading`;

    const amount = formatRupees(total);
    const [referenceBefore, referenceAfter = ""] = PAYMENT_TEXT.reference.split("{order}");
    const whatsapp = whatsappLink(
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        PAYMENT_TEXT.whatsappMessage(plainRupees(amount), trackingId),
    );
    const selected = Math.min(active, Math.max(tabs.length - 1, 0));

    const select = (index: number, focus = false) => {
        setActive(index);
        if (focus) tabRefs.current[index]?.focus();
    };

    // Roving tabindex: arrows move between tabs (wrapping), Home/End jump.
    const onKeyDown = (event: React.KeyboardEvent, index: number) => {
        const last = tabs.length - 1;
        const next =
            event.key === "ArrowRight"
                ? (index + 1) % tabs.length
                : event.key === "ArrowLeft"
                  ? (index - 1 + tabs.length) % tabs.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? last
                      : null;

        if (next === null) return;

        event.preventDefault();
        select(next, true);
    };

    return (
        <section aria-labelledby={headingId} className="space-y-4">
            <div>
                <h3 id={headingId} className="text-body font-semibold text-foreground">
                    {PAYMENT_TEXT.panelHeading}
                </h3>
                <p className="mt-1 text-subheading text-foreground">{PAYMENT_TEXT.pay(amount)}</p>
            </div>

            {/* Phones: the sentence, then Copy underneath, so the order number never splits. */}
            <div className="flex flex-col items-start gap-2 rounded-control bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="min-w-0 text-meta text-foreground">
                    {referenceBefore}
                    <span className="select-all whitespace-nowrap font-mono text-body font-semibold">{trackingId}</span>
                    {referenceAfter}
                </p>
                <CopyButton value={trackingId} what={PAYMENT_TEXT.orderNumber} />
            </div>

            <p className="text-meta text-muted-foreground">{PAYMENT_TEXT.confirmNote}</p>

            {tabs.length === 0 ? (
                <p className="rounded-control border border-border bg-surface-muted p-3 text-body text-foreground">
                    {PAYMENT_TEXT.noAccounts}
                </p>
            ) : (
                <div>
                    <div
                        role="tablist"
                        aria-label={PAYMENT_TEXT.tabsLabel}
                        className="grid auto-cols-fr grid-flow-col border-b border-border"
                    >
                        {tabs.map((tab, index) => {
                            const isSelected = index === selected;

                            return (
                                <button
                                    key={tab.key}
                                    ref={(el) => {
                                        tabRefs.current[index] = el;
                                    }}
                                    type="button"
                                    role="tab"
                                    id={`${baseId}-tab-${tab.key}`}
                                    aria-selected={isSelected}
                                    aria-controls={`${baseId}-panel-${tab.key}`}
                                    tabIndex={isSelected ? 0 : -1}
                                    onClick={() => select(index)}
                                    onKeyDown={(event) => onKeyDown(event, index)}
                                    className={cn(
                                        "-mb-px min-h-[44px] border-b-2 px-1 py-2 text-center text-meta font-medium leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
                                        isSelected
                                            ? "border-primary text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {TAB_LABELS[tab.key]}
                                </button>
                            );
                        })}
                    </div>

                    {tabs.map((tab, index) => (
                        <div
                            key={tab.key}
                            role="tabpanel"
                            id={`${baseId}-panel-${tab.key}`}
                            aria-labelledby={`${baseId}-tab-${tab.key}`}
                            hidden={index !== selected}
                            className="pt-4"
                        >
                            <TabContent tab={tab} />
                        </div>
                    ))}
                </div>
            )}

            {whatsapp && tabs.length > 0 && (
                <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-center text-body font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto sm:inline-flex"
                >
                    {PAYMENT_TEXT.whatsappButton}
                </a>
            )}
        </section>
    );
}
