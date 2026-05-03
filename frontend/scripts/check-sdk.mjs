import { execFileSync } from 'node:child_process'

function gitDiffGenerated() {
  return execFileSync('git', ['diff', '--', '../packages/task-api/src/generated'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
}

const before = gitDiffGenerated()

execFileSync('npm', ['run', 'generate:sdk'], {
  cwd: process.cwd(),
  stdio: 'inherit',
})

const after = gitDiffGenerated()

if (before !== after) {
  console.error('Generated SDK is stale. Run `npm run generate:sdk` and include the updated files.')
  process.exit(1)
}
