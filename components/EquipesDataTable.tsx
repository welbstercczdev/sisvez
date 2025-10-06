import React from 'react';
import { Equipe } from '../types';
import { XIcon, EyeIcon, PencilIcon, TrashIcon } from './icons/IconComponents';

interface EquipesDataTableProps {
    data: Equipe[];
    setData: React.Dispatch<React.SetStateAction<Equipe[]>>;
    onViewItem: (item: Equipe) => void;
    onEditItem: (item: Equipe) => void;
    onDeleteItem: (item: Equipe) => void;
}

const EquipesDataTable: React.FC<EquipesDataTableProps> = ({ data, setData, onViewItem, onEditItem, onDeleteItem }) => {
    return (
        <>
            <div className="mt-8 bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {data.length} Equipes Cadastradas
                    </h3>
                    <button 
                        onClick={() => setData([])}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label="Limpar tabela de equipes"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-auto relative max-h-[50vh]">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="py-3 px-6">Nome da Equipe</th>
                                <th scope="col" className="py-3 px-6">Líder</th>
                                <th scope="col" className="py-3 px-6 text-center">Membros</th>
                                <th scope="col" className="py-3 px-6">Status</th>
                                <th scope="col" className="py-3 px-6 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.nome}</td>
                                    <td className="py-4 px-6">{item.lider.name}</td>
                                    <td className="py-4 px-6 text-center">{item.membros.length}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            item.status === 'Ativo' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button onClick={() => onViewItem(item)} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300" aria-label={`Visualizar ${item.nome}`}>
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => onEditItem(item)} className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300" aria-label={`Editar ${item.nome}`}>
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => onDeleteItem(item)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label={`Excluir ${item.nome}`}>
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

export default EquipesDataTable;