/**
 * Esta é a base de jogos do acervo. 
 * Para adicionar um jogo novo, basta inserir um novo objeto no array abaixo.
 * 
 * * -------------------------------------------------------------------------
 * @id      [String]  Identificador único interno. Use letras minúsculas e hífens.
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
    },
    {
        id: 'jogo-associacao-defesa-civil',
        nome: 'Jogo de associação',
        caminho: 'jogos/jogo-associacao-defesa-civil/index.html',
        cor: 0x4facfe,
        icone: 'assets/icone-jogo-associacao.png'
    },
    {
        id: 'arrasta-solta',
        nome: 'Arrasta Solta',
        caminho: 'jogos/arrasta-solta/index.html',
        cor: 0x3498db,
        icone: 'assets/icone-arrasta-solta.png'
    },
    {
        id: 'jogo-memoria',
        nome: 'Jogo da Memória',
        caminho: 'jogos/jogo-memoria/index.html',
        cor: 0x9b59b6,
        icone: 'assets/icone-jogo-memoria.png'
    },
    {
        id: 'pe-de-vento',
        nome: 'Pé de Vento',
        caminho: 'jogos/pe-de-vento/index.html',
        cor: 0xe67e22,
        icone: 'assets/icone-pe-de-vento.png'
    },
    {
        id: 'separar-lixo',
        nome: 'Separar Lixo',
        caminho: 'jogos/separar-lixo/index.html',
        cor: 0x27ae60,
        icone: 'assets/icone-separar-lixo.png'
    }
];

Object.freeze(LISTA_JOGOS);