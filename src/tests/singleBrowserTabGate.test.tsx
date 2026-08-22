// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SingleBrowserTabGate } from "../components/SingleBrowserTabGate";

const LEASE_KEY = "precocerto:active-browser-tab:v1";

describe("controle de aba única", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.useFakeTimers();
    vi.stubGlobal("BroadcastChannel", undefined);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("libera a primeira aba do navegador", () => {
    render(<SingleBrowserTabGate><p>Aplicação ativa</p></SingleBrowserTabGate>);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByText("Aplicação ativa")).toBeTruthy();
  });

  it("bloqueia uma aba adicional e permite transferir o controle", () => {
    window.localStorage.setItem(LEASE_KEY, JSON.stringify({ tabId: "outra-aba", expiresAt: Date.now() + 7000 }));
    render(<SingleBrowserTabGate><p>Aplicação ativa</p></SingleBrowserTabGate>);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByRole("heading", { name: "Use uma aba por vez" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Usar o PreçoCerto nesta aba" }));
    expect(screen.getByText("Aplicação ativa")).toBeTruthy();
  });
});
