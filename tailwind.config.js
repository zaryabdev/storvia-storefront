/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Default-theme semantic tokens. These are additive color names layered
      // on top of Tailwind's stock palette (gray/black/green/red/etc.) — they
      // do not redefine any existing default keys (e.g. `rounded-xl`,
      // `text-3xl`, `shadow-xl`), so existing components that reference raw
      // Tailwind utilities directly are unaffected by this addition.
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        'surface-tint': 'var(--color-surface-tint)',
        border: 'var(--color-border)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          foreground: 'var(--color-danger-foreground)',
        },
        focus: 'var(--color-focus)',
      },
      // New radius names (not overriding the default sm/md/lg/xl/2xl/full
      // scale, which many existing, untouched components already rely on).
      borderRadius: {
        control: 'var(--radius-control)',
        surface: 'var(--radius-surface)',
      },
      boxShadow: {
        surface: 'var(--shadow-surface)',
      },
      // Small shared typography scale, available as text-display / text-heading
      // / text-subheading / text-body / text-meta. New names, not overrides of
      // Tailwind's default text-xs..text-6xl scale used elsewhere.
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.15', fontWeight: '700' }],
        heading: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],
        subheading: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5' }],
        meta: ['0.8125rem', { lineHeight: '1.4' }],
      },
    },
  },
  // @tailwindcss/aspect-ratio remains installed but intentionally left
  // unregistered here, unchanged from before this pass.
  plugins: [],
}
