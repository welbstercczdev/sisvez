import React, { useState } from 'react';
import { XIcon } from './icons/IconComponents';

interface ImportMapStateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (stateJson: string) => void;
}

const ImportMapStateModal: React.FC<ImportMapStateModalProps> = ({ isOpen, onClose, onLoad }) => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const handleLoad = () => {
        if (!text.trim()) {
            setError('Por favor, cole os dados do mapa.');
            return;
        }
        try {
            // Basic validation
            JSON.parse(text);
            setError('');
            onLoad(text);
        } catch (e) {
            setError('Os dados fornecidos são inválidos. Verifique se copiou o texto completo.');
        }
    };

    const handleClose = () => {
        setText('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Importar Estado do Mapa</h2>
                    <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Cole os dados do mapa compartilhados na área de texto abaixo para carregar a visualização.</p>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Cole os dados aqui..."
                        className="w-full h-32 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 resize-y"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                        Cancelar
                    </button>
                    <button onClick={handleLoad} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">
                        Carregar Mapa
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ImportMapStateModal;
