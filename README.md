# Guia de Integração

## Registro do Jogo no projeto

Ao criar o jogo como um projeto independente,
adicione-o na pasta da raiz chamada jogos.

Em seguida adicione um objeto com os dados do seu jogo ao array LISTA_JOGOS localizado no arquivo config-jogos na raiz do projeto:

```
{
    id: 'id-unico-do-jogo',
    nome: 'Nome que aparecerá como legenda do jogo no botão do menu',
    caminho: 'jogos/sua-pasta/index.html', // Caminho até o index html do seu projeto
    cor: 0xXXXXXX, // Cor do botão no menu em Hexadecimal (ex: 0x27ae60)
    icone: 'assets/seu-icone.png' //  Caminho da imagem que ilustra o jogo
}
```


## Comunicação com o Menu

Como o jogo roda dentro de um Iframe, para avisar a página principal quando o jogador desejar sair ou quando o jogo terminar. Utilize a função abaixo no seu código:

```
function finalizarJogo() {
    if (window.parent && window.parent.ponte) {
        window.parent.ponte.emitir('VOLTAR_MENU');
    }
}
```

# Funcionamento

## Framework Base: Phaser 3.9
### Docs https://docs.phaser.io/api-documentation/api-documentation

## Estrutura de Pastas

```
|- assets/ - Ícones  jogos e do Menu
|
|jogos/ - Coloque seu projeto dentro desta pasta, o arquivo de entrada deve ser obrigatoriamente index.html
|
|config-jogos.js - Registro dos jogos
|evento-ponte.js - Gerenciador de eventos
|main.js - Script para manipulação do DOM para a integração
|menu.js - Cena principal que faz o intermédio entre os jogos e o script de integração

```


## Exemplos do uso de eventos

Este tópico mostra mais usos do gerenciador de eventos caso deseje interagir com outros jogos do acervo e não somente chamar-lo para voltar ao menu como mostrado no guia base.

## Envio de dados

Se o acervo for atualizado para exibir um ranking ou estatísticas globais, você pode enviar dados ao final da partida para o estado 
global do jogo e assim ser adicionado a este ranking.


```
function enviarResultado(pontos, tempoGasto) {
    if (window.parent && window.parent.ponte) {
        window.parent.ponte.emitir('DADOS_RESULTADO', {
            pontuacao: pontos,
            duracao: tempoGasto,
            timestamp: new Date().getTime()
        });
    }
}
```

### Interação entre jogos

Embora os jogos rodem em Iframes separados, eles podem interagir de forma indireta através do Menu. Um jogo pode emitir um sinal que será "lembrado" pelo sistema para afetar a experiência em outro jogo.

### Cenário de Interação: Sistema de "Desafio Cruzado"

Neste cenário, o jogo de Quiz envia um bônus para a Caminhada da Prevenção quando o jogador atinge uma pontuação alta.

#### No Quiz ( O Emissor )

Ao finalizar com sucesso, o jogo envia um aviso sobre o bonus para o gerenciador de eventos

```
function ganharBonus() {

    // Método EMITIR: Envia o bônus para a ponte global
    window.parent.ponte.emitir('BONUS_RECOMPENSA', { 
        tipo: 'Escudo', 
        origem: 'Quiz' 
    });
}

```



### Na caminhada da prevenção  ( O Receptor )

Ao iniciar, o jogo consulta o gerenciador de eventos 

```
// No create() caso esteja usando Phaser
function inicializarComunicacao() {
    
    // Método ouvirUnicaVez: Escuta apenas o primeiro bônus para dar um "Boas-vindas"
    window.parent.ponte.ouvirUnicaVez('BONUS_RECOMPENSA', (dados) => {
        this.mostrarTutorial(`Você recebeu seu primeiro bônus de ${dados.origem}!`);
    });

    // Método quando escuta todos os bônus enviados durante a sessão
    window.parent.ponte.quando('BONUS_RECOMPENSA', (dados) => {
        this.adicionarItemAoInventario(dados.tipo);
        console.log(`Item ${dados.tipo} recebido via Ponte.`);
    });
}

// Método remover para não deixar o jogo escutando eventos após ser fechado
function aoSairDoJogo() {
    // Limpa o ouvinte para evitar que, ao abrir o jogo novamente, existam duplicatas
    window.parent.ponte.remover('BONUS_RECOMPENSA');
    
    // Finaliza voltando ao menu
    window.parent.ponte.emitir('VOLTAR_MENU');
}
```

# Nota Importante

Para que o método remover funcione, ele precisa receber a mesma função que foi registrada no quando. Se você usar uma função anônima diretamente dentro do quando, não conseguirá removê-la depois.

## Forma correta de declaração de função:

```
// 1. Defina a função fora do ouvinte
const tratarBonus = (dados) => {
    this.adicionarItemAoInventario(dados.tipo);
};

// 2. Registre usando a referência
window.parent.ponte.quando('BONUS_RECOMPENSA', tratarBonus);

// 3. Remova usando a mesma referência
function aoSairDoJogo() {
    window.parent.ponte.remover('BONUS_RECOMPENSA', tratarBonus);
    window.parent.ponte.emitir('VOLTAR_MENU');
}
```

Se você registrar a função diretamente dentro do ouvinte (como uma função anônima ou arrow function no argumento), o JavaScript criará uma nova referência na memória para aquele bloco de código. Como o método remover busca exatamente o mesmo endereço de memória para deletar o registro, ele não encontrará uma correspondência, deixando o evento como uma memória sem uso no sistema. Isso pode causar uma bola de neve que pode travar todo o projeto e bugs imprevisíveis por abrir e fechar novas cópias da mesma função rodando em segundo plano.

### Se quiser saber mais: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Memory_Management