import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import NumberInputSpinner from './NumberInputSpinner';

interface FecharQuadraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quadraId: string, data: { trabalhado: number; fechado: number; desabitado: number; recusado: number }) => void;
    quadraId: string | null;
    initialData?: { trabalhado: number; fechado: number; desabitado: number; recusado: number };
}

const FecharQuadraModal: React.FC<FecharQuadraModalProps> = ({ isOpen, onClose, onSave, quadraId, initialData }) => {
    const [trabalhado, setTrabalhado] = useState(0);
    const [fechado, setFechado] = useState(0);
    const [desabitado, setDesabitado] = useState(0);
    const [recusado, setRecusado] = useState(0);

    useEffect(() => {
        if (isOpen && initialData) {
            setTrabalhado(initialData.trabalhado || 0);
            setFechado(initialData.fechado || 0);
            setDesabitado(initialData.desabitado || 0);
            setRecusado(initialData.recusado || 0);
        } else if (isOpen) {
            setTrabalhado(0);
            setFechado(0);
            setDesabitado(0);
            setRecusado(0);
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSaveClick = () => {
        if (quadraId) {
            onSave(quadraId, { trabalhado, fechado, desabitado, recusado });
        }
    };
    
    if (!isOpen || !quadraId) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Fechamento da Quadra: {quadraId}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="trabalhado" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imóveis Trabalhados</label>
                        <NumberInputSpinner id="trabalhado" value={trabalhado} onChange={setTrabalhado} min={0} />
                    </div>
                    <div>
                        <label htmlFor="fechado" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imóveis Fechados</label>
                        <NumberInputSpinner id="fechado" value={fechado} onChange={setFechado} min={0} />
                    </div>
                    <div>
                        <label htmlFor="desabitado" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imóveis Desabitados</label>
                        <NumberInputSpinner id="desabitado" value={desabitado} onChange={setDesabitado} min={0} />
                    </div>
                    <div>
                        <label htmlFor="recusado" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imóveis Recusados</label>
                        <NumberInputSpinner id="recusado" value={recusado} onChange={setRecusado} min={0} />
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancelar</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Salvar</button>
                </div>
                <style>{`@keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }`}</style>
            </div>
        </div>
    );
};

export default FecharQuadraModal;