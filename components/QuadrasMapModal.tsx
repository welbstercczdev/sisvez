import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { XIcon, FullscreenIcon, FilterIcon, PlusIcon, LayersIcon, CircleIcon, XCircleIcon, GeoAltIcon, ShareIcon, ImportIcon, SearchIcon, PrinterIcon } from './icons/IconComponents';
import QuadraDetailModal from './QuadraDetailModal';
import AddAreaModal from './AddAreaModal';
import ShareMapModal from './ShareMapModal';
import ImportMapStateModal from './ImportMapStateModal';
import SearchAddressModal from './SearchAddressModal';
import PrintLayout from './PrintLayout';

// Declara o objeto global 'L' do Leaflet para o TypeScript
declare const L: any;

const areaColors = [
  "#3388ff", "#2ca02c", "#d62728", "#9467bd", "#ff7f0e", 
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

const defaultStyle = {
    color: "#3388ff",
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.2,
};

const selectedStyle = {
    color: "#ff6347", // Tomato color
    weight: 3,
    opacity: 1,
    fillOpacity: 0.5,
};

const getFeatureBlockId = (feature: any): string | null => {
    if (feature?.properties?.title) {
        const title = String(feature.properties.title);
        const parts = title.split(':');
        if (parts.length > 1) {
            return parts[1].trim();
        }
    }
    if (feature?.properties?.quadra_id) {
        return String(feature.properties.quadra_id);
    }
    return null;
};

const IMOVEIS_FILTER_OPTIONS: { [key: string]: string } = {
  'AP_ACIMA_1_ (NAO TRAB)': 'AP Acima 1 (Não Trab)',
  'AP_ACIMA_1_(TRAB)': 'AP Acima 1 (Trab)',
  'AP_ATE_1_ANDAR': 'AP Até 1 Andar',
  'JARDIM': 'Jardim',
  'NAO_RESID_1_ANDAR': 'Não Resid 1 Andar',
  'NAO_RESID_TERREO': 'Não Resid Térreo',
  'OBRAS': 'Obras',
  'PRACA': 'Praça',
  'RESID_TERREO': 'Resid Térreo',
  'TERRENO_BALDIO': 'Terreno Baldio',
};

interface QuadrasMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSelectedQuadras: string;
    onSave: (selectedQuadras: string) => void;
    initialAreaId?: string | null;
    readOnly?: boolean;
}

