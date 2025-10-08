import React from 'react';
import { Agrupamento } from '../types';
import { XIcon, EyeIcon } from './icons/IconComponents';

interface AgrupamentosDataTableProps {
    data: Agrupamento[];
    setData: React.Dispatch<React.SetStateAction<Agrupamento[]>>;
    onViewItem: (item: Agrupamento) => void;
    // NOVAS PROPRIEDADES PARA GERENCIAR A SELEÇÃO
    selectedRows: string[];
    setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
}

const AgrupamentosDataTable: React.FC<AgrupamentosDataTableProps> = ({ 
    data, 
    setData, 
    onViewItem,
    selectedRows,
    setSelectedRows
}) => {
    
    const formatDate = (dateString: string): string => {
        if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            return dateString;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Função para selecionar/desselecionar uma única linha
    const handleRowSelect = (nome: string) => {
        setSelectedRows(prev => 
            prev.includes(nome)
                ? prev.filter(n => n !== nome) // Remove se já estiver selecionado
                : [...prev, nome]             // Adiciona se não estiver
        );
    };

    // Função para selecionar/desselecionar todas as linhas
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(data.map(item => item.nome));
        } else {
            setSelectedRows([]);
        }
    };

    const isAllSelected = selectedRows.length === data.length && data.length > 0;
    const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

    return (
        <>
            <div className="mt-8 bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {data.length} Agrupamentos Encontrados
                        {selectedRows.length > 0 && (
                            <span className="ml-3 text-sm font-normal text-sky-600 dark:text-sky-400">
                                ({selectedRows.length} selecionado(s))
                            </span>
                        )}
                    </h3>
                    <button 
                        onClick={() => setData([])}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label="Fechar tabela de dados"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 hidden md:table-header-group sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="py-3 px-4">
                                    <input 
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 dark:bg-slate-900 dark:checked:bg-sky-600"
                                        checked={isAllSelected}
                                        ref={el => el && (el.indeterminate = isIndeterminate)}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="py-3 px-6">Nome</th>
                                <th scope="col" className="py-3 px-6">Data</th>
                                <th scope="col" className="py-3 px-6 text-center">Total Notif.</th>
                                <th scope="col" className="py-3 px-6 text-center">Pontuação</th>
                                <th scope="col" className="py-3 px-6">Região</th>
                                <th scope="col" className="py-3 px-6 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.nome} className="block md:table-row mb-4 md:mb-0 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-md md:border-b md:rounded-none md:shadow-none hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    {/* Célula do Checkbox */}
                                    <td className="block md:table-cell py-2 px-4 md:py-4 md:px-4 border-b md:border-none dark:border-slate-700">
                                        <input 
                                            type="checkbox"
                                            className="rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 dark:bg-slate-900 dark:checked:bg-sky-600"
                                            checked={selectedRows.includes(item.nome)}
                                            onChange={() => handleRowSelect(item.nome)}
                                        />
                                    </td>
                                    <td data-label="Nome" className="block md:table-cell py-2 px-4 md:py-4 md:px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white text-right md:text-left border-b md:border-none dark:border-slate-700 before:content-[attr(data-label)] before:float-left before:font-semibold md:before:content-none">{item.nome}</td>
                                    <td data-label="Data" className="block md:table-cell py-2 px-4 md:py-4 md:px-6 whitespace-nowrap text-right md:text-left border-b md:border-none dark:border-slate-700 before:content-[attr(data-label)] before:float-left before:font-semibold md:before:content-none">{formatDate(item.data)}</td>
                                    <td data-label="Total Notif." className="block md:table-cell py-2 px-4 md:py-4 md:px-6 text-right md:text-center border-b md:border-none dark:border-slate-700 before:content-[attr(data-label)] before:float-left before:font-semibold md:before:content-none">{item.totalNotificacoes}</td>
                                    <td data-label="Pontuação" className="block md:table-cell py-2 px-4 md:py-4 md:px-6 text-right md:text-center border-b md:border-none dark:border-slate-700 before:content-[attr(data-label)] before:float-left before:font-semibold md:before:content-none">{item.pontuacaoTotal}</td>
                                    <td data-label="Região" className="block md:table-cell py-2 px-4 md:py-4 md:px-6 text-right md:text-left border-b md:border-none dark:border-slate-700 before:content-[attr(data-label)] before:float-left before:font-semibold md:before:content-none">{item.regiao}</td>
                                    <td data-label="Ações" className="block md:table-cell py-2 px-4 md:py-4 md:px-6 text-right md:text-center before:content-[attr(data-label)] before:float-left before:font-semibold md:before:content-none">
                                        <button onClick={() => onViewItem(item)} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300" aria-label={`Visualizar detalhes de ${item.nome}`}>
                                            <EyeIcon className="w-5 h-5 inline-block" />
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
                @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

export default AgrupamentosDataTable;