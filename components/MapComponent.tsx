import React, { useEffect, useRef } from 'react';

// Declara o objeto global 'L' do Leaflet para o TypeScript
declare const L: any;

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  baseLayers?: Record<string, any>;
  overlays?: Record<string, any>;
}

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, baseLayers, overlays }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let resizeObserver: ResizeObserver;
    
    // Garante que o container do mapa está disponível e que o mapa ainda não foi inicializado
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Define a camada base padrão caso nenhuma seja fornecida
      const defaultBaseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        updateWhenIdle: true
      });

      const initialLayers = [baseLayers ? Object.values(baseLayers)[0] : defaultBaseLayer];

      // Exibir "Agrupamentos" ou "Casos Confirmados" por padrão se existirem e tiverem marcadores.
      if (overlays) {
        if (overlays['Agrupamentos'] && overlays['Agrupamentos'].getLayers().length > 0) {
            initialLayers.push(overlays['Agrupamentos']);
        } else if (overlays['Casos Confirmados'] && overlays['Casos Confirmados'].getLayers().length > 0) {
            initialLayers.push(overlays['Casos Confirmados']);
        }
      }


      // Inicializa o mapa com a primeira camada base fornecida ou a padrão
      const map = L.map(mapContainerRef.current, {
          zoomControl: false, // Desabilita o controle de zoom padrão
          layers: initialLayers
      }).setView(center, zoom);
      
      mapInstanceRef.current = map;

      // Adiciona o controle de camadas se alguma camada for fornecida
      if (baseLayers || overlays) {
        L.control.layers(baseLayers, overlays, { position: 'topright' }).addTo(map);
      }
      
      // Use ResizeObserver to automatically invalidate size when container changes.
      // This is more robust than setTimeout for handling animations and layout shifts.
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    // Função de limpeza para ser executada quando o componente for desmontado
    return () => {
      if (resizeObserver) {
        // disconnect() is used instead of unobserve() for a full cleanup
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only run on mount and unmount

  // This effect handles updates to props like center and zoom if the component is not remounted
  useEffect(() => {
    if(mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);


  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapComponent;
