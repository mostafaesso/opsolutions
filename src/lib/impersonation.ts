const KEY = "ops-impersonate";

export type ImpersonateRole = "admin" | "manager" | "employee";

export interface ImpersonationState {
  companySlug: string;
  companyName: string;
  role: ImpersonateRole;
}

export const startImpersonation = (state: ImpersonationState) => {
  sessionStorage.setItem(KEY, JSON.stringify(state));
};

export const getImpersonation = (): ImpersonationState | null => {
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as ImpersonationState) : null;
};

export const clearImpersonation = () => {
  sessionStorage.removeItem(KEY);
};
