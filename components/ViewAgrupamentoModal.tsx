import React, { useEffect } from 'react'; 
import { XIcon } from './icons/IconComponents';
import { Agrupamento } from '../types';

interface ViewAgrupamentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    agrupamento: Agrupamento | null;
}

const DetailItem: React.FC<{ label: string, value: string | number | undefined }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200">{value ?? 'Não informado'}</dd>
    </div>
);

const ViewAgrupamentoModal: React.FC<ViewAgrupamentoModalProps> = ({ isOpen, onClose, agrupamento }) => {

    /**
     * Função para formatar a data de ISO (yyyy-mm-ddT...) para dd/mm/yyyy.
     * @param dateString A data em formato de string.
     * @returns A data formatada ou a string original se o formato for inesperado.
     */
    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Não informado';

        // Se a data já estiver no formato dd/mm/yyyy, não faz nada.
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            return dateString;
        }

        const date = new Date(dateString);
        // Verifica se a data é válida
        if (isNaN(date.getTime())) {
            return dateString; // Retorna o original se a data for inválida
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é base 0, então +1
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    };

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

    if (!isOpen || !agrupamento) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Detalhes do Agrupamento</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div className="sm:col-span-2 md:col-span-3">
                           <DetailItem label="Nome" value={agrupamento.nome} />
                        </div>
                        {/* AQUI A FUNÇÃO DE FORMATAÇÃO É APLICADA */}
                        <DetailItem label="Data" value={formatDate(agrupamento.data)} />
                        <DetailItem label="Região" value={agrupamento.regiao} />
                        {/* Tratamento para garantir que 'area' seja um número antes de formatar */}
                        <DetailItem label="Área (m²)" value={agrupamento.area ? Number(agrupamento.area).toLocaleString('pt-BR') : 'Não informado'} />
                        <DetailItem label="Total de Notificações" value={agrupamento.totalNotificacoes} />
                        <DetailItem label="Pontuação Total" value={agrupamento.pontuacaoTotal} />
                        <div className="sm:col-span-2 md:col-span-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="text-base font-medium text-slate-800 dark:text-slate-200">Detalhamento de Casos</h4>
                        </div>
                        <DetailItem label="Dengue Confirmado" value={agrupamento.dengueConfirmado} />
                        <DetailItem label="Dengue M. Provável" value={agrupamento.dengueMuitoProvavel} />
                        <div></div> {/* Spacer */}
                        <DetailItem label="Chikungunya Confirmado" value={agrupamento.chikungunyaConfirmado} />
                        <DetailItem label="Chikungunya M. Provável" value={agrupamento.chikungunyaMuitoProvavel} />
                   </dl>
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

export default ViewAgrupamentoModal;