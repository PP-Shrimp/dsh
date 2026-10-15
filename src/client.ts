import type { Context } from '@deepseek-ai/cordis'
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'

declare const require: (id: string) => unknown

const { createElement } = require('react') as {
  createElement: (
    type: unknown,
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ) => any
}
const { Input } = require('@deepseek-ai/dsh-client-ui-primitives') as {
  Input: (props: Record<string, unknown>) => any
}
const { defineStore } = require('@deepseek-ai/dsh-client-store') as {
  defineStore: (spec: Record<string, unknown>) => any
}

export const inject = ['theme', 'slots', 'locale', 'configForms']

const SETTINGS_ID = 'dsh-aurora-theme-plugin'
const STATIC_THEME_SOURCE = 'dsh-aurora-theme-plugin:aurora'
const USER_COLOR_SOURCE = 'dsh-aurora-theme-plugin:user-color'
const DEFAULT_ACCENT = '#5966e9'

const AURORA_TOKENS: ThemeTokenOverrides = {
  '--dsw-alias-bg-base': { light: '#f6f8ff', dark: '#0b1020' },
  '--dsw-alias-bg-layer-1': { light: '#ffffff', dark: '#11182c' },
  '--dsw-alias-bg-layer-2': { light: '#eef2ff', dark: '#17213a' },
  '--dsw-alias-bg-layer-3': { light: '#e4eaff', dark: '#202d4c' },
  '--dsw-alias-bg-overlay': { light: 'rgba(29, 42, 84, 0.14)', dark: 'rgba(3, 7, 18, 0.64)' },
  '--dsw-alias-label-primary': { light: '#17213b', dark: '#f3f6ff' },
  '--dsw-alias-label-secondary': { light: '#52617e', dark: '#aeb9d3' },
  '--dsw-alias-label-tertiary': { light: '#7f8ca8', dark: '#7f8eae' },
  '--dsw-alias-label-dimmed': { light: '#9ca8bf', dark: '#657393' },
  '--dsw-alias-border-l1': { light: '#d9e0f1', dark: '#2b3858' },
  '--dsw-alias-border-l2': { light: '#e5e9f4', dark: '#202c48' },
  '--dsw-alias-border-l3': { light: '#c8d2e8', dark: '#3a4a70' },
  '--dsw-alias-brand-primary': { light: '#5966e9', dark: '#9da8ff' },
  '--dsw-alias-brand-primary-invert': { light: '#ffffff', dark: '#0b1020' },
  '--dsw-alias-brand-text': { light: '#4a57d2', dark: '#b9c1ff' },
  '--dsw-alias-button-primary-fill': { light: '#5966e9', dark: '#7e8cff' },
  '--dsw-alias-button-primary-hover': { light: '#4855d8', dark: '#94a0ff' },
  '--dsw-alias-button-primary-dimmed': { light: '#c7cdf8', dark: '#343f70' },
  '--dsw-alias-button-ghost-active-fill': { light: '#e3e7ff', dark: '#29365a' },
  '--dsw-alias-button-ghost-active-border': { light: '#b9c3f0', dark: '#46598a' },
  '--dsw-alias-interactive-bg-hover': { light: '#eef0ff', dark: '#1d2946' },
  '--dsw-alias-interactive-bg-active': { light: '#e2e7ff', dark: '#29365a' },
  '--dsw-alias-settings-card-fill': { light: '#ffffff', dark: '#121b31' },
  '--dsw-alias-settings-card-stroke': { light: '#dce3f2', dark: '#2a3858' },
  '--dsw-alias-scrollbar-bg-l1': { light: '#d5dcef', dark: '#253352' },
  '--dsw-alias-scrollbar-bg-l2': { light: '#e7ebf7', dark: '#18233d' },
  '--dsw-alias-scrollbar-hover-l1': { light: '#aab7d5', dark: '#53658f' },
  '--dsw-alias-scrollbar-hover-l2': { light: '#c1cbe1', dark: '#344467' },
  '--dsw-alias-tooltip-bg': { light: '#18233d', dark: '#e9edff' },
  '--dsw-alias-label-primary-foreground': { light: '#f4f6ff', dark: '#17213b' },
}

type RGB = { r: number; g: number; b: number }
type ColorState = { color: string; revision: number }
type AuroraConfig = { accentColor?: string }
type ColorActions = { sync: (color: string, revision: number) => void }

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.aurora': 'title' | 'description'
  }
}

const colorStore = defineStore({
  init: () => ({ color: DEFAULT_ACCENT, revision: -1 }),
  actions: {
    sync: (draft: ColorState, color: string, revision: number) => {
      draft.color = color
      draft.revision = revision
    },
  },
})

const isHexColor = (value: string): boolean => /^#[0-9a-fA-F]{6}$/.test(value)

function parseHex(value: string): RGB {
  return {
    r: Number.parseInt(value.slice(1, 3), 16),
    g: Number.parseInt(value.slice(3, 5), 16),
    b: Number.parseInt(value.slice(5, 7), 16),
  }
}

function toHex(value: number): string {
  return Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, '0')
}

