const questao = document.getElementById('questao');
const alt1 = document.getElementById('a1');
const alt2 = document.getElementById('a2');
const alt3 = document.getElementById('a3');
const alt4 = document.getElementById('a4');
var pontos = 0;
respostaSelecionada = -1;
var cont = 0;


const perguntas = [
    {
        questao: "Durante um temporal, qual a melhor atitude?",
        alternativas: [{alternativa: "Ficar dentro de casa e longe de janelas.", correto: true}, {alternativa: "Abrigar-se debaixo de árvore.", correto: false}, {alternativa: "Sair para filmar a chuva.", correto: false}, {alternativa: "Aproveitar para tomar um banho de chuva.", correto: false}]

    },
    {   
        questao: "O que fazer caso não encontre uma lixeira, mas tenha uma embalagem de bala para jogar fora?",
        alternativas: [{alternativa: "Jogar no bueiro.", correto: false}, {alternativa: "Jogar na cabeça do amigo.", correto: false}, {alternativa: "Guardar até encontrar uma lixeira.", correto: true}, {alternativa: "Jogar no chão.", correto: false}]

    },
    {
        questao: "Qual dessas atitudes mostra autoproteção?",
        alternativas: [{alternativa: "Ignorar os alertas no celular.", correto: false}, {alternativa: "Ficar gravando vídeos do perigo.", correto: false}, {alternativa: "Chegar mais perto para ver melhor.", correto: false}, {alternativa: "Obedecer aos adultos e procurar um lugar seguro.", correto: true}]
    },
    {
        questao: "Assinale a alternativa INCORRETA para ajudar o meio ambiente e evitar problemas futuros.",
        alternativas: [{alternativa: "Economizar água.", correto: false}, {alternativa: "Jogar lixo no chão.", correto: true}, {alternativa: "Reciclar.", correto: false}, {alternativa: "Plantar árvores.", correto: false}]
    },
    {
        questao: "O que NÃO devemos fazer durante um deslizamento de terra?",
        alternativas: [{alternativa: "Ficar perto de encostas e morros.", correto: true}, {alternativa: "Seguir orientações de segurança.", correto: false}, {alternativa: "Procurar abrigo seguro", correto: false}, {alternativa: "Ajudar outras pessoas com cuidado", correto: false}]
    },
    {
        questao: "Como a tecnologia pode ajudar na prevenção de desastres?",
        alternativas: [{alternativa: "Ajudando a enviar alertas e ensinar como se proteger.", correto: true}, {alternativa: "Atrapalhando a comunicação.", correto: false}, {alternativa: "Apenas para jogos sem aprendizado.", correto: false}, {alternativa: "Para espalhar informações falsas.", correto: false}]
    },
    {
        questao: "Qual desses lugares é mais seguro em caso de desastre?",
        alternativas: [{alternativa: "Áreas alagadas", correto: false}, {alternativa: "Próximo a rios", correto: false}, {alternativa: "Encostas e morros", correto: false}, {alternativa: "Abrigos indicados pela Defesa Civil", correto: true}]
    },
    {
        questao: "O que devemos fazer ao ver lixo entupindo bueiros?",
        alternativas: [{alternativa: "Fingir que não viu", correto: false}, {alternativa: "Avisar um adulto ou órgão responsável", correto: true}, {alternativa: "Jogar mais lixo", correto: false}, {alternativa: "Brincar com a água", correto: false}]
    },
    {
        questao: "Por que aprender sobre desastres naturais desde criança é importante?",
        alternativas: [{alternativa: "Para saber como agir com segurança e ajudar outras pessoas.", correto: true}, {alternativa: "Para ter medo de tudo.", correto: false}, {alternativa: "Para decorar palavras difíceis.", correto: false}, {alternativa: "Para brincar em locais perigosos.", correto: false}]
    },
    {
        questao: "Qual dessas ações ajuda a fortalecer a cultura da prevenção?",
        alternativas: [{alternativa: "Compartilhar informações corretas sobre segurança.", correto: true}, {alternativa: "Espalhar boatos.", correto: false}, {alternativa: "Ignorar problemas ambientais.", correto: false}, {alternativa: "Não colaborar com ninguém.", correto: false}]
    }


];

