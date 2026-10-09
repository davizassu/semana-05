# semana-05

**# 🚀 Projeto: Manipulação de DOM e Consumo de APIs

Este projeto aplica na prática a construção de uma interface robusta conectada a APIs externas (ViaCEP e PokéAPI), demonstrando o domínio sobre fluxos assíncronos no JavaScript e a manipulação dinâmica de elementos HTML.

## 🧠 O que eu aprendi neste projeto

### 1. Os 4 Estados da Tela
Aprender a tratar requisições não é apenas sobre o "caminho feliz". Uma boa interface precisa gerenciar quatro estados distintos:
1. **Carregando:** Desabilitar botões e dar feedback ao usuário enquanto o Event Loop processa as microtarefas.
2. **Erro:** Capturar falhas de rede (`catch`) ou erros de servidor (`!response.ok`), impedindo que o programa quebre silenciosamente.
3. **Vazio:** O servidor respondeu, mas o dado não existe (ex: CEP inexistente, onde o ViaCEP retorna um JSON com a chave `{ erro: true }`).
4. **Sucesso:** Limpar os estados anteriores (`replaceChildren`) e renderizar os dados de forma segura.

### 2. Segurança: XSS (Cross-Site Scripting)
Para renderizar dados vindos de APIs abertas, troquei o uso do `innerHTML` (que pode executar scripts maliciosos se injetados nos dados) por uma combinação de `document.createElement()` e `textContent`. Isso garante que o navegador interprete as informações **apenas como texto**.

### 3. Fetch API e o Event Loop
O `fetch()` inicia uma requisição e devolve uma *Promise*. Enquanto aguarda (`await`), o JavaScript não congela a tela; ele pausa aquela função e vai resolver outras coisas (como escutar cliques e animações), voltando para a função apenas quando os pacotes de rede chegam.

---

## 🤔 Parte 4 - Reflexão: Por que `Promise.all` pode ser mais rápido que vários `await` seguidos?

Ao usarmos vários `await` sequenciais no código, ocorre o **efeito cascata (waterfall)**: a segunda requisição só começa a viajar pela rede de internet *depois* que a primeira for totalmente concluída.

**Exemplo com await sequencial:**
1. Pedir Cliente (espera 2 segundos)
2. Pedir Endereço (espera 2 segundos)
*Tempo total: 4 segundos.*

Com o **`Promise.all([req1, req2])`**, o JavaScript dispara as duas requisições para a rede **ao mesmo tempo em paralelo**. Ele aproveita muito melhor a banda da internet e o tempo ocioso de I/O.
*Tempo total com Promise.all: apenas 2 segundos (o tempo da requisição mais lenta).***
