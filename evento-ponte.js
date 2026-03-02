/**
 * Classe agnóstica baseada em eventos para a integração entre jogos.
 * https://refactoring.guru/pt-br/design-patterns/observer
 * https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/Events
 */
class Evento {
    constructor() {
        this.eventos = {};
    }

    /**
     * Se inscreve em um evento.
     * @param {string} nomeEvento - Nome do evento (ex: 'FIM_DE_JOGO')
     * @param {function} chamada - Função a ser executada quando o evento ocorrer
    */
    quando(nomeEvento, chamada) {
        if (!this.eventos[nomeEvento]) {
            this.eventos[nomeEvento] = [];
        }
        this.eventos[nomeEvento].push(chamada);
    }

    /**
     * Dispara um evento para todos os inscritos.
     * @param {string} nomeEvento - Nome do evento
     * @param {any} dados - Dados passados para o evento
     */
    emitir(nomeEvento, dados) {
        const chamadasEvento = this.eventos[nomeEvento];
        if (chamadasEvento) {
            [...chamadasEvento].forEach(chamada => chamada(dados));
        }
    }

    /**
     * Remove uma função específica da lista de ouvintes de um evento.
     * @param {string} nomeEvento 
     * @param {function} chamada 
     */
    remover(nomeEvento, chamada) {
        if (!this.eventos[nomeEvento]) return;

        this.eventos[nomeEvento] = this.eventos[nomeEvento].filter(
            chamadaExistente => chamadaExistente !== chamada
        );
    }

    /**
     * Limpa todos os ouvintes de um evento
     */
    limpar(nomeEvento) {
        delete this.eventos[nomeEvento];
    }



    /**
     * Executa a função de chamada apenas na primeira vez que o evento ocorrer.
     * Após a execução, o ouvinte é automaticamente removido.
     * @param {string} nomeEvento - Nome do evento (ex: 'PRIMEIRO_TOQUE')
     * @param {function} chamada - Função a ser executada uma única vez
     */
    ouvirUnicaVez(nomeEvento, chamada) {
        const ouvinteTemporario = (dados) => {
            chamada(dados);
            this.remover(nomeEvento, ouvinteTemporario);
        };

        this.quando(nomeEvento, ouvinteTemporario);
    }
}

if (!window.ponte) {
    const ponte = new Evento();
    window.ponte = ponte;
    Object.freeze(window.ponte);
}