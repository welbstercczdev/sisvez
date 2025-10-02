import React, { useState, useMemo, useEffect } from 'react';
import { XIcon, SearchIcon } from './icons/IconComponents';

const AVAILABLE_AREA_IDS = [
    ...Array.from({ length: 42 }, (_, i) => String(i + 1)),
    ...Array.from({ length: 9 }, (_, i) => String(i + 101)),
];

interface AddAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAreas: (areaIds: string[]) => void;
    alreadyLoadedIds: string[];
}

const AddAreaModal: React.FC<AddAreaModalProps> = ({ isOpen, onClose, onAddAreas, alreadyLoadedIds }) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelected(new Set());
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        return AVAILABLE_AREA_IDS.filter(id => id.includes(searchTerm));
    }, [searchTerm]);
    
    const handleToggleSelection = (id: string) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleAdd = () => {
        onAddAreas(Array.from(selected));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Adicionar Áreas</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                     <div className="relative">
                        <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar área..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm pl-9 p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md p-2 space-y-1">
                        {filteredOptions.map(id => {
                            const isLoaded = alreadyLoadedIds.includes(id);
                            return (
                                <label key={id} className={`flex items-center gap-3 p-2 rounded-md transition-colors ${isLoaded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selected.has(id)}
                                        disabled={isLoaded}
                                        onChange={() => handleToggleSelection(id)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Área {id}</span>
                                    {isLoaded && <span className="text-xs text-slate-400 dark:text-slate-500">(Já carregada)</span>}
                                </label>
                            );
                        })}
                         {filteredOptions.length === 0 && <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">Nenhuma área encontrada.</p>}
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancelar</button>
                    <button onClick={handleAdd} disabled={selected.size === 0} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 disabled:opacity-50">Adicionar ({selected.size})</button>
                </div>
            </div>
             <style>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AddAreaModal;