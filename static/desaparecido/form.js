document.addEventListener('DOMContentLoaded', function() {
    // ... (Seleção de elementos) ...
    const addressInput = document.getElementById('id_ultima_localizacao');
    // ...
    const mapDiv = document.getElementById('preview-map');
    
    // ... (Verificação de elementos) ...

    let previewMap = null;
    let previewMarker = null;

    // NOVO: Define o ícone pulsante
    const pulsingIcon = L.divIcon({
        className: 'marcador-pulsante',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // --- 2. Map Functions ---
    function initializeMap() {
        // ...
        previewMap = L.map(mapDiv).setView([-15.79, -47.88], 4);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(previewMap);

        // Coloca o marcador inicial em formulários de edição
        // ... (o resto da função initializeMap continua igual) ...
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
        // ... (validação de previewMap e coords) ...
        if (!previewMap || !isValidCoord(lat) || !isValidCoord(lon)) {
            console.warn("updateMap called with invalid map or coordinates.");
            return;
        }

        const latlng = [parseFloat(lat), parseFloat(lon)];
        console.log("Updating map to:", latlng);

        if (previewMarker) {
            previewMarker.setLatLng(latlng);
        } else {
            // ALTERADO: Usa o 'pulsingIcon'
            previewMarker = L.marker(latlng, { icon: pulsingIcon }).addTo(previewMap);
        }
        previewMap.flyTo(latlng, 15);
    }

    // --- 3. Nominatim Search Logic ---
    // ... (o resto do ficheiro (handleSearch, listeners, etc.) continua igual) ...
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

    latInput.addEventListener('input', () => updateMap(latInput.value, lonInput.value));
    lonInput.addEventListener('input', () => updateMap(latInput.value, lonInput.value));

    initializeMap();
});