/**
 * @file acessibilidade.js
 * @description Utilitários de acessibilidade compartilhados entre os minijogos do acervo.
 * Cada jogo roda em seu próprio documento (iframe), então o anunciador é sempre local
 * ao documento do jogo — não depende de window.parent nem de scripts do menu.
 */

/**
 * Cria (ou reaproveita) uma região aria-live oculta no documento atual e devolve
 * uma função para enviar mensagens a leitores de tela.
 * @returns {(mensagem: string) => void} falar
 */
function criarAnunciador() {
    let el = document.getElementById('aria-announcer-jogo');
    if (!el) {
        el = document.createElement('div');
        el.id = 'aria-announcer-jogo';
        el.setAttribute('aria-live', 'assertive');
        el.setAttribute('aria-atomic', 'true');
        el.style.position = 'absolute';
        el.style.width = '1px';
        el.style.height = '1px';
        el.style.padding = '0';
        el.style.margin = '-1px';
        el.style.overflow = 'hidden';
        el.style.clip = 'rect(0, 0, 0, 0)';
        el.style.whiteSpace = 'nowrap';
        el.style.border = '0';
        document.body.appendChild(el);
    }

    return function falar(mensagem) {
        el.textContent = '';
        requestAnimationFrame(() => { el.textContent = mensagem; });
    };
}

/**
 * @returns {boolean} true se o usuário pediu para reduzir animações no sistema.
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
