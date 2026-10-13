import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-current-time-plugin'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(
    defineTool({
      name: 'current_time',
      description:
        'Get the current date and time. Optionally provide an IANA time zone such as Asia/Shanghai or America/Los_Angeles.',
      parameters: {
        timeZone: {
          type: 'string',
          description:
            'Optional IANA time zone. Defaults to the local time zone of the dsh process.',
        },
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            iso: {
              type: 'string',
              required: true,
              description: 'The current instant in ISO 8601 UTC format.',
            },
            unixMilliseconds: {
              type: 'number',
              required: true,
              description: 'Milliseconds since the Unix epoch.',
            },
            timeZone: {
              type: 'string',
              required: true,
              description: 'The IANA time zone used for localTime.',
            },
            localTime: {
              type: 'string',
              required: true,
              description: 'The current date and time formatted for timeZone.',
            },
          },
          additionalProperties: false,
        },
        render: (_args, value) => [
          {
            type: 'text',
            text: `${value.localTime} (${value.timeZone})\nISO 8601: ${value.iso}`,
          },
        ],
      },
      async execute(args) {
        const now = new Date()
        const timeZone =
          args.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone

        // Constructing the formatter validates the requested IANA time zone.
        const formatter = new Intl.DateTimeFormat('zh-CN', {
          dateStyle: 'full',
          timeStyle: 'long',
          timeZone,
        })

        return {
          iso: now.toISOString(),
          unixMilliseconds: now.getTime(),
          timeZone,
          localTime: formatter.format(now),
        }
      },
    }),
  )
}
