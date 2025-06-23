document.addEventListener('DOMContentLoaded', function() {
    console.log("form.js loaded and DOM is ready.");

    // --- 1. Element Selection & Validation ---
    const addressInput = document.getElementById('id_ultima_localizacao');
    const latInput = document.getElementById('id_latitude');
    const lonInput = document.getElementById('id_longitude');
    const searchButton = document.getElementById('search-coords-btn');
    const messageDiv = document.getElementById('nominatim-message');
    const mapDiv = document.getElementById('preview-map');

    // Check if all required elements are on the page
    if (!addressInput || !latInput || !lonInput || !searchButton || !messageDiv || !mapDiv) {
        console.error("Um ou mais elementos do formulário não foram encontrados. Verifique os IDs no template HTML.");
        // Stop execution if essential elements are missing
        return;
    }

    let previewMap = null;
    let previewMarker = null;

    // --- 2. Map Functions ---
    function initializeMap() {
        console.log("Initializing preview map.");
        // Inicia o mapa com uma visão geral do Brasil
        previewMap = L.map(mapDiv).setView([-15.79, -47.88], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(previewMap);

        // Coloca o marcador inicial em formulários de edição
        const initialLat = latInput.value;
        const initialLon = lonInput.value;
        if (isValidCoord(initialLat) && isValidCoord(initialLon)) {
            console.log(`Setting initial marker at: ${initialLat}, ${initialLon}`);
            updateMap(initialLat, initialLon);
        }
    }

    function isValidCoord(coord) {
        return coord && !isNaN(parseFloat(coord));
    }

    function updateMap(lat, lon) {
        if (!previewMap || !isValidCoord(lat) || !isValidCoord(lon)) {
            console.warn("updateMap called with invalid map or coordinates.");
            return;
        }

        const latlng = [parseFloat(lat), parseFloat(lon)];
        console.log("Updating map to:", latlng);

        if (previewMarker) {
            previewMarker.setLatLng(latlng);
        } else {
            previewMarker = L.marker(latlng).addTo(previewMap);
        }
        // Use flyTo for a smooth animation
        previewMap.flyTo(latlng, 15);
    }

    // --- 3. Nominatim Search Logic ---
    async function handleSearch() {
        const address = addressInput.value.trim();
        console.log(`Search button clicked. Address: "${address}"`);

        if (!address) {
            messageDiv.textContent = 'Por favor, insira um endereço para buscar.';
            messageDiv.className = 'mt-2 text-sm text-yellow-600';
            return;
        }

        messageDiv.textContent = 'Buscando...';
        messageDiv.className = 'mt-2 text-sm text-blue-600';

        const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        console.log("Fetching from API:", apiUrl);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("API Response:", data);

            if (data && data.length > 0) {
                const firstResult = data[0];
                latInput.value = firstResult.lat;
                lonInput.value = firstResult.lon;
                messageDiv.textContent = 'Coordenadas encontradas! Verifique o marcador no mapa.';
                messageDiv.className = 'mt-2 text-sm text-green-600';

                updateMap(firstResult.lat, firstResult.lon);
            } else {
                messageDiv.textContent = 'Endereço não encontrado. Verifique o endereço ou insira as coordenadas manualmente.';
                messageDiv.className = 'mt-2 text-sm text-red-600';
            }
        } catch (error) {
            console.error('Erro na busca com Nominatim:', error);
            messageDiv.textContent = 'Ocorreu um erro ao buscar as coordenadas. Verifique o console para mais detalhes.';
            messageDiv.className = 'mt-2 text-sm text-red-600';
        }
    }

    searchButton.addEventListener('click', handleSearch);

    // --- 4. Listeners for Manual Coordinate Input ---
    latInput.addEventListener('input', () => updateMap(latInput.value, lonInput.value));
    lonInput.addEventListener('input', () => updateMap(latInput.value, lonInput.value));

    // --- 5. Initialize Everything ---
    initializeMap();
});