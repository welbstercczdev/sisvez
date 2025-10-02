import React, { useEffect, useMemo } from 'react';
import { XIcon } from './icons/IconComponents';
import { Agrupamento } from '../types';
import MapComponent from './MapComponent';

// Declare Leaflet global object for TypeScript
declare const L: any;

interface AgrupamentosMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    agrupamentos: Agrupamento[];
}

const AgrupamentosMapModal: React.FC<AgrupamentosMapModalProps> = ({ isOpen, onClose, agrupamentos }) => {

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const { baseLayers, overlays, mapCenter } = useMemo(() => {
        const baseLayers = {
            'Padrão': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                updateWhenIdle: true,
            }),
            'Satélite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri',
                updateWhenIdle: true,
            }),
        };

        const markers = agrupamentos
            .map(agrupamento => {
                const lat = parseFloat(agrupamento.latitude);
                const lng = parseFloat(agrupamento.longitude);

                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    const popupContent = `
                        <div class="text-sm">
                            <h3 class="font-bold text-base mb-1">${agrupamento.nome}</h3>
                            <p><strong>Região:</strong> ${agrupamento.regiao}</p>
                            <p><strong>Notificações:</strong> ${agrupamento.totalNotificacoes}</p>
                            <p><strong>Pontuação:</strong> ${agrupamento.pontuacaoTotal}</p>
                        </div>
                    `;
                    return L.marker([lat, lng]).bindPopup(popupContent);
                }
                return null;
            })
            // FIX: Replaced 'L.Marker' with 'any' in the type guard to resolve "Cannot find namespace 'L'" error.
            .filter((marker): marker is any => marker !== null);
        
        const overlays = {
            'Agrupamentos': L.layerGroup(markers),
        };
        
        let mapCenter: [number, number] = [-23.2237, -45.9009]; // Default center for SJC
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            const bounds = group.getBounds();
            if (bounds.isValid()) {
                mapCenter = bounds.getCenter();
            }
        }

        return { baseLayers, overlays, mapCenter };
    }, [agrupamentos]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Mapa de Agrupamentos</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-2 flex-grow relative bg-slate-200 dark:bg-slate-900 rounded-b-lg">
                    {isOpen && (
                         <MapComponent 
                            center={mapCenter} 
                            zoom={12}
                            baseLayers={baseLayers}
                            overlays={overlays}
                        />
                    )}
                </div>
            </div>
            {/* Simple animation for modal entrance */}
            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AgrupamentosMapModal;