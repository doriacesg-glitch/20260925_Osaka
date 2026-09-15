/** @type {import('tailwindcss').Config} */
// 設計系統來源:ui-ux-pro-max --design-system "personal travel journal keepsake"
// Soft UI Evolution × 溫暖日記棕 + 手寫字體
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Journal 棕色系(主色)
        primary: {
          DEFAULT: '#92400E',   // 溫暖日記棕
          light: '#B45309',
          soft: '#FED7AA',
        },
        // Accent 紫(CTA、亮點)
        accent: {
          DEFAULT: '#6366F1',   // Ink violet
          soft: '#E0E7FF',
        },
        // 背景
        paper: '#FFFBEB',        // 主背景 — 溫暖米黃
        paper2: '#F8F3F0',       // 次背景 — 略深的米色卡片
        // 文字
        ink: {
          DEFAULT: '#0F172A',    // 主文字
          soft: '#475569',       // 次文字
          faint: '#94A3B8',      // 弱化提示
        },
        // 邊框
        edge: '#F1E8E2',
        // 保留給拍立得/和紙裝飾
        washi: {
          pink: '#FBCFE8',
          blue: '#BFDBFE',
          yellow: '#FEF3C7',
          green: '#D9F99D',
        },
        // 保留 sage 供漸進式移除(先不 break 舊碼)
        sage: {
          DEFAULT: '#92400E',    // 對映到 primary
          deep: '#78350F',
        },
      },
      fontFamily: {
        // 手寫感標題 — 日記/收藏本
        hand: ['Caveat', '"Klee One"', 'cursive'],
        // 圓潤內文
        sans: ['Quicksand', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
        // 保留給時間、code
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // Soft UI Evolution 的陰影 — 比 flat 溫一點,比 neumorphism 明確一點
        soft: '0 2px 8px -2px rgba(146, 64, 14, 0.08), 0 1px 3px -1px rgba(146, 64, 14, 0.06)',
        lift: '0 8px 24px -8px rgba(146, 64, 14, 0.15), 0 2px 6px -2px rgba(146, 64, 14, 0.08)',
        paper: '0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
