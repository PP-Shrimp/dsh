import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const packageId = 'dsh-aurora-theme-plugin'
const root = process.cwd()
const outputPath = join(root, 'lib/client.js')
const compiled = await readFile(outputPath, 'utf8')
const body = compiled
  .replace(/^export const inject =/m, 'const inject =')
  .replace(/^export function apply/m, 'function apply')

if (body.includes('export ')) {
  throw new Error('client output still contains an ESM export')
}

const factoryBody = `${body}\nexports.inject = inject;\nexports.apply = apply;`
  .split('\n')
  .map((line) => `    ${line}`)
  .join('\n')

const output = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(packageId)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
${factoryBody}
    return module.exports;
  }
});
`

await writeFile(outputPath, output)
