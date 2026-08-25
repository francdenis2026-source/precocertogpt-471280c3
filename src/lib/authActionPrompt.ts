export type AuthActionKind = "favorite" | "basket";

export type AuthActionPromptDetail = {
  action: AuthActionKind;
  returnTo?: string;
};

export function requestAuthAction(action: AuthActionKind, returnTo?: string) {
  window.dispatchEvent(new CustomEvent<AuthActionPromptDetail>("pc:auth-action-required", {
    detail: { action, returnTo: returnTo || `${window.location.pathname}${window.location.search}` },
  }));
}
