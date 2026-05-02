import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import process from 'node:process'

import mysql from 'mysql2/promise'

const env = process.env
const databaseName =
  env.TEST_MYSQL_DATABASE ?? `learn_java_e2e_${randomUUID().replaceAll('-', '').slice(0, 12)}`
const host = env.TEST_MYSQL_HOST ?? env.MYSQL_HOST ?? 'localhost'
const port = Number(env.TEST_MYSQL_PORT ?? env.MYSQL_PORT ?? '3306')
const adminUsername = env.TEST_MYSQL_ADMIN_USERNAME ?? 'root'
const adminPassword = env.TEST_MYSQL_ADMIN_PASSWORD ?? env.MYSQL_ROOT_PASSWORD ?? 'root123456'
const appUsername = env.TEST_MYSQL_APP_USERNAME ?? env.MYSQL_USER ?? 'learn'
const appPassword = env.TEST_MYSQL_APP_PASSWORD ?? env.MYSQL_PASSWORD ?? 'learn123456'

if (!/^learn_java_e2e_[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error(`Refusing to create or drop non-temporary E2E database: ${databaseName}`)
}

function quoteIdentifier(identifier) {
  return `\`${identifier.replaceAll('`', '``')}\``
}

function quoteString(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
}

async function withAdminConnection(callback) {
  const connection = await mysql.createConnection({
    host,
    port,
    user: adminUsername,
    password: adminPassword,
    multipleStatements: true,
  })
  try {
    return await callback(connection)
  } finally {
    await connection.end()
  }
}

async function createDatabase() {
  await withAdminConnection(async (connection) => {
    await connection.query(
      [
        `CREATE DATABASE ${quoteIdentifier(databaseName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
        `GRANT ALL PRIVILEGES ON ${quoteIdentifier(databaseName)}.* TO ${quoteString(appUsername)}@'%'`,
      ].join('; '),
    )
  })
}

async function dropDatabase() {
  await withAdminConnection(async (connection) => {
    await connection.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)}`)
  })
}

function runPlaywright() {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['playwright', 'test', ...process.argv.slice(2)], {
      stdio: 'inherit',
      env: {
        ...env,
        MYSQL_HOST: host,
        MYSQL_PORT: String(port),
        MYSQL_DATABASE: databaseName,
        MYSQL_USER: appUsername,
        MYSQL_PASSWORD: appPassword,
      },
    })

    const forwardSignal = (signal) => {
      child.kill(signal)
    }
    process.once('SIGINT', forwardSignal)
    process.once('SIGTERM', forwardSignal)

    child.on('error', reject)
    child.on('exit', (code, signal) => {
      process.removeListener('SIGINT', forwardSignal)
      process.removeListener('SIGTERM', forwardSignal)
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`Playwright exited with ${signal ?? code}`))
    })
  })
}

try {
  console.log(`Creating temporary E2E database ${databaseName} on ${host}:${port}`)
  await createDatabase()
  await runPlaywright()
} finally {
  console.log(`Dropping temporary E2E database ${databaseName}`)
  await dropDatabase().catch((error) => {
    console.error(`Failed to drop temporary E2E database ${databaseName}:`, error)
  })
}
