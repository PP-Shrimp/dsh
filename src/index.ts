import z from '@deepseek-ai/schemastery'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'

export const name = 'dsh-aurora-theme-plugin'

export const Config = z.object({
  accentColor: z
    .string()
    .pattern(/^#[0-9a-fA-F]{6}$/)
    .default('#5966e9')
    .volatile(),
})

export function apply(ctx: Context) {
  ctx.inject(['settings'], (child) => {
    child.effect(
      () => child.settings.configure({ auto: false }, ctx.fiber),
      'dsh-aurora-theme-plugin: settings form',
    )
  })
}
