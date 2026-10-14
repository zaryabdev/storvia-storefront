const MAX_LENGTH = 200;

/**
 * Plain-text strip above the header, on every page. `announcement` is Admin's
 * public value: the text only while the merchant has the bar on, else null.
 * An older Admin omits it; anything that isn't a non-blank string shows
 * nothing. Text only: no links, no HTML, not sticky, not dismissible.
 */
const AnnouncementBar = ({ announcement }: { announcement?: unknown }) => {
    if (typeof announcement !== "string") return null;

    const text = Array.from(announcement.trim()).slice(0, MAX_LENGTH).join("").trim();
    if (!text) return null;

    return (
        <div className="bg-primary px-4 py-2 text-center text-xs text-primary-foreground sm:text-sm">
            <p dir="auto" className="mx-auto max-w-3xl break-words">
                {text}
            </p>
        </div>
    );
};

export default AnnouncementBar;
