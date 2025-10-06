import React from 'react';
import { Atividade } from '../types';
import { PlusIcon } from './icons/IconComponents';

interface NotificationsForDemandasTableProps {
    notifications: Atividade[];
    onAssign: (notification: Atividade) => void;
}

const NotificationsForDemandasTable: React.FC<NotificationsForDemandasTableProps> = ({ notifications, onAssign }) => {
    return (
        <div className="mt-8 bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Notificações para Atribuir
                </h3>
            </div>
            <div className="overflow-auto relative max-h-[50vh]">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="py-3 px-6">ID</th>
                            <th scope="col" className="py-3 px-6">Paciente</th>
                            <th scope="col" className="py-3 px-6">Agravo</th>
                            <th scope="col" className="py-3 px-6">Endereço</th>
                            <th scope="col" className="py-3 px-6">Bairro</th>
                            <th scope="col" className="py-3 px-6 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.length > 0 ? (
                            notifications.map((item) => (
                                <tr key={item.ID} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.ID}</td>
                                    <td className="py-4 px-6">{item.PAC_NOME}</td>
                                    <td className="py-4 px-6">{item.AGRAVO}</td>
                                    <td className="py-4 px-6">{`${item.PAC_LOGR}, ${item.PAC_NUM}`}</td>
                                    <td className="py-4 px-6">{item.PAC_BAIR}</td>
                                    <td className="py-4 px-6 text-center">
                                        <button 
                                            onClick={() => onAssign(item)} 
                                            className="flex items-center justify-center gap-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xs px-3 py-2 text-center"
                                            aria-label={`Atribuir demanda para ${item.PAC_NOME}`}
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Atribuir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    Nenhuma notificação disponível para atribuição.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default NotificationsForDemandasTable;
