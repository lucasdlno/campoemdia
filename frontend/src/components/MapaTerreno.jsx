import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mapa com desenho do terreno: cada clique cria um vértice e as linhas formam a área.
// Os vértices podem ser arrastados para ajustar. Os pontos são [[lat, lng], ...].
export default function MapaTerreno({ centro, zoom = 14, pontos, onMudar, somenteLeitura = false }) {
  const divRef = useRef(null);
  const mapaRef = useRef(null);
  const camadaRef = useRef(null);

  // Guardamos os valores mais novos em "refs" para os eventos do mapa
  const pontosRef = useRef(pontos);
  const onMudarRef = useRef(onMudar);
  const leituraRef = useRef(somenteLeitura);
  pontosRef.current = pontos;
  onMudarRef.current = onMudar;
  leituraRef.current = somenteLeitura;

  // Cria o mapa uma vez
  useEffect(() => {
    const mapa = L.map(divRef.current).setView(centro, zoom);

    const ruas = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    });
    const satelite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Imagens &copy; Esri' },
    );
    satelite.addTo(mapa);
    L.control.layers({ Satélite: satelite, Mapa: ruas }).addTo(mapa);

    camadaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;

    mapa.on('click', (e) => {
      if (leituraRef.current) return;
      onMudarRef.current([...pontosRef.current, [e.latlng.lat, e.latlng.lng]]);
    });

    if (pontosRef.current.length >= 3) {
      mapa.fitBounds(L.latLngBounds(pontosRef.current), { padding: [30, 30] });
    }
    setTimeout(() => mapa.invalidateSize(), 0);

    return () => {
      mapa.remove();
      mapaRef.current = null;
      camadaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vai para o centro novo (troca de cidade, "minha localização") se ainda não há área desenhada
  useEffect(() => {
    if (mapaRef.current && pontosRef.current.length < 3) {
      mapaRef.current.setView(centro, zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centro[0], centro[1], zoom]);

  // Redesenha linhas, área e vértices sempre que os pontos mudam
  useEffect(() => {
    const camada = camadaRef.current;
    if (!camada) return;
    camada.clearLayers();

    if (pontos.length >= 3) {
      L.polygon(pontos, {
        color: '#2f7d4f',
        weight: 3,
        fillColor: '#2f7d4f',
        fillOpacity: 0.25,
        interactive: false,
      }).addTo(camada);
    } else if (pontos.length === 2) {
      L.polyline(pontos, { color: '#2f7d4f', weight: 3, dashArray: '6', interactive: false }).addTo(camada);
    }

    pontos.forEach((pt, i) => {
      const vertice = L.marker(pt, {
        draggable: !somenteLeitura,
        interactive: !somenteLeitura,
        icon: L.divIcon({ className: 'vertice', iconSize: [16, 16] }),
      });
      vertice.on('dragend', () => {
        const ll = vertice.getLatLng();
        onMudarRef.current(pontosRef.current.map((p, j) => (j === i ? [ll.lat, ll.lng] : p)));
      });
      vertice.addTo(camada);
    });
  }, [pontos, somenteLeitura]);

  return <div ref={divRef} className="mapa" />;
}
