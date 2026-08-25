/**
 * @file certificado.js
 * @description Monta a marcação HTML do certificado de Agente Mirim.
 * Usado tanto pelo modal do kiosk (index.html/main.js) quanto pela página de
 * download em PDF (certificado.html), para os dois nunca ficarem diferentes.
 */

const MESES_CERTIFICADO = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

/**
 * Formata uma data como "24 de agosto de 2026".
 * @param {Date} data
 * @returns {string}
 */
function formatarDataCertificado(data) {
    return `${data.getDate()} de ${MESES_CERTIFICADO[data.getMonth()]} de ${data.getFullYear()}`;
}

/**
 * Escapa texto livre (nome digitado pela criança) antes de inserir como HTML.
 * @param {string} texto
 * @returns {string}
 */
function escaparHtmlCertificado(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Monta o HTML completo do "papel" do certificado (bordas, logos, texto, data).
 * @param {string} nome - Nome digitado pela criança.
 * @param {string} [dataTextoRecebido] - Data já formatada (ex: "24 de agosto de 2026"),
 *   como vem tanto do kiosk quanto da query string de certificado.html. Se vazio, usa hoje.
 * @returns {string}
 */
function montarCertificadoHTML(nome, dataTextoRecebido) {
    const nomeSeguro = escaparHtmlCertificado((nome || '').trim() || 'Agente Mirim');
    const dataTexto = dataTextoRecebido || formatarDataCertificado(new Date());

    return `
        <div class="certificado-canto tl"></div>
        <div class="certificado-canto tr"></div>
        <div class="certificado-canto bl"></div>
        <div class="certificado-canto br"></div>
        <div class="certificado-cabecalho">
            <div class="certificado-instituicao">
                <img src="assets/icone-uniasselvi.png" alt="" class="certificado-logo-uniasselvi">
                <div class="certificado-instituicao-texto">
                    <strong>UNIASSELVI</strong>
                    <span>Centro Universitário Leonardo da Vinci</span>
                </div>
            </div>
            <img src="assets/logo-defesa-civil.webp" alt="Defesa Civil de Blumenau" class="certificado-logo-defesacivil">
        </div>
        <p class="certificado-titulo-script">Certificado</p>
        <p class="certificado-texto">
            Certificamos que <strong>${nomeSeguro}</strong> concluiu com sucesso todos os
            desafios do Acervo de Jogos Educativos, promovido pelo Centro Universitário
            Leonardo da Vinci - UNIASSELVI em parceria com a Defesa Civil de Blumenau,
            tornando-se oficialmente um <strong>Agente Mirim da Prevenção</strong>.
        </p>
        <p class="certificado-data-local">Blumenau, ${dataTexto}</p>
    `;
}
