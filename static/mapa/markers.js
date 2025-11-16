// This function is called from mapa.js to load markers on the map.
function loadMarkers(map, markerCluster, apiUrl, urlDetalhePattern) {
    // Limpa os marcadores anteriores para exibir apenas os resultados da busca
    markerCluster.clearLayers();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(desaparecidos => {
            if (desaparecidos.length === 0) {
                // Se a busca não retornar resultados, não faz nada.
                // O mapa ficará sem marcadores (exceto os de busca de endereço).
                return;
            }

            desaparecidos.forEach(desaparecido => {
                // Ensure latitude and longitude are present and are valid numbers
                if (desaparecido.latitude && desaparecido.longitude) {
                    const lat = parseFloat(desaparecido.latitude);
                    const lon = parseFloat(desaparecido.longitude);
                    
                    if (!isNaN(lat) && !isNaN(lon)) {
                        // Constrói a URL para a página de detalhes
                        const detailUrl = urlDetalhePattern.replace('0', desaparecido.id);

                        const dataParts = desaparecido.data_desaparecimento.split('-');
                        // 2. Remonta a data no formato "DD/MM/YYYY"
                        const dataFormatada = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;

                        // Create the popup content dynamically
                        const popupContent = `
                            <a href="${detailUrl}" target="_blank" class="flex items-center gap-4 w-64 no-underline text-gray-800">
                                ${desaparecido.foto_principal ? `
                                    <div class="w-20 h-20 flex-shrink-0">
                                        <img src="${desaparecido.foto_principal}" alt="Foto de ${desaparecido.nome}" class="w-full h-full object-cover rounded-md">
                                    </div>
                                ` : ''}
                                <div class="flex-grow">
                                    <h3 class="font-bold text-base mb-1">${desaparecido.nome}</h3>
                                    ${desaparecido.idade ? `<p class="text-sm text-gray-600"><strong>Idade:</strong> ${desaparecido.idade}</p>` : ''}
                                    ${desaparecido.data_desaparecimento ? `<p class="text-sm text-gray-600"><strong>Desapareceu em:</strong> ${new Date(desaparecido.data_desaparecimento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>` : ''}
                                </div>
                            </a>`;

                        // Cria o marcador individual
                        const marker = L.marker([lat, lon]);
                        marker.bindPopup(popupContent);

                        // Adiciona o marcador ao grupo de clusters, em vez de diretamente ao mapa.
                        markerCluster.addLayer(marker);
                    }
                }
            });

            // Ajusta o zoom do mapa para mostrar todos os marcadores encontrados.
            // Adiciona um padding para que os marcadores não fiquem nas bordas.
            if (markerCluster.getLayers().length > 0) {
                map.fitBounds(markerCluster.getBounds(), { padding: [50, 50] });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar ou processar dados dos desaparecidos:', error);
        });
}