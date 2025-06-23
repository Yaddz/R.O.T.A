var map;
var markerCluster; // Grupo de marcadores para os desaparecidos

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Inicializa o grupo de clusters e o adiciona ao mapa
    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);

    L.control.topBar({
        position: 'topleft',
        urlListagem: urlListagem,  
        urlRelatorio: urlRelatorio,
        urlSobre: urlSobre
    }).addTo(map);

    // Chama a função para carregar os marcadores da API
    loadMarkers(map, markerCluster, apiUrl);

    const style = document.createElement('style');
    style.innerHTML = `
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
        }
        /* Classe para posicionamento absoluto com alinhamento vertical */
        .absolute-center-y {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
        }
    `;
    document.head.appendChild(style);
});

// Cria uma barra superior customizada com controles de zoom, pesquisa e navegação.
L.Control.TopBar = L.Control.extend({

    options: {
        urlListagem: '#',  
        urlRelatorio: '#',
        urlSobre: '#'
    },

    onAdd: function (map) {
        // Container principal que servirá de contexto para o posicionamento
        const topBarContainer = L.DomUtil.create('div', 'w-full relative h-12 flex items-center justify-between pointer-events-none');
        // Habilita eventos de ponteiro no container principal para que os botões funcionem
        topBarContainer.style.pointerEvents = 'auto';

        // --- Container do Zoom (Esquerda) ---
        const zoomContainer = L.DomUtil.create('div', 'flex shadow-sm rounded-md bg-white', topBarContainer);

        const zoomInBtn = L.DomUtil.create('button', 'px-3 py-1 font-bold text-lg hover:bg-gray-100 rounded-l-md', zoomContainer);
        zoomInBtn.innerHTML = '+';
        zoomInBtn.setAttribute('aria-label', 'Aproximar');
        zoomInBtn.onclick = (e) => { e.stopPropagation(); map.zoomIn(); };

        const zoomOutBtn = L.DomUtil.create('button', 'px-3 py- font-bold text-lg hover:bg-gray-100 rounded-r-md border-l border-gray-200', zoomContainer);
        zoomOutBtn.innerHTML = '−';
        zoomOutBtn.setAttribute('aria-label', 'Afastar');
        zoomOutBtn.onclick = (e) => { e.stopPropagation(); map.zoomOut(); };

        // --- Container da Pesquisa (Centro, posicionado absolutamente) ---
        const searchContainer = L.DomUtil.create('div', 'flex items-center w-96 gap-2 shadow-sm rounded-md p-1 hover:shadow-md transition-shadow bg-white absolute left-1/2 -translate-x-1/2', topBarContainer);
        const searchInput = L.DomUtil.create('input', 'flex-grow px-3 py-2 border-0 focus:outline-none focus:ring-0 bg-transparent text-sm', searchContainer);
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar por nome ou B.O...';
        const searchBtn = L.DomUtil.create('button', 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2', searchContainer);
        searchBtn.innerHTML = 'Buscar';

        // --- Lógica da Pesquisa de Desaparecidos ---
        const performSearch = () => {
            const query = searchInput.value;
            const mapaElement = document.getElementById('map');
            const baseApiUrl = mapaElement.dataset.apiUrl;

            // Se a busca estiver vazia, carrega todos os marcadores.
            // Se houver um termo, anexa como parâmetro de busca.
            const searchUrl = query 
                ? `${baseApiUrl}?search=${encodeURIComponent(query)}` 
                : baseApiUrl;

            // Chama a função para carregar/filtrar os marcadores
            loadMarkers(map, markerCluster, searchUrl);
        };

        searchBtn.onclick = performSearch;
        searchInput.onkeydown = (e) => { if (e.key === 'Enter') performSearch(); };

        // --- Container da Navegação (Direita) ---
        const navContainer = L.DomUtil.create('div', 'flex shadow-sm rounded-xl p-2 hover:shadow-md transition-shadow bg-white ml-auto', topBarContainer);
        // Botão lista
        const btn1 = L.DomUtil.create('button', 'hover:text-blue-600 cursor-pointer px-2.5 py-2 font-semibold', navContainer);
        btn1.innerHTML = 'Listagem';
        btn1.onclick = () => {
            window.location.href = this.options.urlListagem; 
        };
        // Botão relatorio
        const btn2 = L.DomUtil.create('button', 'hover:text-blue-600 cursor-pointer px-2.5 py-2 font-semibold', navContainer);
        btn2.innerHTML = 'Relatorio';
        btn2.onclick = () => {
            window.location.href = this.options.urlRelatorio; 
        };

        // Botão sobre
        const btn3 = L.DomUtil.create('button', 'hover:text-blue-600 cursor-pointer px-2.5 py-2 font-semibold', navContainer);
        btn3.innerHTML = 'Sobre';
        btn3.onclick = () => {
            window.location.href = this.options.urlSobre; 
        };


        L.DomEvent.disableClickPropagation(topBarContainer);

        return topBarContainer;
    }
});

L.control.topBar = function (opts) {
    return new L.Control.TopBar(opts);
};
