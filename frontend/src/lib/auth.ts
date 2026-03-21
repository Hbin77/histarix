export interface User {
  id: number;
  name: string;
  email: string;
  xp?: number;
  level?: number;
  streak_days?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("histarix_token");
}

export function setToken(token: string): void {
  localStorage.setItem("histarix_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("histarix_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "회원가입에 실패했습니다" }));
    throw new Error(err.detail || "회원가입에 실패했습니다");
  }
  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "로그인에 실패했습니다" }));
    throw new Error(err.detail || "로그인에 실패했습니다");
  }
  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
}

export function logout(): void {
  removeToken();
  window.location.href = "/";
}
