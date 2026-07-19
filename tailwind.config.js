/**
 * Searah design system.
 *
 * The palette, type scale, elevation and 8pt spacing are defined once here and
 * shared by the CMS and the landing page, so "premium enterprise" is a token set
 * rather than a per-component judgement call.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ---------------------------------------------------------- Primary */
        // The same navy ramp the landing page runs on. `brand` is the alias used
        // there, kept here so a class can be moved between the two apps unchanged.
        primary: {
          DEFAULT: '#0F3C8E', // 10.2:1 on white — type, fills, primary actions
          900: '#0A2A5E', // Dark bands, sidebar, primary hover
          700: '#0A2A5E',
          500: '#2F5FB3', // 6.2:1 — accents and hovers, safe at any size
          300: '#8FAEE0', // Fill/rule only, 2.28:1
          200: '#B8CCEC',
          100: '#EAF0FA', // Wash — badge grounds, active rows
        },
        brand: {
          DEFAULT: '#0F3C8E',
          900: '#0A2A5E',
          700: '#0F3C8E',
          500: '#2F5FB3',
          300: '#8FAEE0',
          200: '#B8CCEC',
          100: '#EAF0FA',
        },

        // The one warm note. 2.31:1 on white, so it is a FILL and never text.
        orange: {
          DEFAULT: '#F7921E',
          700: '#D9790F',
          200: '#FDD9A7',
        },
        accent: {
          DEFAULT: '#F7921E',
          700: '#D9790F',
          200: '#FDD9A7',
        },

        // The cool counterweight — a third category colour that is neither the
        // brand navy nor the warning orange.
        sage: {
          DEFAULT: '#97A8BB',
          700: '#6E8199',
          500: '#97A8BB',
          100: '#EBEEEF',
        },

        /**
         * Error, and only error.
         *
         * Burgundy is load-bearing here: it marks validation failures, destructive
         * buttons and sign-out. It stays red because a navy "delete" button is a
         * button people click by accident. Never use it decoratively.
         */
        burgundy: {
          DEFAULT: '#A00C30', // 8.11:1 on white
          700: '#850A28',
          100: '#F5E5EA',
        },

        /* --------------------------------------------------------- Surface */
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#F4F8FD', // The page ground is pale blue, not grey
          elevated: '#FFFFFF',
          tint: '#EBEEEF',
          dark: '#0A2A5E', // Sidebar and any inverted panel
        },

        /* ------------------------------------------------------------ Gray */
        gray: {
          50: '#FAFAFA',
          100: '#EBEEEF',
          200: '#E5E5E5',
          300: '#D6D6D6',
          500: '#787878',
          700: '#505050',
          900: '#000000',
        },

        /* --------------------------------------------------------- Status */
        // Derived from the brand hues rather than borrowed from a generic palette,
        // so a validation error and a burgundy heading belong to the same system.
        success: { DEFAULT: '#1B7F4B', 100: '#E6F4EC' },
        warning: { DEFAULT: '#D9790F', 100: '#FDF3E4' },
        danger: { DEFAULT: '#A00C30', 100: '#F5E5EA' },
      },

      fontFamily: {
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },

      /**
       * Weight 400 carries the scale, 500 marks things you click or that label
       * something — the same rule the landing page runs on.
       *
       * The one deviation: h3 and h4 sit at 500 rather than 400. They are table and
       * card headers in an admin tool, scanned rather than read, and at 24/20px a
       * 400 header stops separating itself from the row beneath it.
       */
      fontSize: {
        'display-xl': ['64px', { lineHeight: '1.2', fontWeight: '400' }],
        display: ['52px', { lineHeight: '1.2', fontWeight: '400' }],
        h1: ['40px', { lineHeight: '1.2', fontWeight: '400' }],
        h2: ['32px', { lineHeight: '1.3', fontWeight: '400' }],
        h3: ['24px', { lineHeight: '1.4', fontWeight: '500' }],
        h4: ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        caption: ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        label: ['12px', { lineHeight: '1.5', letterSpacing: '0.1em', fontWeight: '500' }],
      },

      // 8pt system. Tailwind's defaults are already 4px-based; these fill the gaps
      // the layout actually uses.
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        nav: '72px',
      },

      maxWidth: {
        container: '1280px',
      },

      borderRadius: {
        card: '16px',
        field: '8px',
        btn: '8px',
      },

      // Definition normally comes from a border. A shadow means the surface really
      // does float — a dropdown, a modal, a card being dragged.
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08)',
        dropdown: '0 4px 12px rgba(0, 0, 0, 0.12)',
        modal: '0 8px 24px rgba(0, 0, 0, 0.16)',
        focus: '0 0 0 3px rgba(15, 60, 142, 0.18)',
      },

      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
