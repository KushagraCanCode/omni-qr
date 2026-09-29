/**
 * OMNIQR — Curated Palettes, Preset Icons & Templates
 */

export const PALETTES = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    colorDark: '#8b5cf6',
    colorLight: '#07090e',
    isGradient: true,
    gradientType: 'linear',
    gradientColor2: '#06b6d4',
    gradientRotation: 45
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    colorDark: '#38bdf8',
    colorLight: '#0b132b',
    isGradient: true,
    gradientType: 'linear',
    gradientColor2: '#6366f1',
    gradientRotation: 135
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Luxe',
    colorDark: '#10b981',
    colorLight: '#022c22',
    isGradient: true,
    gradientType: 'linear',
    gradientColor2: '#34d399',
    gradientRotation: 90
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Coral',
    colorDark: '#f59e0b',
    colorLight: '#18181b',
    isGradient: true,
    gradientType: 'linear',
    gradientColor2: '#ef4444',
    gradientRotation: 45
  },
  {
    id: 'obsidian-gold',
    name: 'Royal Gold',
    colorDark: '#fbbf24',
    colorLight: '#000000',
    isGradient: true,
    gradientType: 'radial',
    gradientColor2: '#d97706',
    gradientRotation: 0
  },
  {
    id: 'clean-mono',
    name: 'Clean Monochrome',
    colorDark: '#0f172a',
    colorLight: '#ffffff',
    isGradient: false,
    gradientType: 'linear',
    gradientColor2: '#0f172a',
    gradientRotation: 0
  },
  {
    id: 'dark-matrix',
    name: 'Matrix Dark',
    colorDark: '#22c55e',
    colorLight: '#050d08',
    isGradient: true,
    gradientType: 'linear',
    gradientColor2: '#4ade80',
    gradientRotation: 180
  }
];

export const PRESET_ICONS = {
  wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
  upi: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"></path><path d="M6 8h12"></path><path d="m6 13 8.5 8"></path><path d="M6 13h3a4 4 0 0 0 0-8"></path></svg>`,
  bitcoin: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c3.5-.7 2.766-5.833-1.077-5.156m-1.077 5.156-5.908-1.042m6.985 6.198-2.155-12.222m-2.738.483.347-1.97m.76 4.316-2.155 12.222"></path></svg>`,
  ethereum: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2-7.5 12.5L12 18l7.5-3.5L12 2z"></path><path d="m4.5 14.5 7.5 7.5 7.5-7.5L12 18l-7.5-3.5z"></path></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
};

/** Convert SVG string into Base64 Data URL */
export function svgToDataUrl(svgString) {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