function mix(first: string, second: string, amount: number): string {
  const a = parseHex(first)
  const b = parseHex(second)
  return `#${toHex(a.r + (b.r - a.r) * amount)}${toHex(a.g + (b.g - a.g) * amount)}${toHex(a.b + (b.b - a.b) * amount)}`
}

function luminance(color: string): number {
  const rgb = parseHex(color)
  const channel = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

function textOn(color: string): string {
  return luminance(color) > 0.45 ? '#17213b' : '#ffffff'
}

function colorTokens(accent: string): ThemeTokenOverrides {
  const lightFill = luminance(accent) > 0.45 ? mix(accent, '#000000', 0.36) : accent
  const darkFill = luminance(accent) < 0.12 ? mix(accent, '#ffffff', 0.38) : mix(accent, '#ffffff', 0.18)
  const lightHover = mix(lightFill, '#000000', 0.12)
  const darkHover = mix(darkFill, '#ffffff', 0.14)

  return {
    '--dsw-alias-brand-primary': { light: lightFill, dark: darkFill },
    '--dsw-alias-brand-primary-invert': { light: textOn(lightFill), dark: textOn(darkFill) },
    '--dsw-alias-brand-text': { light: lightFill, dark: darkFill },
    '--dsw-alias-button-primary-fill': { light: lightFill, dark: darkFill },
    '--dsw-alias-button-primary-hover': { light: lightHover, dark: darkHover },
    '--dsw-alias-button-primary-dimmed': {
      light: mix(lightFill, '#ffffff', 0.62),
      dark: mix(darkFill, '#000000', 0.55),
    },
    '--dsw-alias-button-ghost-active-fill': {
      light: mix(lightFill, '#ffffff', 0.84),
      dark: mix(darkFill, '#000000', 0.68),
    },
    '--dsw-alias-button-ghost-active-border': {
      light: mix(lightFill, '#ffffff', 0.54),
      dark: mix(darkFill, '#ffffff', 0.34),
    },
    '--dsw-alias-interactive-bg-hover': {
      light: mix(lightFill, '#ffffff', 0.9),
      dark: mix(darkFill, '#000000', 0.72),
    },
    '--dsw-alias-interactive-bg-active': {
      light: mix(lightFill, '#ffffff', 0.82),
      dark: mix(darkFill, '#000000', 0.62),
    },
  }
}

function AuroraColorRow({ useStore, setColor, t }: any): any {
  const color = useStore((state: ColorState) => state.color)
  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '14px 0',
        borderBottom: '0.5px solid var(--dsw-alias-border-l2)',
      },
    },
    createElement(
      'div',
      { style: { minWidth: 0 } },
      createElement(
        'div',
        {
          style: {
            color: 'var(--dsw-alias-label-primary)',
            fontSize: '14px',
            lineHeight: '22px',
          },
        },
        t('title'),
      ),
      createElement(
        'div',
        {
          style: {
            color: 'var(--dsw-alias-label-secondary)',
            fontSize: '12px',
            lineHeight: '18px',
          },
        },
        t('description'),
      ),
    ),
    createElement(Input, {
      type: 'color',
      value: color,
      title: color,
      'aria-label': t('title'),
      onChange: (event: { currentTarget: { value: string } }) => {
        setColor(event.currentTarget.value)
      },
      style: {
        width: '40px',
        height: '28px',
        padding: '2px',
        cursor: 'pointer',
      },
    }),
  )
}

export function apply(ctx: Context) {
  const form = ctx.configForms.get<AuroraConfig>(SETTINGS_ID)
  let colorActions: ColorActions | undefined
  let userColorDisposer: (() => void) | undefined

  ctx.effect(
    () => ctx.theme.overrideTokens(STATIC_THEME_SOURCE, AURORA_TOKENS),
    'dsh-aurora-theme-plugin: static theme',
  )

  ctx.effect(() => {
    const sync = () => {
      const snapshot = form.getSnapshot()
      const configured = snapshot.value?.accentColor
      const color = configured && isHexColor(configured) ? configured : DEFAULT_ACCENT
      colorActions?.sync(color, snapshot.revision ?? -1)
      userColorDisposer?.()
      userColorDisposer = ctx.theme.overrideTokens(USER_COLOR_SOURCE, colorTokens(color))
    }

    const unsubscribe = form.subscribe(sync)
    sync()
    return () => {
      unsubscribe()
      userColorDisposer?.()
      userColorDisposer = undefined
    }
  }, 'dsh-aurora-theme-plugin: color settings sync')

  ctx.effect(
    () =>
      ctx.locale.register('settings.aurora', {
        zh: {
          title: '主题颜色',
          description: '选择按钮和强调色使用的颜色',
        },
        en: {
          title: 'Theme color',
          description: 'Choose the button and accent color',
        },
      }),
    'dsh-aurora-theme-plugin: color setting labels',
  )

  ctx.slots.inject('settings.general.item', () =>
    ctx.slots.register(
      {
        name: 'settings.general.item',
        id: 'aurora-color',
        order: 12,
        locale: 'settings.aurora',
        store: colorStore,
        inject: (actions: any) => {
          colorActions = actions
          return {
            setColor: (value: string) => {
              if (isHexColor(value)) void form.set('accentColor', value)
            },
          }
        },
      },
      AuroraColorRow,
    ),
  )
}
