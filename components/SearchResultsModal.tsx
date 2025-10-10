import React, { useEffect } from 'react';
import { XIcon, EyeIcon, TrashIcon, PencilIcon, ClusterIcon } from './icons/IconComponents';
import { Atividade } from '../types';

interface SearchResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: Atividade[];
    onView: (item: Atividade) => void;
    onEdit: (item: Atividade) => void;
    onDelete: (item: Atividade) => void;
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ isOpen, onClose, results, onView, onEdit, onDelete }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            {/* --- Container do Modal --- */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                
                {/* --- Cabeçalho do Modal --- */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Resultados da Pesquisa ({results.length})</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {/* --- Corpo do Modal (com scroll) --- */}
                <div className="p-4 sm:p-6 overflow-y-auto">
                   {results.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            Nenhum resultado encontrado.
                        </div>
                   ) : (
                        <div className="space-y-4">
                            {/* CABEÇALHO DA TABELA (Visível apenas em telas grandes: md e acima) */}
                            <div className="hidden md:grid grid-cols-[1fr,2fr,1fr,1fr,1fr,1fr,1fr] gap-4 px-4 font-semibold text-sm text-slate-600 dark:text-slate-400">
                                <div className="py-2">ID</div>
                                <div className="py-2">Paciente</div>
                                <div className="py-2">Agravo</div>
                                <div className="py-2">Data Notificação</div>
                                <div className="py-2">Bairro</div>
                                <div className="py-2">Região</div>
                                <div className="py-2 text-center">Ações</div>
                            </div>

                            {/* LISTA DE RESULTADOS (Cards em telas pequenas, Linhas em telas grandes) */}
                            {results.map((item, index) => (
                                <div 
                                    key={item.ID || index} 
                                    className={`rounded-lg p-4 transition-colors duration-150 
                                        md:grid md:grid-cols-[1fr,2fr,1fr,1fr,1fr,1fr,1fr] md:gap-4 md:items-center md:rounded-none md:px-4 md:py-3 md:bg-transparent
                                        ${item.isAgrupamento 
                                            ? 'bg-sky-100 dark:bg-sky-900/50 md:hover:bg-sky-200/40 dark:md:hover:bg-sky-900/60 border-l-4 border-sky-500' 
                                            : 'bg-slate-50 dark:bg-slate-800/50 md:hover:bg-slate-100 dark:md:hover:bg-slate-700/50 border-l-4 border-transparent'
                                        }`
                                    }
                                >
                                    {/* ID */}
                                    <div className="flex justify-between items-center text-sm md:block">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 md:hidden">ID:</span>
                                        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                            {item.isAgrupamento && <ClusterIcon className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" title="Faz parte de um agrupamento" />}
                                            <span>{item.ID}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Paciente */}
                                    <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 md:mt-0 md:pt-0 md:border-0">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 md:hidden">Paciente:</span>
                                        <span className="text-right md:text-left">{item.PAC_NOME}</span>
                                    </div>

                                    {/* Agravo */}
                                    <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 md:mt-0 md:pt-0 md:border-0">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 md:hidden">Agravo:</span>
                                        <span className="text-right md:text-left">{item.AGRAVO}</span>
                                    </div>
                                    
                                    {/* Data Notificação */}
                                    <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 md:mt-0 md:pt-0 md:border-0">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 md:hidden">Data Notif.:</span>
                                        <span className="text-right md:text-left">{item.NOTIF_DT}</span>
                                    </div>

                                    {/* Bairro */}
                                    <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 md:mt-0 md:pt-0 md:border-0">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 md:hidden">Bairro:</span>
                                        <span className="text-right md:text-left">{item.PAC_BAIR}</span>
                                    </div>

                                    {/* Região */}
                                    <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 md:mt-0 md:pt-0 md:border-0">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 md:hidden">Região:</span>
                                        <span className="text-right md:text-left">{item.PAC_REG}</span>
                                    </div>
                                    
                                    {/* Ações */}
                                    <div className="flex items-center justify-end space-x-4 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700 md:mt-0 md:pt-0 md:border-0">
                                        <button onClick={() => onView(item)} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300" aria-label={`Visualizar ${item.PAC_NOME}`}>
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onEdit(item)} className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300" aria-label={`Editar ${item.PAC_NOME}`}>
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Excluir ${item.PAC_NOME}`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                   )}
                </div>
                
                {/* --- Rodapé do Modal --- */}
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl flex-shrink-0">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            {/* Animação de entrada */}
            <style>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default SearchResultsModal;