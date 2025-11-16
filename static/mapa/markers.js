// This function is called from mapa.js to load markers on the map.
function loadMarkers(map, markerCluster, apiUrl, urlDetalhePattern, idParaAbrir) {
    
    // Limpa os marcadores anteriores para exibir apenas os resultados da busca
    markerCluster.clearLayers();

    // Limpa o cache global (ou você pode optar por não limpar se a API for pesada)
    // Vamos limpar para garantir que os dados de busca sejam frescos.
    desaparecidosCache = {};
    
    let markerCache = {}; // Cache local para abrir o popup via ID

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(desaparecidos => {
            if (desaparecidos.length === 0) {
                return;
            }

            // Define o ícone personalizado
            const customIcon = L.divIcon({
                className: 'marcador-pulsante', // Mudar nome da classe
                iconSize: [20, 20],       // Mudar tamanho
                iconAnchor: [10, 10],       // Mudar âncora (centro)
                popupAnchor: [0, -10]       // Mudar âncora do popup (acima)
            });


            desaparecidos.forEach(desaparecido => {
                // NOVO: Preenche o cache global com todos os dados
                desaparecidosCache[desaparecido.id] = desaparecido;

                if (desaparecido.latitude && desaparecido.longitude) {
                    const lat = parseFloat(desaparecido.latitude);
                    const lon = parseFloat(desaparecido.longitude);

                    if (!isNaN(lat) && !isNaN(lon)) {
                        
                        // Formata a data (DD/MM/YYYY)
                        let dataFormatada = "N/A";
                        if (desaparecido.data_desaparecimento) {
                            const dataParts = desaparecido.data_desaparecimento.split('-'); // [YYYY, MM, DD]
                            dataFormatada = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`; // DD/MM/YYYY
                        }

                        // ALTERADO: O popup agora chama 'abrirModal'
                        const popupContent = `
                            <div class="flex items-center gap-4 w-64 no-underline text-gray-800">
                                ${desaparecido.foto_principal ? `
                                    <div class="w-20 h-20 flex-shrink-0">
                                        <img src="${desaparecido.foto_principal}" alt="Foto de ${desaparecido.nome}" class="w-full h-full object-cover rounded-md">
                                    </div>
                                ` : ''}
                                <div class="flex-grow">
                                    <h3 onclick="abrirModal(${desaparecido.id})" class="font-bold text-base mb-1 text-blue-600 hover:text-blue-800 cursor-pointer">
                                        ${desaparecido.nome}
                                    </h3>
                                    ${desaparecido.idade ? `<p class="text-sm text-gray-600"><strong>Idade:</strong> ${desaparecido.idade}</p>` : ''}
                                    ${desaparecido.data_desaparecimento ? `<p class="text-sm text-gray-600"><strong>Desapareceu em:</strong> ${dataFormatada}</p>` : ''}
                                </div>
                            </div>`;

                        // Cria o marcador com o ícone customizado
                        const marker = L.marker([lat, lon], { icon: customIcon });
                        marker.bindPopup(popupContent);

                        markerCluster.addLayer(marker);
                        markerCache[desaparecido.id] = marker;
                    }
                }
            });

            // Lógica para abrir o popup vindo da URL (clicando no card)
            if (idParaAbrir && markerCache[idParaAbrir]) {
                const markerToOpen = markerCache[idParaAbrir];
                markerCluster.zoomToShowLayer(markerToOpen, () => {
                    // ALTERADO: Em vez de abrir o popup, agora abre o modal
                    abrirModal(idParaAbrir);
                });

            } else if (markerCluster.getLayers().length > 0) {
                map.fitBounds(markerCluster.getBounds(), { padding: [50, 50] });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar ou processar dados dos desaparecidos:', error);
        });
}