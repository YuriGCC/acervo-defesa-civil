/**
 * Esta é a base de jogos do acervo. 
 * Para adicionar um jogo novo, basta inserir um novo objeto no array abaixo.
 * 
 * * -------------------------------------------------------------------------
 * @id      [String]  Identificador único interno. Use letras minúsculas e hífens.
 * Importante: Deve ser o mesmo nome do arquivo de imagem (sem a extensão)
 * para que o sistema de carregamento automático funcione.
 * * @nome    [String]  Título que aparecerá escrito no botão para entrar no jogo.
 * * @caminho [String]  O endereço do arquivo 'index.html' do jogo.
 * O caminho deve ser relativo à raiz do projeto.
 * * @cor     [Hex]     Cor de fundo do card no padrão Phaser (0x + código Hex).
 * Exemplos: Verde (0x27ae60), Laranja (0xe67e22), Azul (0x2980b9).
 * * @icone   [String]  Caminho da imagem que ilustra o jogo.
 * 
 * -------------------------------------------------------------------------
 */

const LISTA_JOGOS = [
    {
        id: 'quiz',
        nome: 'Quiz',
        caminho: 'jogos/quiz/index.html',
        cor: 0x27ae60,
        icone: 'assets/icone-quiz.png'
    },
    {
        id: 'caminhada-prevencao',
        nome: 'Caminhada da Prevenção',
        caminho: 'jogos/caminhada-prevencao/index.html',
        cor: 0xe67e22,
        icone: 'assets/icone-caminhada.png'
    }
];

Object.freeze(LISTA_JOGOS);