const endpoint = () => process.env.SUPABASE_URL?.replace(/\/$/, "");
export const databaseEnabled = () => !!process.env.SUPABASE_URL;
const secret = () => process.env.SUPABASE_SERVICE_ROLE_KEY;
export const databaseReady = () => !!(endpoint() && secret());

export function requestError(status, message) {
  return Object.assign(new Error(message), { status });
}

export async function databaseRequest(path, { method = "GET", body, prefer } = {}) {
  if (!databaseReady()) throw requestError(503, "The database is not configured.");
  const key = secret();
  return fetch(endpoint() + "/rest/v1/" + path, {
    method,
    redirect: "manual",
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
}

export async function rows(path, options) {
  const response = await databaseRequest(path, options);
  if (!response.ok) throw requestError(503, "The database request failed.");
  return response.status === 204 ? [] : response.json();
}

export async function authRequest(path, { method = "GET", token, body } = {}) {
  const key = process.env.SUPABASE_ANON_KEY;
  if (!endpoint() || !key) throw requestError(503, "Administrator sign-in is not configured.");
  return fetch(endpoint() + "/auth/v1/" + path, {
    method,
    redirect: "manual",
    headers: { apikey: key, "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
}

export async function administrator(token) {
  if (!token || !/^[A-Za-z0-9_.-]+$/.test(token)) return null;
  const response = await authRequest("user", { token });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw requestError(503, "Administrator verification is unavailable.");
  const { id, email } = await response.json();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [record] = await rows("mystic_admins?select=role&user_id=eq." + id);
  return ["super_admin","content_admin"].includes(record?.role) ? {id, email, role:record.role} : null;
}

export async function audit(actor, action, target) {
  await rows("mystic_activity", { method:"POST", body:{ actor, action, target } });
}
