var map;
var markerCluster; // Grupo de marcadores para os desaparecidos
var desaparecidosCache = {}; // Cache global para guardar os dados

// --- Funções do Modal (Restauradas) ---

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

    // Constrói a URL de detalhes
    const urlDetalhePattern = document.getElementById('map').dataset.urlDetalhe;
    const detailUrl = urlDetalhePattern.replace('0', dados.id);

    // Preenche os campos do modal
    const imgEl = document.getElementById('modal-imagem');
    imgEl.src = dados.foto_principal || ''; 
    imgEl.alt = `Foto de ${dados.nome}`; 

    document.getElementById('modal-nome').innerText = dados.nome;
    document.getElementById('modal-status-badge').innerHTML = dados.status_display;
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

function fecharModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

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
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            fecharModal();
        }
    });
    document.getElementById('modal-fechar-btn').addEventListener('click', fecharModal);
}

// --- Função Debounce (Restaurada) ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- Função Principal de Inicialização ---
document.addEventListener('DOMContentLoaded', function startMap() {
    map = L.map('map', {
        center: [-15.793889, -47.882778],
        zoom: 11,
        zoomControl: false
    });

    const mapaElement = document.getElementById('map');
    const urlListagem = mapaElement.dataset.urlExibir;
    const urlRelatorio = mapaElement.dataset.urlRelatorio;
    const urlSobre = mapaElement.dataset.urlSobre;
    const apiUrl = mapaElement.dataset.apiUrl;
    const urlDetalhePattern = mapaElement.dataset.urlDetalhe;
    const urlApiSugestoes = mapaElement.dataset.apiUrlSugestoes; 
    
    const urlParams = new URLSearchParams(window.location.search);
    const idParaAbrir = urlParams.get('id');

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);

    L.control.topBar({
        position: 'topleft',
        urlListagem: urlListagem,  
        urlRelatorio: urlRelatorio,
        urlSobre: urlSobre,
        urlApiSugestoes: urlApiSugestoes 
    }).addTo(map);

    criarModalEstrutura(); // Restaurado
    loadMarkers(map, markerCluster, apiUrl, urlDetalhePattern, idParaAbrir); // Restaurado

    // --- CSS CORRIGIDO E RESTAURADO ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* CORREÇÃO da Centralização */
        .leaflet-top.leaflet-left { 
            width: 100%; 
            padding: 10px; 
            box-sizing: border-box; 
        }
        .leaflet-top.leaflet-left .leaflet-control { 
            margin: 0; 
            border: none; 
            box-shadow: none; 
            background: transparent; 
            width: 100%; /* Garante que o container do controle ocupe 100% */
        }
        
        /* Estilo do Marcador (Restaurado) */
        .marcador-pulsante {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #2563eb;
            border: 3px solid #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            position: relative;
        }
        .marcador-pulsante::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #2563eb;
            animation: pulsar 1.5s infinite;
        }
        @keyframes pulsar {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
            100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        
        /* CSS das Sugestões (Restaurado) */
        .sugestoes-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 0.5rem 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            z-index: 10;
            overflow: hidden;
            max-height: 300px;
            overflow-y: auto;
        }
        .sugestao-item {
            padding: 0.75rem 1rem;
            cursor: pointer;
            font-size: 0.875rem;
            color: #1e293b;
        }
        .sugestao-item:hover {
            background: #f1f5f9;
        }
        .sugestao-item-bo {
            font-size: 0.75rem;
            color: #64748b;
            margin-left: 0.5rem;
        }
        
        /* ESTILOS DO MODAL (Restaurados) */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            padding: 1rem;
        }
        .modal-container {
            background-color: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 48rem;
            max-height: 90vh;
            overflow: hidden;
            position: relative;
            animation: modal-fade-in 0.3s ease-out;
        }
        @keyframes modal-fade-in {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-fechar-btn {
            position: absolute;
            top: 0.75rem; right: 0.75rem;
            background: rgba(255,255,255,0.7);
            border: none;
            border-radius: 50%;
            width: 2rem; height: 2rem;
            font-size: 1.5rem;
            font-weight: bold;
            color: #555;
            cursor: pointer;
            line-height: 1.9rem;
            z-index: 10;
        }
        .modal-conteudo {
            display: flex;
            flex-direction: column;
            max-height: 90vh;
        }
        .modal-imagem-container {
            width: 100%;
            height: 16rem;
            background-color: #f1f5f9;
        }
        .modal-imagem {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .modal-info {
            padding: 2rem;
            overflow-y: auto;
            color: #334155;
        }
        .modal-nome {
            font-size: 2.25rem;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 0.5rem;
        }
        .modal-status-badge {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            margin-bottom: 1.5rem;
        }
        .status-desaparecido { background-color: #fef3c7; color: #9a3412; }
        .status-encontrado { background-color: #dcfce7; color: #166534; }
        .status-investigacao { background-color: #e0f2fe; color: #0369a1; }
        .modal-dl {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
        }
        .modal-dl dt {
            font-weight: 500;
            color: #64748b;
        }
        .modal-dl dd {
            color: #0f172a;
            font-weight: 600;
        }
        .modal-subtitulo {
            font-size: 1rem;
            font-weight: 500;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.25rem;
            margin-bottom: 0.5rem;
        }
        .modal-descricao {
            font-size: 0.875rem;
            white-space: pre-line;
            margin-bottom: 2rem;
        }
        .modal-link-detalhes {
            display: inline-block;
            font-size: 0.875rem;
            font-weight: 600;
            color: #2563eb;
            text-decoration: none;
            transition: all 0.2s;
        }
        .modal-link-detalhes:hover {
            color: #1d4ed8;
        }
        @media (min-width: 768px) {
            .modal-conteudo {
                flex-direction: row;
                max-height: 80vh;
            }
            .modal-imagem-container {
                width: 40%;
                height: auto;
                flex-shrink: 0;
            }
            .modal-info {
                width: 60%;
                max-height: 80vh;
            }
        }
    `;
    document.head.appendChild(style);
});

// --- Barra Superior (CORRIGIDA) ---
L.Control.TopBar = L.Control.extend({
    options: {
        urlListagem: '#',  
        urlRelatorio: '#',
        urlSobre: '#',
        urlApiSugestoes: ''
    },

    onAdd: function (map) {
        // CORREÇÃO: Removido 'flex', 'items-center', 'justify-between'
        const topBarContainer = L.DomUtil.create('div', 'w-full relative h-12 pointer-events-none');
        topBarContainer.style.pointerEvents = 'auto'; // Permite cliques nos filhos

        // --- Container do Zoom (Esquerda) ---
        // CORREÇÃO: Adicionado 'absolute' e posicionamento
        const zoomContainer = L.DomUtil.create('div', 'absolute left-0 top-1/2 -translate-y-1/2 flex shadow-sm rounded-md bg-white', topBarContainer);
        const zoomInBtn = L.DomUtil.create('button', 'px-3 py-1 font-bold text-lg hover:bg-gray-100 rounded-l-md', zoomContainer);
        zoomInBtn.innerHTML = '+';
        zoomInBtn.setAttribute('aria-label', 'Aproximar');
        zoomInBtn.onclick = (e) => { e.stopPropagation(); map.zoomIn(); };
        const zoomOutBtn = L.DomUtil.create('button', 'px-3 py- font-bold text-lg hover:bg-gray-100 rounded-r-md border-l border-gray-200', zoomContainer);
        zoomOutBtn.innerHTML = '−';
        zoomOutBtn.setAttribute('aria-label', 'Afastar');
        zoomOutBtn.onclick = (e) => { e.stopPropagation(); map.zoomOut(); };

        // --- Container da Pesquisa (Centro) ---
        // CORREÇÃO: Adicionado 'top-0' para alinhar verticalmente
        const searchContainer = L.DomUtil.create('div', 'relative flex items-center w-96 gap-2 shadow-sm rounded-md p-1 bg-white absolute left-1/2 -translate-x-1/2 top-0', topBarContainer);
        const searchInput = L.DomUtil.create('input', 'flex-grow px-3 py-2 border-0 focus:outline-none focus:ring-0 bg-transparent text-sm', searchContainer);
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar por nome ou B.O...';
        
        const sugestoesContainer = L.DomUtil.create('div', 'sugestoes-dropdown', searchContainer);
        const searchBtn = L.DomUtil.create('button', 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2', searchContainer);
        searchBtn.innerHTML = 'Buscar';

        // Lógica de Pesquisa
        const performSearch = () => {
            const query = searchInput.value;
            const mapaElement = document.getElementById('map');
            const baseApiUrl = mapaElement.dataset.apiUrl;
            const urlDetalhePattern = mapaElement.dataset.urlDetalhe;
            const searchUrl = query 
                ? `${baseApiUrl}?search=${encodeURIComponent(query)}` 
                : baseApiUrl;
            loadMarkers(map, markerCluster, searchUrl, urlDetalhePattern, null);
            sugestoesContainer.style.display = 'none'; // Esconde sugestões após a busca
        };

        // Lógica de Sugestões
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
                    sugestoesContainer.innerHTML = '';
                    sugestoes.forEach(sugestao => {
                        const item = L.DomUtil.create('div', 'sugestao-item', sugestoesContainer);
                        item.innerHTML = `${sugestao.nome} <span class="sugestao-item-bo">(${sugestao.bo_numero})</span>`;
                        item.onclick = () => {
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

        const debouncedBuscarSugestoes = debounce(buscarSugestoes, 300);

        searchBtn.onclick = performSearch;
        searchInput.onkeydown = (e) => { if (e.key === 'Enter') performSearch(); };
        searchInput.onkeyup = (e) => {
            if (e.key !== 'Enter' && e.key !== 'Escape') {
                debouncedBuscarSugestoes(searchInput.value);
            }
        };
        map.on('click', () => {
            sugestoesContainer.style.display = 'none';
        });

        // --- Container da Navegação (Direita) ---
        // CORREÇÃO: Adicionado 'absolute' e posicionamento
        const navContainer = L.DomUtil.create('div', 'absolute right-0 top-1/2 -translate-y-1/2 flex shadow-sm rounded-xl p-2 bg-white', topBarContainer);
        const btn1 = L.DomUtil.create('button', 'hover:text-blue-600 cursor-pointer px-2.5 py-2 font-semibold', navContainer);
        btn1.innerHTML = 'Listagem';
        btn1.onclick = () => { window.location.href = this.options.urlListagem; };
        const btn2 = L.DomUtil.create('button', 'hover:text-blue-600 cursor-pointer px-2.5 py-2 font-semibold', navContainer);
        btn2.innerHTML = 'Relatorio';
        btn2.onclick = () => { window.location.href = this.options.urlRelatorio; };
        const btn3 = L.DomUtil.create('button', 'hover:text-blue-600 cursor-pointer px-2.5 py-2 font-semibold', navContainer);
        btn3.innerHTML = 'Sobre';
        btn3.onclick = () => { window.location.href = this.options.urlSobre; };

        L.DomEvent.disableClickPropagation(topBarContainer);
        return topBarContainer;
    }
});

// Função final (Restaurada)
L.control.topBar = function (opts) {
    return new L.Control.TopBar(opts);
};