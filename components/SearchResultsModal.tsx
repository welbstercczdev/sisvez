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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Resultados da Pesquisa</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <div className="overflow-x-auto relative">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="py-3 px-6">ID</th>
                                    <th scope="col" className="py-3 px-6">Paciente</th>
                                    <th scope="col" className="py-3 px-6">Agravo</th>
                                    <th scope="col" className="py-3 px-6">Data Notificação</th>
                                    <th scope="col" className="py-3 px-6">Data Sintomas</th>
                                    <th scope="col" className="py-3 px-6">Bairro</th>
                                    <th scope="col" className="py-3 px-6">Região</th>
                                    <th scope="col" className="py-3 px-6 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.length > 0 ? results.map((item, index) => (
                                    <tr 
                                        key={item.ID || index} 
                                        className={`border-b dark:border-slate-700 transition-colors duration-150 
                                            ${item.isAgrupamento 
                                                ? 'bg-sky-100 dark:bg-sky-900/50 hover:bg-sky-200/70 dark:hover:bg-sky-900/70 border-l-4 border-sky-500' 
                                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-600/50'
                                            }`
                                        }
                                    >
                                        <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white">
                                            <div className="flex items-center gap-2">
                                                {item.isAgrupamento && <ClusterIcon className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" title="Faz parte de um agrupamento" />}
                                                <span>{item.ID}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{item.PAC_NOME}</td>
                                        <td className="py-4 px-6">{item.AGRAVO}</td>
                                        <td className="py-4 px-6">{item.NOTIF_DT}</td>
                                        <td className="py-4 px-6">{item.DT_SINT}</td>
                                        <td className="py-4 px-6">{item.PAC_BAIR}</td>
                                        <td className="py-4 px-6">{item.PAC_REG}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-4">
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
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                            Nenhum resultado encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        Fechar
                    </button>
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

export default SearchResultsModal;