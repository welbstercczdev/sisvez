import React from 'react';
import { Agrupamento } from '../types';
import { XIcon, EyeIcon } from './icons/IconComponents';

interface AgrupamentosDataTableProps {
    data: Agrupamento[];
    setData: React.Dispatch<React.SetStateAction<Agrupamento[]>>;
    onViewItem: (item: Agrupamento) => void;
}

const AgrupamentosDataTable: React.FC<AgrupamentosDataTableProps> = ({ data, setData, onViewItem }) => {
    return (
        <>
            <div className="mt-8 bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {data.length} Agrupamentos Encontrados
                    </h3>
                    <button 
                        onClick={() => setData([])}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label="Fechar tabela de dados importados"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-auto relative max-h-[50vh]">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="py-3 px-6">Nome</th>
                                <th scope="col" className="py-3 px-6">Data</th>
                                <th scope="col" className="py-3 px-6 text-center">Total Notif.</th>
                                <th scope="col" className="py-3 px-6 text-center">Dengue Conf.</th>
                                <th scope="col" className="py-3 px-6 text-center">Dengue M. Prov.</th>
                                <th scope="col" className="py-3 px-6 text-center">Chik. Conf.</th>
                                <th scope="col" className="py-3 px-6 text-center">Chik. M. Prov.</th>
                                <th scope="col" className="py-3 px-6 text-center">Pontuação</th>
                                <th scope="col" className="py-3 px-6">Região</th>
                                <th scope="col" className="py-3 px-6">Área (m²)</th>
                                <th scope="col" className="py-3 px-6 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item.nome || index} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.nome}</td>
                                    <td className="py-4 px-6 whitespace-nowrap">{item.data}</td>
                                    <td className="py-4 px-6 text-center">{item.totalNotificacoes}</td>
                                    <td className="py-4 px-6 text-center">{item.dengueConfirmado}</td>
                                    <td className="py-4 px-6 text-center">{item.dengueMuitoProvavel}</td>
                                    <td className="py-4 px-6 text-center">{item.chikungunyaConfirmado}</td>
                                    <td className="py-4 px-6 text-center">{item.chikungunyaMuitoProvavel}</td>
                                    <td className="py-4 px-6 text-center">{item.pontuacaoTotal}</td>
                                    <td className="py-4 px-6">{item.regiao}</td>
                                    <td className="py-4 px-6">{item.area.toLocaleString('pt-BR')}</td>
                                    <td className="py-4 px-6 text-center">
                                        <button onClick={() => onViewItem(item)} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300" aria-label={`Visualizar detalhes de ${item.nome}`}>
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.length === 0 && <p className="text-center py-4">Nenhum dado para exibir.</p>}
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

export default AgrupamentosDataTable;