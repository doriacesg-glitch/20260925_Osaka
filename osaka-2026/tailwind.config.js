/** @type {import('tailwindcss').Config} */
// 大阪 2026 · 萬聖節水彩風
// 靈感:紫色夜空 + 南瓜燈暖光 + 燭火 + 蜘蛛絲
// 參考:Pikmin Bloom Halloween、環球影城 Hami Kuma
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色 — 南瓜燈暖橙(標題、CTA)
        primary: {
          DEFAULT: '#E76D3C',  // 南瓜橙
          light: '#F09550',
          soft: '#FED7AA',
          dark: '#B84A20',
        },
        // 副色 — 紫色夜幕
        accent: {
          DEFAULT: '#6B4E96',  // 巫師袍紫
          soft: '#D6C7EA',
          dark: '#3D2E5C',
        },
        // 背景
        paper: '#FFF5E1',       // 米黃燭光
        paper2: '#F8E8CB',      // 略深南瓜色紙
        night: '#2A1F3D',       // 深夜背景(hero/漸層用)
        // 文字
        ink: {
          DEFAULT: '#2A1F3D',   // 紫黑主文字
          soft: '#6B4E96',      // 副文字(紫)
          faint: '#A89BC0',     // 弱化提示
        },
        edge: '#EEDCC0',        // 邊框(暖色系)
        // 燭火 / 暖光點綴
        candle: {
          DEFAULT: '#F4C066',
          soft: '#FDE4B0',
          glow: '#FFB84D',
        },
        // 萬聖節點綴色
        halloween: {
          pumpkin: '#E76D3C',
          ghost: '#F0E9DB',
          spider: '#1F1729',
          witch: '#6B4E96',
          slime: '#7DB88A',    // 綠色史萊姆
          candy: '#E85E9F',    // 糖果粉
        },
        // 保留 sage 供漸進遷移
        sage: {
          DEFAULT: '#7DB88A',
          deep: '#5A9668',
        },
        // 保留 washi
        washi: {
          pink: '#F5C8D5',
          blue: '#B8CBE0',
          yellow: '#F4C066',
          green: '#B8D9BA',
        },
      },
      fontFamily: {
        // 手寫感標題(旅遊小書、記事本)
        hand: ['"Caveat"', '"Klee One"', 'cursive'],
        // 圓潤可愛內文(適合萬聖節俏皮感)
        sans: ['"Nunito"', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
        // 標題另一選項(cute)
        display: ['"Nunito"', '"Klee One"', '"Noto Sans TC"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(107, 78, 150, 0.12), 0 1px 3px -1px rgba(107, 78, 150, 0.08)',
        lift: '0 8px 24px -8px rgba(107, 78, 150, 0.25), 0 2px 6px -2px rgba(107, 78, 150, 0.12)',
        glow: '0 0 20px -4px rgba(244, 192, 102, 0.5), 0 0 40px -8px rgba(231, 109, 60, 0.3)',
        pumpkin: '0 4px 12px -4px rgba(231, 109, 60, 0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
        blob: '30% 70% 70% 30% / 30% 30% 70% 70%',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-4px) rotate(2deg)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.85, filter: 'brightness(1.15)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        bob: 'bob 3s ease-in-out infinite',
        flicker: 'flicker 2.5s ease-in-out infinite',
        wobble: 'wobble 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
