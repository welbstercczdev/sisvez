import React, { useState, useEffect } from 'react';
import { XIcon, SearchIcon, ClusterIcon } from './icons/IconComponents';
import { Atividade } from '../types';

interface SelectNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (notification: Atividade) => void;
    demandaType: 'Controle de Criadouro' | 'Nebulização';
}

const mockNotifications: Atividade[] = [
    { ID: '10537/25', ANO: '2025', PAC_NOME: 'MARIA DA SILVA', AGRAVO: 'Dengue', NOTIF_DT: '2025-08-09', DT_SINT: '2025-08-05', PAC_LOGR: 'Rua Ângelo Ottoboni', PAC_NUM: '195', PAC_BAIR: 'Vila Industrial', PAC_REG: '7', PAC_CDD: 'São José dos Campos', CLASSIF: 'Suspeito', isAgrupamento: true, agrupamentoNome: 'AG-VILA-INDUSTRIAL-2025-SE41', statusControleCriadouros: 'Pendente' },
    { ID: '10540/25', ANO: '2025', PAC_NOME: 'JOÃO PEREIRA', AGRAVO: 'Dengue', NOTIF_DT: '2025-08-10', DT_SINT: '2025-08-07', PAC_LOGR: 'Avenida Principal', PAC_NUM: '456', PAC_BAIR: 'Centro', PAC_REG: '1', PAC_CDD: 'São José dos Campos', CLASSIF: 'Suspeito', statusControleCriadouros: 'Concluído', dataControleCriadouros: '2025-08-10', equipeControleCriadouros: 'Equipe Bravo', relacaoQuadrasControleCriadouros: '1-20, 1-21, 1-22, 1-23, 1-24, 1-25, 1-26, 1-27' },
    { ID: '10545/25', ANO: '2025', PAC_NOME: 'ANA COSTA', AGRAVO: 'Chikungunya', NOTIF_DT: '2025-08-11', DT_SINT: '2025-08-08', PAC_LOGR: 'Alameda dos Pássaros', PAC_NUM: '789', PAC_BAIR: 'Bosque dos Eucaliptos', PAC_REG: '5', PAC_CDD: 'São José dos Campos', CLASSIF: 'Suspeito', statusControleCriadouros: 'Em Andamento' },
    { ID: '10550/25', ANO: '2025', PAC_NOME: 'CARLOS DIAS', AGRAVO: 'Dengue', NOTIF_DT: '2025-08-12', DT_SINT: '2025-08-10', PAC_LOGR: 'Rua dos Cravos', PAC_NUM: '321', PAC_BAIR: 'Jardim das Flores', PAC_REG: '3', PAC_CDD: 'São José dos Campos', CLASSIF: 'Confirmado', isAgrupamento: true, agrupamentoNome: 'AG-JD-FLORES-2025-SE38', statusControleCriadouros: 'Concluído', dataControleCriadouros: '2025-08-12', equipeControleCriadouros: 'Equipe Charlie', relacaoQuadrasControleCriadouros: '3-15, 3-16, 3-17, 3-18, 3-19, 3-20, 3-21, 3-22' },
    { ID: '10555/25', ANO: '2025', PAC_NOME: 'BEATRIZ LIMA', AGRAVO: 'Zika', NOTIF_DT: '2025-08-13', DT_SINT: '2025-08-11', PAC_LOGR: 'Travessa das Orquídeas', PAC_NUM: '50', PAC_BAIR: 'Jardim Satélite', PAC_REG: '6', PAC_CDD: 'São José dos Campos', CLASSIF: 'Descartado', statusControleCriadouros: 'Pendente' },
];

const SelectNotificationModal: React.FC<SelectNotificationModalProps> = ({ isOpen, onClose, onSelect, demandaType }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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
    }, [isOpen, onClose]);

    const handleSelectAndProceed = () => {
        const notification = mockNotifications.find(n => n.ID === selectedId);
        if (notification) {
            onSelect(notification);
        }
    };

    const handleClose = () => {
        setSearchTerm('');
        setSelectedId(null);
        onClose();
    };

    const filteredNotifications = mockNotifications.filter(n => {
        const matchesSearch = n.PAC_NOME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              n.ID.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (demandaType === 'Nebulização') {
            return matchesSearch && n.statusControleCriadouros === 'Concluído';
        }

        return matchesSearch;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Selecionar Notificação</h2>
                    <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-4 relative">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou número da notificação..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm pl-10 p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                                <tr>
                                    <th scope="col" className="py-3 px-6 w-12"></th>
                                    <th scope="col" className="py-3 px-6">ID</th>
                                    <th scope="col" className="py-3 px-6">Paciente</th>
                                    <th scope="col" className="py-3 px-6">Endereço</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNotifications.length > 0 ? filteredNotifications.map(notification => (
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
                                                <span>{notification.ID}</span>
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
                                                ? 'Nenhuma notificação com Controle de Criadouros concluído foi encontrada.'
                                                : 'Nenhuma notificação encontrada.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
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
                        disabled={!selectedId}
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