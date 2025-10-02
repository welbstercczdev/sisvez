import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';

interface SearchCriteria {
    name: string;
    notificationId: string;
    startDate: string;
    endDate: string;
    classification: string;
}

interface SearchAtividadeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (criteria: SearchCriteria) => void;
}

const SearchAtividadeModal: React.FC<SearchAtividadeModalProps> = ({ isOpen, onClose, onSearch }) => {
    const [name, setName] = useState('');
    const [notificationId, setNotificationId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [classification, setClassification] = useState('TODOS');

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ name, notificationId, startDate, endDate, classification });
    };
    
    const handleClose = () => {
        // Reset state on close
        setName('');
        setNotificationId('');
        setStartDate('');
        setEndDate('');
        setClassification('TODOS');
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Pesquisar Atividades VEZ</h2>
                    <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Paciente</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Digite o nome para buscar..." />
                        </div>
                        <div>
                            <label htmlFor="notificationId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nº da Notificação</label>
                            <input type="text" id="notificationId" value={notificationId} onChange={(e) => setNotificationId(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Digite o ID da notificação..." />
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Período de Notificação (Início)</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                         <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Período de Notificação (Fim)</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="classification" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classificação</label>
                             <select id="classification" value={classification} onChange={(e) => setClassification(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                                <option value="TODOS">TODOS</option>
                                <option value="IMPORTADO">IMPORTADO</option>
                                <option value="DESCARTADO">DESCARTADO</option>
                                <option value="AUTOCTONE">AUTOCTONE</option>
                                <option value="O.M.">O.M.</option>
                            </select>
                        </div>
                   </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        Cancelar
                    </button>
                     <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                    >
                        Pesquisar
                    </button>
                </div>
            </form>
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

export default SearchAtividadeModal;