window.onload = function(){

    document.getElementById('paiBotoes').style.display = 'flex';

    this.document.getElementById('recomecar').style.display = 'none'

    this.document.getElementById('finalizar').style.display = 'none';

    this.document.getElementById('amora1').style.display = 'none'

    this.document.getElementById('amora2').style.display = 'none'

    this.document.getElementById('amora3').style.display = 'none'

    document.getElementById("verificar").disabled = true;

    const enviar = document.getElementById('btn');

    enviar.style.display = 'none'

    questao.innerText = perguntas[cont].questao

    alt1.innerText = perguntas[cont].alternativas[0].alternativa;

    alt2.innerText = perguntas[cont].alternativas[1].alternativa;

    alt3.innerText = perguntas[cont].alternativas[2].alternativa;

    alt4.innerText = perguntas[cont].alternativas[3].alternativa;

    cont++;
}



function enviar(){
    var pos = 0;

    document.getElementById("verificar").disabled = true;

    const elementos = document.querySelectorAll('.botao');
    
    elementos.forEach(btn => btn.disabled = false);

    const botoes = document.querySelectorAll('.botao');
    
    botoes.forEach(btn => {btn.classList.remove("botaoCerto", "botaoErrado", "botaoSelecionado");  
    });

    if(cont >= perguntas.length){
        questao.style.fontSize = '2em'
        questao.style.marginTop = '15px'
        questao.style.fontWeight = 'bold'

        document.getElementById('alternat').style.display = 'none'

        document.getElementById('verificar').style.display = 'none'
        
        document.getElementById('btn').style.display = 'none'

        document.getElementById('recomecar').style.display = 'block'
        document.getElementById('finalizar').style.display = 'block'


        if(pontos >= 6){
            document.getElementById('amora1').style.display = 'block'

            questao.innerText = "Parabéns! Você acertou " + pontos + "/" + perguntas.length;

        } else if(pontos == 5){
            document.getElementById('amora2').style.display = 'block'

            questao.innerText = "Eba! Você acertou " + pontos + "/" + perguntas.length;
        } else {
            document.getElementById('amora3').style.display = 'block'

            questao.innerText = "Que pena! Você acertou " + pontos + "/" + perguntas.length;
        }

        return;

    }
    
    questao.innerText = perguntas[cont].questao;

    alt1.innerText = perguntas[cont].alternativas[pos].alternativa;
    pos++;

    alt2.innerText = perguntas[cont].alternativas[pos].alternativa;
    pos++;

    alt3.innerText = perguntas[cont].alternativas[pos].alternativa;
    pos++;

    alt4.innerText = perguntas[cont].alternativas[pos].alternativa;

    cont++;

    const enviar = document.getElementById('btn');

    enviar.style.display = 'none'


}

function selecionarOpcao(indice){
    document.getElementById("verificar").disabled = false;

    respostaSelecionada = indice;
    const todosBotoes = document.querySelectorAll('.botao');

    todosBotoes.forEach(btn => {btn.classList.remove("botaoSelecionado")});

    todosBotoes[indice].classList.add("botaoSelecionado");

    console.log("Você escolheu a opção de indice: " + indice);




}


function verificar(){
    const enviar = document.getElementById('btn');
    enviar.style.display = 'block'

    if(respostaSelecionada !== -1){       

        var perguntaAtual = perguntas[cont - 1]
        const botoes = document.querySelectorAll('.botao')

        if(perguntaAtual.alternativas[respostaSelecionada].correto === true){

            botoes[respostaSelecionada].classList.add("botaoCerto");
            pontos++;
            

        } else{
            botoes[respostaSelecionada].classList.add("botaoErrado");

            perguntaAtual.alternativas.forEach((alt, indice) => {
                if(alt.correto){
                    botoes[indice].classList.add("botaoCerto")
            }

            })

        }

        respostaSelecionada = -1;

    }

    document.getElementById("verificar").disabled = true;

    const elementos = document.querySelectorAll('.botao');

    elementos.forEach(btn => btn.disabled = true);


}

function finalizarJogo() {
    if (window.parent && window.parent.ponte) {
        window.parent.ponte.emitir('VOLTAR_MENU');
    }
}

