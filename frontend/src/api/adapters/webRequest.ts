import type { RequestOptions, TaskApiRequest } from '@learn-java/task-api'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path, apiBaseUrl || window.location.origin)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return apiBaseUrl ? url.toString() : `${url.pathname}${url.search}`
}

export const webRequest: TaskApiRequest = async ({ method = 'GET', path, query, body }) => {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined
  }

  return response.json()
}
