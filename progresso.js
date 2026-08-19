/**
 * @file progresso.js
 * @description Acompanha quais jogos já foram concluídos nesta tela/dispositivo,
 * usando localStorage. Como o acervo roda numa TV/tablet compartilhado por várias
 * crianças, o progresso é intencionalmente simples (sem login) e pode ser resetado
 * manualmente pelo botão no menu.
 */

const PROGRESSO_STORAGE_KEY = 'acervo_progresso_jogos';

/**
 * @returns {string[]} lista de ids de jogos já concluídos
 */
function obterProgresso() {
    try {
        const bruto = localStorage.getItem(PROGRESSO_STORAGE_KEY);
        const lista = bruto ? JSON.parse(bruto) : [];
        return Array.isArray(lista) ? lista : [];
    } catch (e) {
        return [];
    }
}

/**
 * Marca um jogo como concluído (idempotente: repetir não tem efeito colateral).
 * @param {string} id
 */
function marcarJogoConcluido(id) {
    if (!id) return;
    const progresso = obterProgresso();
    if (!progresso.includes(id)) {
        progresso.push(id);
        try {
            localStorage.setItem(PROGRESSO_STORAGE_KEY, JSON.stringify(progresso));
        } catch (e) {
            // Armazenamento indisponível (modo privado, etc.) — segue sem persistir.
        }
    }
}

/**
 * @returns {boolean} true se todos os jogos de LISTA_JOGOS já foram concluídos
 */
function progressoCompleto() {
    const progresso = obterProgresso();
    return typeof LISTA_JOGOS !== 'undefined' &&
        LISTA_JOGOS.length > 0 &&
        LISTA_JOGOS.every(jogo => progresso.includes(jogo.id));
}

/**
 * Apaga todo o progresso salvo (usado no botão de reset e no certificado).
 */
function resetarProgresso() {
    try {
        localStorage.removeItem(PROGRESSO_STORAGE_KEY);
    } catch (e) {
        // Nada a fazer se o armazenamento não estiver disponível.
    }
}
