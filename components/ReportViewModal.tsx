import React, { useEffect } from 'react';
import { XIcon, PrinterIcon, DownloadIcon } from './icons/IconComponents';
import { Atividade } from '../types';
import { ReportCriteria } from './ReportModal';

interface ReportViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    criteria: ReportCriteria | null;
    data: Atividade[];
}

const CriteriaItem: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</dt>
            <dd className="mt-1 text-sm text-slate-800 dark:text-slate-200 capitalize">{value.replace(/_/g, ' ')}</dd>
        </div>
    );
};

const ReportViewModal: React.FC<ReportViewModalProps> = ({ isOpen, onClose, criteria, data }) => {
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

    if (!isOpen || !criteria) return null;

    const reportTitleMap: { [key: string]: string } = {
        sintetico: 'Relatório Sintético',
        analitico: 'Relatório Analítico',
        produtividade: 'Relatório de Produtividade por Equipe',
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Visualização de Relatório
                    </h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Report Header and Criteria */}
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-3">{reportTitleMap[criteria.reportType] || 'Relatório de Atividades VEZ'}</h3>
                        <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            <CriteriaItem label="Período" value={criteria.startDate && criteria.endDate ? `${criteria.startDate} a ${criteria.endDate}` : 'N/A'} />
                            <CriteriaItem label="Classificação" value={criteria.classification} />
                            <CriteriaItem label="Formato" value={criteria.outputFormat} />
                        </dl>
                    </div>

                    {/* Report Data Table */}
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
                                    <th scope="col" className="py-3 px-6">Classificação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map((item, index) => (
                                    <tr key={item.ID || index} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                        <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.ID}</td>
                                        <td className="py-4 px-6">{item.PAC_NOME}</td>
                                        <td className="py-4 px-6">{item.AGRAVO}</td>
                                        <td className="py-4 px-6">{item.NOTIF_DT}</td>
                                        <td className="py-4 px-6">{item.DT_SINT}</td>
                                        <td className="py-4 px-6">{item.PAC_BAIR}</td>
                                        <td className="py-4 px-6">{item.PAC_REG}</td>
                                        <td className="py-4 px-6">{item.CLASSIF}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                            Nenhum dado encontrado para os critérios selecionados.
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
                        onClick={() => alert('Função de impressão não implementada.')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Imprimir
                    </button>
                    <button
                        type="button"
                        onClick={() => alert('Função de download não implementada.')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                    >
                         <DownloadIcon className="w-4 h-4" />
                        Download (CSV)
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

export default ReportViewModal;