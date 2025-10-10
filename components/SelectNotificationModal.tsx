import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { XIcon, SearchIcon, ClusterIcon } from './icons/IconComponents';
import { Atividade } from '../types';

interface SelectNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (notification: Atividade) => void;
    demandaType: 'Controle de Criadouro' | 'Nebulização';
}

const SelectNotificationModal: React.FC<SelectNotificationModalProps> = ({ isOpen, onClose, onSelect, demandaType }) => {
    const API_URL = 'https://script.google.com/macros/s/AKfycbyotEdB0INfTNUK9q6MKbHEMQFUzwi5rMYnfZ6tQ7OaQ4ojOa9J3ItXqNsjjEl4XqN0/exec';

    const [notifications, setNotifications] = useState<Atividade[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const url = new URL(API_URL);
                url.searchParams.append('api', 'atividades');
                const response = await fetch(url.toString());
                const result = await response.json();

                if (result.success) {
                    setNotifications(result.data);
                } else {
                    throw new Error(result.error || 'Falha ao buscar notificações da base de dados.');
                }
            } catch (err: any) {
                const errorMessage = `Erro ao carregar notificações: ${err.message}`;
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              handleClose();
           }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    const handleSelectAndProceed = () => {
        const notification = notifications.find(n => n.ID === selectedId);
        if (notification) {
            onSelect(notification);
        }
    };

    const handleClose = () => {
        setSearchTerm('');
        setSelectedId(null);
        onClose();
    };

    // Filtra os dados que vieram da API
    const filteredNotifications = notifications.filter(n => {
        // ====================== LÓGICA DE BUSCA MODIFICADA ======================
        // Cria o ID formatado para usar na busca
        const formattedId = `${n.ID}/${String(n.ANO).slice(-2)}`;
        const searchTermLower = searchTerm.toLowerCase();

        const matchesSearch = n.PAC_NOME.toLowerCase().includes(searchTermLower) ||
                              String(n.ID).toLowerCase().includes(searchTermLower) ||
                              formattedId.toLowerCase().includes(searchTermLower);
        // =======================================================================
        
        if (demandaType === 'Nebulização') {
            return matchesSearch && n.statusControleCriadouros === 'Concluído';
        }

        return matchesSearch;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Selecionar Notificação</h2>
                    <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-hidden flex flex-col">
                    <div className="mb-4 relative flex-shrink-0">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou número da notificação..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm pl-10 p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div className="flex-grow overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="py-3 px-6 w-12"></th>
                                    <th scope="col" className="py-3 px-6">ID</th>
                                    <th scope="col" className="py-3 px-6">Paciente</th>
                                    <th scope="col" className="py-3 px-6">Endereço</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center py-6 text-slate-500 dark:text-slate-400">Carregando notificações...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan={4} className="text-center py-6 text-red-500">{error}</td></tr>
                                ) : filteredNotifications.length > 0 ? filteredNotifications.map(notification => (
                                    <tr 
                                        key={notification.ID} 
                                        onClick={() => setSelectedId(notification.ID)}
                                        className={`border-b dark:border-slate-700 cursor-pointer transition-colors ${selectedId === notification.ID ? 'bg-sky-100 dark:bg-sky-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        <td className="py-4 px-6">
                                            <input 
                                                type="radio"
                                                name="notificationSelection"
                                                checked={selectedId === notification.ID}
                                                onChange={() => setSelectedId(notification.ID)}
                                                className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                                             <div className="flex items-center gap-2">
                                                {/* ====================== EXIBIÇÃO DO ID MODIFICADA ====================== */}
                                                <span>{`${notification.ID}/${String(notification.ANO).slice(-2)}`}</span>
                                                {/* ======================================================================= */}
                                                {notification.isAgrupamento && (
                                                    <div className="relative group flex items-center">
                                                        <ClusterIcon className="w-4 h-4 text-sky-500" />
                                                        <div className="absolute left-0 bottom-full mb-1 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                            {notification.agrupamentoNome}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{notification.PAC_NOME}</td>
                                        <td className="py-4 px-6">{`${notification.PAC_LOGR}, ${notification.PAC_NUM}`}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-slate-500 dark:text-slate-400">
                                            {demandaType === 'Nebulização'
                                                ? 'Nenhuma notificação com C. de Criadouros concluído foi encontrada.'
                                                : 'Nenhuma notificação encontrada.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3 flex-shrink-0">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSelectAndProceed}
                        disabled={!selectedId || isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Prosseguir
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

export default SelectNotificationModal;