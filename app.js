// ==========================================================
// PARTE 1: MANIPULAÇÃO E VALIDAÇÃO DE DADOS (Arrays e Objetos)
// ==========================================================
const pedidos = [
    { cliente: "Bia", valor: 120.00, status: "pago" },
    { cliente: "", valor: 50.00, status: "pago" }, // Inválido: sem nome
    { cliente: "Carlos", valor: -10.00, status: "pago" }, // Inválido: valor negativo
    { cliente: "Davi", valor: 350.50, status: "pago" },
    { cliente: "Ana", valor: 80.00, status: "pendente" } // Válido, mas não pago
];

// 1. Filtrar pedidos válidos (nome não vazio e valor > 0) e que estão 'pagos'
const pedidosProcessados = pedidos
    .filter(pedido => pedido.cliente.trim() !== "" && pedido.valor > 0)
    .filter(pedido => pedido.status === "pago");

// 2. Calcular o total com reduce
const totalFaturado = pedidosProcessados.reduce((acumulador, pedido) => acumulador + pedido.valor, 0);

// 3. Renderizar na tela
const listaPedidos = document.getElementById("lista-pedidos");
pedidosProcessados.forEach(pedido => {
    const li = document.createElement("li");
    li.textContent = `${pedido.cliente} — R$ ${pedido.valor.toFixed(2)}`;
    listaPedidos.append(li);
});
document.getElementById("total-faturamento").textContent = `Faturamento Total: R$ ${totalFaturado.toFixed(2)}`;


// ==========================================================
// PARTE 2: BUSCADOR DE CEP (async/await, fetch, 4 estados)
// ==========================================================
const formCep = document.getElementById("form-cep");
const inputCep = document.getElementById("input-cep");
const btnCep = document.getElementById("btn-cep");
const statusCep = document.getElementById("status-cep");
const resultadoCep = document.getElementById("resultado-cep");
const historicoCepUl = document.getElementById("historico-cep");

const historicoPesquisas = []; // Array para o Bônus

// Função auxiliar para gerenciar os 4 estados visuais
function setEstadoCep(estado, mensagem = "") {
    statusCep.className = `status ${estado}`;
    statusCep.textContent = mensagem;
    
    if (estado === "carregando") {
        btnCep.disabled = true;
        resultadoCep.replaceChildren(); // Limpa resultados anteriores
    } else {
        btnCep.disabled = false;
    }
}

formCep.addEventListener("submit", async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    
    // Limpa espaços e usa regex para deixar só os números
    const cepLimpo = inputCep.value.trim().replace(/\D/g, "");

    // Validação
    if (cepLimpo.length !== 8) {
        setEstadoCep("erro", "⚠️ O CEP deve conter exatamente 8 números.");
        return;
    }

    setEstadoCep("carregando", "Buscando...");

    try {
        // AbortSignal para evitar que o fetch fique travado para sempre se a API cair
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
            signal: AbortSignal.timeout(5000) 
        });

        if (!resposta.ok) throw new Error("Erro ao conectar com o servidor.");

        const dados = await resposta.json();

        // Tratamento do estado "Vazio" (ViaCEP retorna {erro: true} se não achar)
        if (dados.erro) {
            setEstadoCep("erro", " CEP não encontrado.");
            return;
        }

        // ESTADO SUCESSO! Limpamos a mensagem de status e renderizamos
        setEstadoCep("sucesso", "");
        
        // Criando elementos de forma segura contra XSS (nunca usando innerHTML com dados externos)
        const info = [
            { titulo: "Logradouro:", valor: dados.logradouro },
            { titulo: "Bairro:", valor: dados.bairro },
            { titulo: "Localidade:", valor: `${dados.localidade} - ${dados.uf}` }
        ];

        info.forEach(item => {
            const dt = document.createElement("dt");
            dt.textContent = item.titulo;
            const dd = document.createElement("dd");
            dd.textContent = item.valor || "Não informado";
            resultadoCep.append(dt, dd);
        });

        // Bônus: Salvar no histórico
        historicoPesquisas.push(cepLimpo);
        const liHistorico = document.createElement("li");
        liHistorico.textContent = `Busca: ${cepLimpo} (${dados.localidade})`;
        historicoCepUl.append(liHistorico);

        inputCep.value = ""; // Limpa o input

    } catch (erro) {
        // Trata erro de timeout, sem internet ou HTTP !response.ok
        if (erro.name === "TimeoutError") {
            setEstadoCep("erro", " A requisição demorou muito. Tente novamente.");
        } else {
            setEstadoCep("erro", " Falha na conexão ou na rede.");
        }
    }
});


// ==========================================================
// PARTE 3: DESAFIO MINI POKÉDEX
// ==========================================================
const formPokemon = document.getElementById("form-pokemon");
const inputPokemon = document.getElementById("input-pokemon");
const btnPokemon = document.getElementById("btn-pokemon");
const statusPokemon = document.getElementById("status-pokemon");
const resultadoPokemon = document.getElementById("resultado-pokemon");

function setEstadoPokemon(estado, mensagem = "") {
    statusPokemon.className = `status ${estado}`;
    statusPokemon.textContent = mensagem;
    
    if (estado === "carregando") {
        btnPokemon.disabled = true;
        resultadoPokemon.replaceChildren(); 
    } else {
        btnPokemon.disabled = false;
    }
}

formPokemon.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomePokemon = inputPokemon.value.trim().toLowerCase();

    if (nomePokemon === "") {
        setEstadoPokemon("erro", " Digite o nome de um Pokémon.");
        return;
    }

    setEstadoPokemon("carregando", "Procurando Pokémon...");

    try {
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon}`);

        // O Fetch não dá catch em erro 404 automaticamente. Precisamos checar o ok!
        if (!resposta.ok) {
            if (resposta.status === 404) {
                throw new Error("Pokémon não encontrado."); // Estado Vazio
            }
            throw new Error("Erro no servidor PokéAPI."); // Estado Erro
        }

        const pokemon = await resposta.json();
        setEstadoPokemon("sucesso", "");

        // Criando a imagem
        const img = document.createElement("img");
        img.src = pokemon.sprites.front_default;
        img.alt = pokemon.name;
        img.className = "pokemon-img";

        // Criando o título
        const titulo = document.createElement("h3");
        titulo.textContent = pokemon.name.toUpperCase();
        titulo.style.color = "#03dac6";

        resultadoPokemon.append(img, titulo);

        // Criando as tags de "Tipo" (ex: Electric, Water)
        pokemon.types.forEach(tipoInfo => {
            const spanTipo = document.createElement("span");
            spanTipo.textContent = tipoInfo.type.name;
            spanTipo.className = "pokemon-tipo";
            resultadoPokemon.append(spanTipo);
        });

        inputPokemon.value = "";

    } catch (erro) {
        setEstadoPokemon("erro", erro.message);
    }
});