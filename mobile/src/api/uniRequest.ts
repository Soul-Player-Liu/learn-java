import type { RequestOptions, TaskApiRequest } from "@learn-java/task-api";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const queryText = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

  return `${apiBaseUrl}${path}${queryText ? `?${queryText}` : ""}`;
}

export const uniRequest: TaskApiRequest = async <T>({
  method = "GET",
  path,
  query,
  body,
}: RequestOptions) => {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: buildUrl(path, query),
      method: method as UniNamespace.RequestOptions["method"],
      data: body as UniNamespace.RequestOptions["data"],
      header:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      success: (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        resolve(response.data as T);
      },
      fail: (error) => {
        reject(new Error(error.errMsg || "移动端请求失败"));
      },
    });
  });
};
