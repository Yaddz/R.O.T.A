var map;
var markerCluster; // Grupo de marcadores para os desaparecidos
var desaparecidosCache = {}; // NOVO: Cache global para guardar os dados

// NOVO: Função para abrir o modal com dados
function abrirModal(id) {
    const dados = desaparecidosCache[id];
    if (!dados) {
        console.error("Dados do desaparecido não encontrados no cache:", id);
        return;
    }

    // Formata a data (DD/MM/YYYY)
    let dataFormatada = "N/A";
    if (dados.data_desaparecimento) {
        const dataParts = dados.data_desaparecimento.split('-'); // [YYYY, MM, DD]
        dataFormatada = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`; // DD/MM/YYYY
    }

    // Constrói a URL de detalhes (baseado no padrão que já temos)
    const urlDetalhePattern = document.getElementById('map').dataset.urlDetalhe;
    const detailUrl = urlDetalhePattern.replace('0', dados.id);

    // Preenche os campos do modal
    const imgEl = document.getElementById('modal-imagem');
    imgEl.src = dados.foto_principal || ''; 
    imgEl.alt = `Foto de ${dados.nome}`; 

    document.getElementById('modal-nome').innerText = dados.nome;
    document.getElementById('modal-status-badge').innerHTML = dados.status_display; // Usa o status_display da API
    document.getElementById('modal-idade').innerText = dados.idade ? `${dados.idade} anos` : 'N/A';
    document.getElementById('modal-data-des').innerText = dataFormatada;
    document.getElementById('modal-local').innerText = dados.ultima_localizacao || 'N/A';
    document.getElementById('modal-bo').innerText = dados.bo_numero || 'N/A';
    document.getElementById('modal-descricao').innerText = dados.descricao || 'Sem descrição.';
    document.getElementById('modal-link-detalhes').href = detailUrl;

    // Ajusta a classe do "badge" de status
    const badge = document.getElementById('modal-status-badge');
    badge.className = 'modal-status-badge '; // Reseta as classes
    if (dados.status === 'encontrado') {
        badge.classList.add('status-encontrado');
    } else if (dados.status === 'desaparecido') {
        badge.classList.add('status-desaparecido');
    } else {
        badge.classList.add('status-investigacao');
    }

    // Exibe o modal
    document.getElementById('modal-overlay').style.display = 'flex';
}

// NOVO: Função para fechar o modal
function fecharModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// NOVO: Função para criar a estrutura HTML do modal no body
function criarModalEstrutura() {
    const modalHTML = `
        <div id="modal-overlay" class="modal-overlay">
            <div id="modal-container" class="modal-container">
                <button id="modal-fechar-btn" class="modal-fechar-btn">&times;</button>
                
                <div class="modal-conteudo">
                    <div class="modal-imagem-container">
                        <img id="modal-imagem" src="" alt="Foto" class="modal-imagem">
                    </div>
                    <div class="modal-info">
                        <h2 id="modal-nome" class="modal-nome"></h2>
                        <span id="modal-status-badge" class="modal-status-badge"></span>
                        
                        <dl class="modal-dl">
                            <div><dt>Idade:</dt><dd id="modal-idade"></dd></div>
                            <div><dt>Desapareceu em:</dt><dd id="modal-data-des"></dd></div>
                            <div><dt>Última Localização:</dt><dd id="modal-local"></dd></div>
                            <div><dt>B.O.:</dt><dd id="modal-bo"></dd></div>
                        </dl>
                        
                        <h3 class="modal-subtitulo">Descrição</h3>
                        <p id="modal-descricao" class="modal-descricao"></p>

                        <a id="modal-link-detalhes" href="#" class="modal-link-detalhes">
                            Ver Página Completa &rarr;
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o HTML ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adiciona eventos de fecho
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            fecharModal();
        }
    });
    document.getElementById('modal-fechar-btn').addEventListener('click', fecharModal);
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