const pointInPolygon = (point: [number, number], vs: [number, number][]) => {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const QuadrasMapModal: React.FC<QuadrasMapModalProps> = ({ isOpen, onClose, initialSelectedQuadras, onSave, initialAreaId, readOnly = false }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const layerRefs = useRef<Map<string, any>>(new Map());
    const filterRef = useRef<HTMLDivElement>(null);
    const locationMarkerRef = useRef<any>(null);
    const searchMarkerRef = useRef<any>(null);
    const highlightLayerRef = useRef<any>(null);
    
    const [selectedQuadras, setSelectedQuadras] = useState<Set<string>>(new Set());
    const [loadedAreas, setLoadedAreas] = useState<Map<string, any>>(new Map());
    const [loadingStatus, setLoadingStatus] = useState<Map<string, 'loading' | 'loaded' | 'error'>>(new Map());
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [summary, setSummary] = useState({ totalArea: 0, totalImoveis: 0 });
    const [viewingQuadraFeature, setViewingQuadraFeature] = useState<any | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
    const [isCompactView, setIsCompactView] = useState(false);
    const [isRadiusMode, setIsRadiusMode] = useState(false);
    const [radius, setRadius] = useState(200); // Default radius in meters
    const radiusCircleLayer = useRef<any>(null);
    const [isRadiusCircleDrawn, setIsRadiusCircleDrawn] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isSearchAddressModalOpen, setIsSearchAddressModalOpen] = useState(false);
    const [shareData, setShareData] = useState('');
    const [imoveisFilter, setImoveisFilter] = useState<Set<string>>(new Set(Object.keys(IMOVEIS_FILTER_OPTIONS)));
    const [isPrinting, setIsPrinting] = useState(false);

    // Use refs to get latest state in callbacks without making them unstable
    const loadedAreasRef = useRef(loadedAreas);
    loadedAreasRef.current = loadedAreas;
    const loadingStatusRef = useRef(loadingStatus);
    loadingStatusRef.current = loadingStatus;
    
    const LABEL_ZOOM_THRESHOLD = 16;

    const areaColorMap = useMemo(() => {
        const map = new Map<string, string>();
        Array.from(loadedAreas.keys()).forEach((areaId, index) => {
            map.set(areaId, areaColors[index % areaColors.length]);
        });
        return map;
    }, [loadedAreas]);

    const handleZoom = useCallback(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const container = map.getContainer();
        if (map.getZoom() < LABEL_ZOOM_THRESHOLD) {
            container.classList.add('hide-quadra-labels');
        } else {
            container.classList.remove('hide-quadra-labels');
        }
    }, []);

    const findQuadraForLocation = useCallback((lat: number, lng: number): { feature: any, uniqueId: string } | null => {
        const point: [number, number] = [lng, lat]; // GeoJSON is [lng, lat]
        for (const [areaId, geoJsonData] of loadedAreasRef.current.entries()) {
            for (const feature of geoJsonData.features) {
                const blockId = getFeatureBlockId(feature);
                if (!blockId || !feature.geometry) continue;

                if (feature.geometry.type === 'Polygon') {
                    if (pointInPolygon(point, feature.geometry.coordinates[0])) {
                        return { feature, uniqueId: `${areaId}-${blockId}` };
                    }
                } else if (feature.geometry.type === 'MultiPolygon') {
                    for (const polygonCoords of feature.geometry.coordinates) {
                        if (pointInPolygon(point, polygonCoords[0])) {
                            return { feature, uniqueId: `${areaId}-${blockId}` };
                        }
                    }
                }
            }
        }
        return null;
    }, []);

    const handleFindMe = useCallback(() => {
        const map = mapInstanceRef.current;
        if (!map || !navigator.geolocation) {
            alert('A geolocalização não é suportada pelo seu navegador.');
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const latlng = { lat: latitude, lng: longitude };
                
                if (locationMarkerRef.current) map.removeLayer(locationMarkerRef.current);
                if (highlightLayerRef.current) map.removeLayer(highlightLayerRef.current);

                locationMarkerRef.current = L.marker(latlng).addTo(map)
                    .bindPopup('Sua localização atual').openPopup();
                
                map.setView(latlng, 18);

                const found = findQuadraForLocation(latitude, longitude);

                if (found) {
                    const { feature, uniqueId } = found;
                    const [areaId, blockId] = uniqueId.split('-');
                    alert(`Você está na quadra ${blockId} da área ${areaId}.`);

                    highlightLayerRef.current = L.geoJSON(feature, {
                        style: { ...selectedStyle, color: '#00ffff', fillColor: '#00ffff', weight: 4 }
                    }).addTo(map);

                } else {
                    alert('Sua localização atual não está dentro de nenhuma quadra carregada no mapa.');
                }

                setIsLocating(false);
            },
            (error) => {
                let message = 'Não foi possível obter sua localização.';
                switch (error.code) {
                    case error.PERMISSION_DENIED: message = 'Você negou o pedido de Geolocalização.'; break;
                    case error.POSITION_UNAVAILABLE: message = 'Informação de localização indisponível.'; break;
                    case error.TIMEOUT: message = 'O pedido para obter a localização do usuário expirou.'; break;
                }
                alert(message);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, [findQuadraForLocation]);

    const handleAddressSearch = useCallback((location: { lat: number, lon: number, displayName: string }) => {
        const map = mapInstanceRef.current;
        if (!map) return;
        
        const { lat, lon, displayName } = location;

        try {
            if (isNaN(lat) || isNaN(lon)) {
                alert('As coordenadas recebidas para o endereço são inválidas.');
                return;
            }
            
            const latlng = { lat, lon };

            if (searchMarkerRef.current) map.removeLayer(searchMarkerRef.current);
            searchMarkerRef.current = L.marker(latlng).addTo(map)
                .bindPopup(`<b>Endereço Encontrado:</b><br>${displayName}`).openPopup();
            
            map.setView(latlng, 18);

            if (highlightLayerRef.current) map.removeLayer(highlightLayerRef.current);
            const found = findQuadraForLocation(lat, lon);
            if (found) {
                highlightLayerRef.current = L.geoJSON(found.feature, {
                    style: { ...selectedStyle, color: '#00ffff', fillColor: '#00ffff', weight: 4 }
                }).addTo(map);
            }

            setIsSearchAddressModalOpen(false);
        } catch (error) {
            console.error('Error processing address:', error);
            alert(`Ocorreu um erro ao processar o endereço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }, [findQuadraForLocation]);

    const handleRemoveQuadra = (quadraId: string) => {
        if (readOnly) return;
        setSelectedQuadras(prev => {
            const newSelection = new Set(prev);
            newSelection.delete(quadraId);
            return newSelection;
        });
    };
    
    const handleViewDetails = (uniqueQuadraId: string) => {
        const [areaId, blockId] = uniqueQuadraId.split('-');
        const geoJsonData = loadedAreas.get(areaId);
        if (geoJsonData) {
            const feature = geoJsonData.features.find((f: any) => getFeatureBlockId(f) === blockId);
            if (feature) {
                setViewingQuadraFeature(feature);
            }
        }
    };

    const fetchArea = useCallback(async (areaId: string) => {
        setLoadingStatus(prev => new Map(prev).set(areaId, 'loading'));
        try {
            const response = await fetch(`https://mapa-dados-api.vercel.app/api/area/${areaId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setLoadedAreas(prev => new Map(prev).set(areaId, data));
            setLoadingStatus(prev => new Map(prev).set(areaId, 'loaded'));
        } catch (err) {
            console.error(`Fetch error for area ${areaId}:`, err);
            setLoadingStatus(prev => new Map(prev).set(areaId, 'error'));
        }
    }, []);

    const handleAddAreas = useCallback((areaIds: string[]) => {
        areaIds.forEach(id => {
            if (!loadedAreasRef.current.has(id) && loadingStatusRef.current.get(id) !== 'loading') {
                fetchArea(id);
            }
        });
    }, [fetchArea]);

    const handleRemoveArea = (areaId: string) => {
        setLoadedAreas(prev => {
            const newMap = new Map(prev);
            newMap.delete(areaId);
            return newMap;
        });
        setLoadingStatus(prev => {
            const newMap = new Map(prev);
            newMap.delete(areaId);
            return newMap;
        });
        // Remove associated selected quadras
        setSelectedQuadras(prev => {
            const newSelection = new Set<string>();
            prev.forEach(id => {
                if (!id.startsWith(`${areaId}-`)) {
                    newSelection.add(id);
                }
            });
            return newSelection;
        });
    };

    const handleClearRadius = () => {
        const map = mapInstanceRef.current;
        if (map && radiusCircleLayer.current) {
            map.removeLayer(radiusCircleLayer.current);
            radiusCircleLayer.current = null;
            setIsRadiusCircleDrawn(false);
        }
    };

    const handleMapClickForRadius = useCallback((e: any) => {
        const map = mapInstanceRef.current;
        if (!map || readOnly) return;
        
        const { latlng } = e;
    
        // Clear previous circle if it exists
        if (radiusCircleLayer.current) {
            map.removeLayer(radiusCircleLayer.current);
        }
    
        // Draw the new circle as a visual guide
        const circle = L.circle(latlng, { 
            radius,
            color: 'red',
            dashArray: '5, 5',
            fillOpacity: 0.1
        }).addTo(map);
        radiusCircleLayer.current = circle;
    
        // Deactivate radius mode to allow normal block selection
        setIsRadiusMode(false);
        setIsRadiusCircleDrawn(true);
    }, [radius, readOnly]);

    const handleShare = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
    
        const stateToShare = {
            loadedAreaIds: Array.from(loadedAreas.keys()),
            selectedQuadraIds: Array.from(selectedQuadras),
            center: map.getCenter(),
            zoom: map.getZoom(),
        };
    
        setShareData(JSON.stringify(stateToShare));
        setIsShareModalOpen(true);
    };
    
    const handleLoadState = (stateJson: string) => {
        try {
            const state = JSON.parse(stateJson);
            const { loadedAreaIds, selectedQuadraIds, center, zoom } = state;
            
            if (!Array.isArray(loadedAreaIds) || !Array.isArray(selectedQuadraIds) || !center || typeof zoom !== 'number') {
                throw new Error('Invalid state format');
            }
    
            handleAddAreas(loadedAreaIds);
            setSelectedQuadras(new Set(selectedQuadraIds));
            if(mapInstanceRef.current) {
                mapInstanceRef.current.setView(center, zoom);
            }
    
            setIsImportModalOpen(false);
        } catch (e) {
            alert('Falha ao carregar o estado: Dados inválidos ou corrompidos.');
            console.error("Failed to load map state:", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const initialIds = initialSelectedQuadras.split(',').map(s => s.trim()).filter(Boolean);
            setSelectedQuadras(new Set(initialIds));
            if (initialAreaId) {
                handleAddAreas([initialAreaId]);
            }
        } else {
            // Reset state on close
            if (mapInstanceRef.current) {
                if (radiusCircleLayer.current) mapInstanceRef.current.removeLayer(radiusCircleLayer.current);
                if (locationMarkerRef.current) mapInstanceRef.current.removeLayer(locationMarkerRef.current);
                if (highlightLayerRef.current) mapInstanceRef.current.removeLayer(highlightLayerRef.current);
                if (searchMarkerRef.current) mapInstanceRef.current.removeLayer(searchMarkerRef.current);
                radiusCircleLayer.current = null;
                locationMarkerRef.current = null;
                highlightLayerRef.current = null;
                searchMarkerRef.current = null;
            }
            setLoadedAreas(new Map());
            setLoadingStatus(new Map());
            setIsFullScreen(false);
            setViewingQuadraFeature(null);
            setIsAddAreaModalOpen(false);
            setIsCompactView(false);
            setIsRadiusMode(false);
            setIsRadiusCircleDrawn(false);
        }
    }, [isOpen, initialSelectedQuadras, initialAreaId, handleAddAreas]);
    
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    
    useEffect(() => {
        if (!isOpen) return;
        let totalArea = 0;
        let totalImoveis = 0;
        selectedQuadras.forEach(uniqueId => {
            const [areaId, blockId] = uniqueId.split('-');
            const geoJsonData = loadedAreas.get(areaId);
            if (geoJsonData) {
                const feature = geoJsonData.features.find((f: any) => getFeatureBlockId(f) === blockId);
                if (feature) {
                    const props = feature.properties;
                    totalArea += Number(props.area_m2) || 0;
                    totalImoveis += Object.keys(IMOVEIS_FILTER_OPTIONS).reduce((sum, key) => {
                        return imoveisFilter.has(key) ? sum + (Number(props[key]) || 0) : sum;
                    }, 0);
                }
            }
        });
        setSummary({ totalArea, totalImoveis });
    }, [selectedQuadras, loadedAreas, imoveisFilter, isOpen]);
    
    useEffect(() => {
        let map: any;
        let resizeObserver: ResizeObserver;
    
        if (isOpen && mapContainerRef.current) {
            map = L.map(mapContainerRef.current, { center: [-23.2237, -45.9009], zoom: 15, zoomControl: true });
            mapInstanceRef.current = map;
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
            
            map.on('zoomend', handleZoom);
            handleZoom(); // Initial check
    
            resizeObserver = new ResizeObserver(() => {
                if(mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            });
            resizeObserver.observe(mapContainerRef.current);
        }
    
        return () => {
            if (map) {
                map.off('zoomend', handleZoom);
                resizeObserver.disconnect();
                map.remove();
            }
            mapInstanceRef.current = null;
            layerRefs.current.clear();
        };
    }, [isOpen, handleZoom]);
    
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isOpen) return;
    
        if (isRadiusMode && !readOnly) {
            map.on('click', handleMapClickForRadius);
        } else {
            map.off('click', handleMapClickForRadius);
        }
        return () => {
            if (map) {
                map.off('click', handleMapClickForRadius);
            }
        };
    }, [isOpen, isRadiusMode, readOnly, handleMapClickForRadius]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isOpen) return;
        const container = map.getContainer();
    
        if (isRadiusMode && !readOnly) {
            L.DomUtil.addClass(container, 'crosshair-cursor');
        } else {
            L.DomUtil.removeClass(container, 'crosshair-cursor');
        }
    }, [isOpen, isRadiusMode, readOnly]);

    useEffect(() => {
        if (!mapInstanceRef.current || !isOpen) return;
        const map = mapInstanceRef.current;
        const currentLayerIds = new Set(layerRefs.current.keys());
        const loadedAreaIds = new Set(loadedAreas.keys());

        // Add new layers
        loadedAreaIds.forEach(areaId => {
            if (!currentLayerIds.has(areaId)) {
                const geoJsonData = loadedAreas.get(areaId);
                const areaColor = areaColorMap.get(areaId) || '#3388ff';
                const defaultAreaStyle = { ...defaultStyle, color: areaColor };
                
                const layer = L.geoJSON(geoJsonData, {
                    style: (feature) => {
                        const blockId = getFeatureBlockId(feature);
                        const uniqueId = `${areaId}-${blockId}`;
                        return selectedQuadras.has(uniqueId) ? selectedStyle : defaultAreaStyle;
                    },
                    onEachFeature: (feature, layer) => {
                        const blockId = getFeatureBlockId(feature);
                        if (!blockId) return;

                        const uniqueId = `${areaId}-${blockId}`;
                        
                        // Permanent tooltip for high zoom levels, controlled by CSS
                        layer.bindTooltip(blockId, { direction: 'center', className: 'quadra-label', permanent: true });
                        
                        layer.on({
                            click: () => {
                                if (readOnly) return;
                                setSelectedQuadras(p => {
                                    const n = new Set(p);
                                    n.has(uniqueId) ? n.delete(uniqueId) : n.add(uniqueId);
                                    return n;
                                })
                            }
                        });
                    }
                }).addTo(map);
                layerRefs.current.set(areaId, layer);
            }
        });

        // Remove old layers
        currentLayerIds.forEach(areaId => {
            if (!loadedAreaIds.has(areaId)) {
                const layer = layerRefs.current.get(areaId);
                if (layer) map.removeLayer(layer);
                layerRefs.current.delete(areaId);
            }
        });

        // Fit bounds
        const allBounds = Array.from(layerRefs.current.values()).map(l => l.getBounds()).filter(b => b.isValid());
        if (allBounds.length > 0) {
            const group = new L.featureGroup(allBounds.map(b => L.rectangle(b)));
            if (group.getBounds().isValid()) map.fitBounds(group.getBounds().pad(0.1));
        }
    }, [isOpen, loadedAreas, readOnly, areaColorMap]); // Added readOnly dependency
    
    useEffect(() => {
        if (mapInstanceRef.current) setTimeout(() => mapInstanceRef.current.invalidateSize(), 310);
    }, [isFullScreen, isCompactView]);

    useEffect(() => {
        if (!isOpen) return;
        
        layerRefs.current.forEach((layer, areaId) => {
            const areaColor = areaColorMap.get(areaId) || '#3388ff';
            const defaultAreaStyle = { ...defaultStyle, color: areaColor };
            
            layer.eachLayer((featureLayer: any) => {
                const blockId = getFeatureBlockId(featureLayer.feature);
                if (blockId) {
                    const uniqueId = `${areaId}-${blockId}`;
                    featureLayer.setStyle(selectedQuadras.has(uniqueId) ? selectedStyle : defaultAreaStyle);
                }
            });
        });
    }, [selectedQuadras, isOpen, areaColorMap]);

    const handleSaveSelection = () => {
        const sortedQuadras = Array.from(selectedQuadras).sort((a, b) => {
            const [areaA, blockA] = a.split('-').map(Number);
            const [areaB, blockB] = b.split('-').map(Number);
            if (areaA !== areaB) return areaA - areaB;
            return blockA - blockB;
        });
        onSave(sortedQuadras.join(', '));
        onClose();
    };

    const handleFilterToggle = (key: string) => setImoveisFilter(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
    const handleSelectAllFilters = () => setImoveisFilter(new Set(Object.keys(IMOVEIS_FILTER_OPTIONS)));
    const handleClearAllFilters = () => setImoveisFilter(new Set());

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                <div className={`bg-white dark:bg-slate-800 shadow-2xl flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in ${isFullScreen ? 'w-full h-full max-w-full max-h-full rounded-none' : 'w-full max-w-4xl h-[85vh] rounded-xl'}`}>
                    <div className={`flex-shrink-0 border-b border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out ${isCompactView ? 'max-h-0 p-0 border-b-0 overflow-hidden opacity-0' : 'max-h-20 p-2 sm:p-3'}`}>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Selecionar Quadras no Mapa</h2>
                    </div>
                    <div className="flex-grow relative bg-slate-200 dark:bg-slate-900">
                        {Array.from(loadingStatus.entries()).some(([,s]) => s === 'loading') && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black/50 text-white text-xs px-3 py-1 rounded-full animate-pulse">Carregando áreas...</div>}
                        {Array.from(loadingStatus.entries()).some(([,s]) => s === 'error') && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white text-xs px-3 py-1 rounded-full">Erro ao carregar uma ou mais áreas.</div>}
                        <div ref={mapContainerRef} className="w-full h-full" />
                         <div className="absolute top-2 right-2 z-[1000] flex flex-col space-y-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-md shadow-lg">
                            <button title="Imprimir Mapa" onClick={() => setIsPrinting(true)} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                <PrinterIcon className="w-5 h-5" />
                            </button>
                            <button title="Compartilhar Mapa" onClick={handleShare} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                <ShareIcon className="w-5 h-5" />
                             </button>
                             <button title="Buscar Endereço" onClick={() => setIsSearchAddressModalOpen(true)} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                <SearchIcon className="w-5 h-5" />
                             </button>
                             <button
                                title="Onde estou?"
                                onClick={handleFindMe}
                                disabled={isLocating}
                                className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-wait"
                             >
                                <GeoAltIcon className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
                             </button>
                             {!readOnly && (
                                <button
                                    title="Selecionar por Raio"
                                    onClick={() => setIsRadiusMode(p => !p)}
                                    className={`p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded ${isRadiusMode ? 'bg-sky-200 dark:bg-sky-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    <CircleIcon className="w-5 h-5" />
                                </button>
                             )}
                             {isRadiusCircleDrawn && (
                                 <button
                                    title="Limpar Raio"
                                    onClick={handleClearRadius}
                                    className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                                 >
                                    <XCircleIcon className="w-5 h-5" />
                                 </button>
                             )}
                             <button title="Alternar Painéis" onClick={() => setIsCompactView(p => !p)} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                <LayersIcon className="w-5 h-5" />
                             </button>
                             <button title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"} onClick={() => setIsFullScreen(p => !p)} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                <FullscreenIcon className="w-5 h-5" />
                             </button>
                             <button title="Fechar" onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                <XIcon className="w-5 h-5" />
                             </button>
                        </div>
                        {!readOnly && (
                          <>
                            <button onClick={() => setIsAddAreaModalOpen(true)} className="absolute bottom-4 left-4 z-20 flex items-center justify-center w-10 h-10 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform hover:scale-105" title="Adicionar Área">
                                <PlusIcon className="w-6 h-6"/>
                            </button>
                            <button onClick={() => setIsImportModalOpen(true)} className="absolute bottom-4 left-16 z-20 flex items-center justify-center w-10 h-10 bg-slate-600 text-white rounded-full shadow-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-transform hover:scale-105" title="Importar Estado do Mapa">
                                <ImportIcon className="w-5 h-5"/>
                            </button>
                          </>
                        )}
                    </div>
                    <div className={`flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out ${isCompactView ? 'max-h-0 p-0 border-t-0 overflow-hidden opacity-0' : 'max-h-96 p-2 sm:p-3 space-y-2'}`}>
                        <div>
                             <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Áreas Carregadas:</p>
                             <div className="flex flex-wrap gap-1.5">
                                {loadedAreas.size > 0 ? Array.from(loadedAreas.keys()).map((id) => {
                                    const color = areaColorMap.get(id);
                                    return (
                                        <span key={id} className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium pl-2 pr-1 py-1 rounded-full">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                                            Área {id}
                                            {!readOnly && <button type="button" onClick={() => handleRemoveArea(id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label={`Remover área ${id}`}><XIcon className="w-3 h-3" /></button>}
                                        </span>
                                    );
                                }) : <span className="text-slate-400 dark:text-slate-500 text-xs px-1 italic">Nenhuma área carregada</span>}
                             </div>
                        </div>
                        <div className="flex justify-between items-start flex-wrap gap-x-4 gap-y-2">
                            <div className="flex-grow">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Quadras Selecionadas ({selectedQuadras.size}):</p>
                                <div className="h-14 overflow-y-auto rounded-md bg-slate-100 dark:bg-slate-900/50 p-1.5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedQuadras.size > 0 ? Array.from(selectedQuadras).sort((a,b)=>{
                                            const [areaA, blockA] = a.split('-').map(Number);
                                            const [areaB, blockB] = b.split('-').map(Number);
                                            if (areaA !== areaB) return areaA - areaB;
                                            return blockA - blockB;
                                        }).map(uniqueId => {
                                            const [area, block] = uniqueId.split('-');
                                            return (
                                                <span key={uniqueId} className="flex items-center gap-1.5 bg-sky-100 dark:bg-sky-800 text-sky-800 dark:text-sky-200 text-xs font-medium pl-2 pr-1 py-1 rounded-full">
                                                    <button type="button" onClick={()=>handleViewDetails(uniqueId)} className="hover:underline focus:outline-none">
                                                        Área {area} - Q {block}
                                                    </button>
                                                    {!readOnly && <button type="button" onClick={()=>handleRemoveQuadra(uniqueId)} className="text-sky-500 hover:text-sky-700 dark:hover:text-sky-300" aria-label={`Remover quadra ${uniqueId}`}><XIcon className="w-3 h-3"/></button>}
                                                </span>
                                            )
                                        }) : <span className="text-slate-400 dark:text-slate-500 text-sm px-1 italic">Nenhuma quadra selecionada</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-end gap-4 text-sm text-right">
                                {!readOnly && (
                                    <div>
                                        <label htmlFor="radius-input" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left mb-1">Raio de Seleção</label>
                                        <div className="flex items-center">
                                            <input
                                                id="radius-input"
                                                type="number"
                                                value={radius}
                                                onChange={(e) => setRadius(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                                className="w-20 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-l-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500 text-center"
                                            />
                                            <span className="px-2 py-[7px] bg-slate-100 dark:bg-slate-700/50 border-t border-b border-r border-slate-300 dark:border-slate-600 rounded-r-md text-slate-600 dark:text-slate-300">m</span>
                                        </div>
                                    </div>
                                )}
                                <div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Área Total</p><p className="font-bold text-slate-800 dark:text-slate-100">{summary.totalArea.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²</p></div>
                                <div className="relative" ref={filterRef}>
                                    <div className="flex items-center gap-2"><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total de Imóveis</p><p className="font-bold text-slate-800 dark:text-slate-100">{summary.totalImoveis.toLocaleString('pt-BR')}</p><button onClick={()=>setIsFilterOpen(!isFilterOpen)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Filtrar total de imóveis"><FilterIcon className="w-4 h-4"/></button></div>
                                    {isFilterOpen && <div className="absolute bottom-full right-0 mb-2 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-30 p-3"><div className="flex justify-between items-center mb-2"><button onClick={handleSelectAllFilters} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">Selecionar Todos</button><button onClick={handleClearAllFilters} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">Limpar Seleção</button></div><div className="space-y-1 max-h-48 overflow-y-auto">{Object.entries(IMOVEIS_FILTER_OPTIONS).map(([k,l])=><label key={k} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"><input type="checkbox" checked={imoveisFilter.has(k)} onChange={()=>handleFilterToggle(k)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"/>{l}</label>)}</div></div>}
                                </div>
                            </div>
                        </div>
                        {!readOnly && (
                            <div className="flex justify-end pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                <button onClick={handleSaveSelection} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Salvar Seleção</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isPrinting && mapInstanceRef.current && (
                <PrintLayout
                    onDone={() => setIsPrinting(false)}
                    loadedAreas={loadedAreas}
                    selectedQuadras={selectedQuadras}
                    summary={summary}
                    mapCenter={mapInstanceRef.current.getCenter()}
                    mapZoom={mapInstanceRef.current.getZoom()}
                    areaColors={areaColorMap}
                />
            )}
            <QuadraDetailModal isOpen={!!viewingQuadraFeature} onClose={() => setViewingQuadraFeature(null)} feature={viewingQuadraFeature}/>
            <AddAreaModal isOpen={isAddAreaModalOpen} onClose={() => setIsAddAreaModalOpen(false)} onAddAreas={handleAddAreas} alreadyLoadedIds={Array.from(loadedAreas.keys())} />
            <ShareMapModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} shareData={shareData} />
            <ImportMapStateModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onLoad={handleLoadState} />
            <SearchAddressModal 
                isOpen={isSearchAddressModalOpen}
                onClose={() => setIsSearchAddressModalOpen(false)}
                onSearch={handleAddressSearch}
            />
            <style>{`.animate-scale-in{animation:scale-in .2s ease-out forwards}@keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}.quadra-label{background-color:hsla(0,0%,100%,.75);border:1px solid rgba(0,0,0,.2);border-radius:4px;box-shadow:none;color:#333;font-weight:700;font-size:11px;padding:2px 5px;text-shadow:none}.leaflet-tooltip-pane .quadra-label{transition:opacity .2s ease-in-out}.hide-quadra-labels .quadra-label{display:none!important}.crosshair-cursor{cursor:crosshair!important}`}</style>
        </>
    );
};

export default QuadrasMapModal;