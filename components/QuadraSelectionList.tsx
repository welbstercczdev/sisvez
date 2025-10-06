import React, { useState, useMemo, useEffect } from 'react';
import { MapIcon, XIcon, EyeIcon } from './icons/IconComponents';
import QuadrasMapModal from './QuadrasMapModal';
import QuadraDetailModal from './QuadraDetailModal';

// Helper function to extract block ID from a feature
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

interface QuadraSelectionListProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    areaId?: string | null;
    readOnly?: boolean;
}

const QuadraSelectionList: React.FC<QuadraSelectionListProps> = ({ label, value, onChange, areaId, readOnly = false }) => {
    const [isMapModalOpen, setMapModalOpen] = useState(false);
    const [viewingQuadraFeature, setViewingQuadraFeature] = useState<any | null>(null);
    const [loadedAreas, setLoadedAreas] = useState<Map<string, any>>(new Map());
    const [loadingAreas, setLoadingAreas] = useState<Set<string>>(new Set());

    const quadras = useMemo(() => {
        return value.split(',').map(s => s.trim()).filter(Boolean);
    }, [value]);

    useEffect(() => {
        const quadraAreaIds = new Set(quadras.map(q => q.split('-')[0]).filter(Boolean));

        quadraAreaIds.forEach(areaIdToLoad => {
            if (!loadedAreas.has(areaIdToLoad) && !loadingAreas.has(areaIdToLoad)) {
                setLoadingAreas(prev => new Set(prev).add(areaIdToLoad));
                fetch(`https://mapa-dados-api.vercel.app/api/area/${areaIdToLoad}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to load area ${areaIdToLoad}`);
                        return res.json();
                    })
                    .then(data => {
                        setLoadedAreas(prev => new Map(prev).set(areaIdToLoad, data));
                    })
                    .catch(console.error)
                    .finally(() => {
                        setLoadingAreas(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(areaIdToLoad);
                            return newSet;
                        });
                    });
            }
        });
    }, [quadras, loadedAreas, loadingAreas]);

    const handleRemoveQuadra = (quadraToRemove: string) => {
        if (readOnly) return;
        const newQuadras = quadras.filter(q => q !== quadraToRemove).sort((a, b) => {
            const [areaA, blockA] = a.split('-').map(Number);
            const [areaB, blockB] = b.split('-').map(Number);
            if (areaA !== areaB) return areaA - areaB;
            return blockA - blockB;
        });
        onChange(newQuadras.join(', '));
    };

    const handleMapSave = (quadrasString: string) => {
        if (readOnly) return;
        onChange(quadrasString);
        setMapModalOpen(false); // Close modal on save
    };

    const handleViewDetails = (uniqueQuadraId: string) => {
        const [areaId, blockId] = uniqueQuadraId.split('-');
        const geoJsonData = loadedAreas.get(areaId);
        if (geoJsonData) {
            const feature = geoJsonData.features.find((f: any) => getFeatureBlockId(f) === blockId);
            if (feature) {
                setViewingQuadraFeature(feature);
            } else {
                alert(`Detalhes para a quadra ${blockId} na área ${areaId} não encontrados.`);
            }
        } else {
            alert(`Dados da área ${areaId} ainda não foram carregados. Tente novamente em alguns instantes.`);
        }
    };

    return (
        <>
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                    <div className={`w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm ${!readOnly ? 'focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
                        <div className="flex flex-wrap gap-1.5 min-h-[20px]">
                            {quadras.length > 0 ? (
                                quadras.map(uniqueId => {
                                    const parts = uniqueId.split('-');
                                    const displayText = parts.length === 2 ? `Área ${parts[0]} - Q ${parts[1]}` : uniqueId;
                                    return (
                                        <span key={uniqueId} className="flex items-center gap-1.5 bg-sky-100 dark:bg-sky-800 text-sky-800 dark:text-sky-200 text-xs font-medium pl-2 pr-1 py-1 rounded-full">
                                            {displayText}
                                            <button
                                                type="button"
                                                onClick={() => handleViewDetails(uniqueId)}
                                                className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                                                aria-label={`Ver detalhes da quadra ${displayText}`}
                                            >
                                                <EyeIcon className="w-3 h-3" />
                                            </button>
                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQuadra(uniqueId)}
                                                    className="text-sky-500 hover:text-sky-700 dark:hover:text-sky-300"
                                                    aria-label={`Remover quadra ${displayText}`}
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            )}
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-slate-400 dark:text-slate-500 text-sm px-1">Nenhuma quadra selecionada</span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMapModalOpen(true)}
                        className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md text-slate-600 dark:text-slate-300 flex-shrink-0"
                        aria-label="Selecionar quadras no mapa"
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <QuadrasMapModal
                isOpen={isMapModalOpen}
                onClose={() => setMapModalOpen(false)}
                initialSelectedQuadras={value}
                onSave={handleMapSave}
                initialAreaId={areaId}
                readOnly={readOnly}
            />
            <QuadraDetailModal
                isOpen={!!viewingQuadraFeature}
                onClose={() => setViewingQuadraFeature(null)}
                feature={viewingQuadraFeature}
            />
        </>
    );
};

export default QuadraSelectionList;