document.addEventListener('DOMContentLoaded', function startMap() {
    map = L.map('map', {
        // ... (configurações do mapa) ...
        center: [-15.793889, -47.882778],
        zoom: 11,
        zoomControl: false
    });

    const mapaElement = document.getElementById('map');
    // ... (suas variáveis de URL)
    const apiUrl = mapaElement.dataset.apiUrl;
    const urlDetalhePattern = mapaElement.dataset.urlDetalhe;
    const idParaAbrir = urlParams.get('id');
    // NOVO: Pega a URL da nova API
    const urlApiSugestoes = mapaElement.dataset.apiUrlSugestoes; 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        // ... (atribuição) ...
    }).addTo(map);

    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);

    L.control.topBar({
        position: 'topleft',
        urlListagem: mapaElement.dataset.urlExibir,  
        urlRelatorio: mapaElement.dataset.urlRelatorio,
        urlSobre: mapaElement.dataset.urlSobre,
        // NOVO: Passa a URL de sugestões para a TopBar
        urlApiSugestoes: urlApiSugestoes 
    }).addTo(map);

    criarModalEstrutura();
    loadMarkers(map, markerCluster, apiUrl, urlDetalhePattern, idParaAbrir);

    // Adiciona o CSS para o modal e marcador
    const style = document.createElement('style');
    style.innerHTML = `
        /* ... (estilos do leaflet-top, absolute-center-y) ... */
        .leaflet-top.leaflet-left { width: 100%; padding: 10px; box-sizing: border-box; }
        .leaflet-top.leaflet-left .leaflet-control { margin: 0; border: none; box-shadow: none; background: transparent; }
        .absolute-center-y { position: absolute; top: 50%; transform: translateY(-50%); }

        /* ... (estilos do marcador-pulsante e @keyframes pulsar) ... */
        .marcador-pulsante { ... }
        .marcador-pulsante::before { ... }
        @keyframes pulsar { ... }

        /* NOVO: CSS para a caixa de sugestões */
        .sugestoes-dropdown {
            display: none; /* Escondido por padrão */
            position: absolute;
            top: 100%; /* Imediatamente abaixo da barra */
            left: 0;
            right: 0;
            background: #fff;
            border: 1px solid #e2e8f0; /* slate-200 */
            border-top: none;
            border-radius: 0 0 0.5rem 0.5rem; /* rounded-b-lg */
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            z-index: 10;
            overflow: hidden;
            max-height: 300px;
            overflow-y: auto;
        }
        .sugestao-item {
            padding: 0.75rem 1rem; /* p-3 px-4 */
            cursor: pointer;
            font-size: 0.875rem; /* text-sm */
            color: #1e293b; /* slate-800 */
        }
        .sugestao-item:hover {
            background: #f1f5f9; /* slate-100 */
        }
        .sugestao-item-bo {
            font-size: 0.75rem; /* text-xs */
            color: #64748b; /* slate-500 */
            margin-left: 0.5rem; /* ml-2 */
        }
        /* FIM DO NOVO CSS */

        /* ... (estilos do modal) ... */
    `;
    document.head.appendChild(style);
});

// Cria uma barra superior customizada com controles de zoom, pesquisa e navegação.
L.Control.TopBar = L.Control.extend({

    options: {
        urlListagem: '#',  
        urlRelatorio: '#',
        urlSobre: '#',
        urlApiSugestoes: '' // NOVO: Opção para receber a URL
    },

    onAdd: function (map) {
        // ... (criação do topBarContainer, zoomContainer, etc.) ...
        
        // --- Container da Pesquisa (Centro, posicionado absolutamente) ---
        // ALTERADO: Adicionado 'relative' para posicionar as sugestões
        const searchContainer = L.DomUtil.create('div', 'relative flex items-center w-96 gap-2 shadow-sm rounded-md p-1 hover:shadow-md transition-shadow bg-white absolute left-1/2 -translate-x-1/2', topBarContainer);
        const searchInput = L.DomUtil.create('input', 'flex-grow px-3 py-2 border-0 focus:outline-none focus:ring-0 bg-transparent text-sm', searchContainer);
        // ... (configurações do searchInput)
        searchInput.placeholder = 'Buscar por nome ou B.O...';

        // NOVO: Cria o container de sugestões
        const sugestoesContainer = L.DomUtil.create('div', 'sugestoes-dropdown', searchContainer);

        const searchBtn = L.DomUtil.create('button', 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2', searchContainer);
        searchBtn.innerHTML = 'Buscar';

        // --- Lógica da Pesquisa de Desaparecidos ---
        const performSearch = () => {
            // ... (lógica do performSearch)
        };

        // --- NOVO: Lógica das Sugestões ---
        const buscarSugestoes = async (query) => {
            if (query.length < 2) {
                sugestoesContainer.innerHTML = '';
                sugestoesContainer.style.display = 'none';
                return;
            }
            
            try {
                const response = await fetch(`${this.options.urlApiSugestoes}?q=${encodeURIComponent(query)}`);
                const sugestoes = await response.json();
                
                if (sugestoes.length > 0) {
                    sugestoesContainer.innerHTML = ''; // Limpa
                    sugestoes.forEach(sugestao => {
                        const item = L.DomUtil.create('div', 'sugestao-item', sugestoesContainer);
                        item.innerHTML = `${sugestao.nome} <span class="sugestao-item-bo">(${sugestao.bo_numero})</span>`;
                        item.onclick = () => {
                            // Ao clicar, preenche a busca e submete
                            searchInput.value = sugestao.nome;
                            sugestoesContainer.style.display = 'none';
                            performSearch();
                        };
                    });
                    sugestoesContainer.style.display = 'block';
                } else {
                    sugestoesContainer.style.display = 'none';
                }
            } catch (error) {
                console.error('Erro ao buscar sugestões:', error);
                sugestoesContainer.style.display = 'none';
            }
        };

        // Cria a versão "debounced" da função
        const debouncedBuscarSugestoes = debounce(buscarSugestoes, 300);

        // Adiciona os eventos
        searchBtn.onclick = performSearch;
        searchInput.onkeydown = (e) => { if (e.key === 'Enter') performSearch(); };
        // NOVO: Evento de digitação
        searchInput.onkeyup = (e) => {
            if (e.key !== 'Enter' && e.key !== 'Escape') {
                debouncedBuscarSugestoes(searchInput.value);
            }
        };
        // NOVO: Fecha ao clicar fora
        map.on('click', () => {
            sugestoesContainer.style.display = 'none';
        });

        // --- Container da Navegação (Direita) ---
        // ... (o resto da função onAdd continua igual) ...

        return topBarContainer;
    }
});

L.control.topBar = function (opts) {
    return new L.Control.TopBar(opts);
};