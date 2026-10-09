"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

import {
    META_PIXEL_ID_PATTERN,
    TIKTOK_PIXEL_ID_PATTERN,
    configurePixels,
    trackPageView,
} from "@/lib/pixels";

interface PixelsProps {
    /** The Store's Meta Pixel id while active, else null (from the public Store GET). */
    metaPixelId: string | null;
    /** The Store's TikTok Pixel id while active, else null. */
    tiktokPixelId: string | null;
}

// Official Meta base code, adapted: automatic advanced matching off
// (`autoConfig` false before `init`), no user data in `init`, and no
// PageView here (PageViewTracker sends it, exactly once per page).
const metaBaseCode = (id: string) => `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, ${JSON.stringify(id)});
fbq('init', ${JSON.stringify(id)});
window.__storviaPixelReady && window.__storviaPixelReady('meta');`;

// Official TikTok base code, adapted: no `ttq.page()` here (see above), a
// guard against running twice, and no `identify` (no customer data).
const tiktokBaseCode = (id: string) => `!function (w, d, t) {
if (w[t] && w[t]._i) return;
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load(${JSON.stringify(id)});
}(window, document, 'ttq');
window.__storviaPixelReady && window.__storviaPixelReady('tiktok');`;

// PageView on the first load and on every change of the path. Query-string
// changes keep the same pathname, so they never fire. The ref also absorbs
// React Strict Mode's double effect in dev.
function PageViewTracker() {
    const pathname = usePathname();
    const lastTracked = useRef<string | null>(null);

    useEffect(() => {
        if (lastTracked.current === pathname) return;
        lastTracked.current = pathname;
        trackPageView();
    }, [pathname]);

    return null;
}

/**
 * Rendered once in the root layout. Loads a pixel's base code only when the
 * Store GET returned its id (active); renders nothing otherwise.
 */
export default function Pixels({ metaPixelId, tiktokPixelId }: PixelsProps) {
    const metaId = metaPixelId && META_PIXEL_ID_PATTERN.test(metaPixelId) ? metaPixelId : null;
    const tiktokId =
        tiktokPixelId && TIKTOK_PIXEL_ID_PATTERN.test(tiktokPixelId) ? tiktokPixelId : null;

    // During render, so it is set before any page effect sends an event.
    configurePixels({ meta: metaId !== null, tiktok: tiktokId !== null });

    if (!metaId && !tiktokId) return null;

    return (
        <>
            {metaId && (
                <Script id="storvia-meta-pixel" strategy="afterInteractive">
                    {metaBaseCode(metaId)}
                </Script>
            )}
            {tiktokId && (
                <Script id="storvia-tiktok-pixel" strategy="afterInteractive">
                    {tiktokBaseCode(tiktokId)}
                </Script>
            )}
            <PageViewTracker />
        </>
    );
}
