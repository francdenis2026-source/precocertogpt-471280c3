// As animações decorativas foram desativadas para reduzir JavaScript, trabalho
// de composição e custo de rolagem. A API mínima mantém as telas estáveis
// enquanto os blocos antigos de animação são removidos gradualmente.
export const ScrollTrigger = {};

export const gsap = {
  registerPlugin: (...plugins: unknown[]) => { void plugins; },
  from: (...args: unknown[]) => { void args; },
  utils: {
    toArray: <T extends Element>(selector: string | string[]): T[] => {
      void selector;
      return [];
    },
  },
};

export function useGSAP(
  effect: () => void,
  options?: { scope?: unknown; dependencies?: unknown[] },
) {
  void effect;
  void options;
  // Intencionalmente vazio: conteúdo aparece imediatamente, sem efeitos de
  // entrada ou observadores de rolagem.
}
