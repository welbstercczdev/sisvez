import React, { useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import { Atividade } from '../types';

interface ViewAtividadeModalProps {
    isOpen: boolean;
    onClose: () => void;
    atividade: Atividade | null;
}

const DetailItem: React.FC<{ label: string, value: string | undefined }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200">{value || 'Não informado'}</dd>
    </div>
);

const ViewAtividadeModal: React.FC<ViewAtividadeModalProps> = ({ isOpen, onClose, atividade }) => {

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

    if (!isOpen || !atividade) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Detalhes da Atividade</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem label="ID" value={atividade.ID} />
                        <DetailItem label="Ano" value={atividade.ANO} />
                        <div className="md:col-span-2">
                           <DetailItem label="Nome do Paciente" value={atividade.PAC_NOME} />
                        </div>
                        <DetailItem label="Agravo" value={atividade.AGRAVO} />
                        <DetailItem label="Classificação Interna" value={atividade.CLASSIF} />
                        <DetailItem label="Data de Notificação" value={atividade.NOTIF_DT} />
                        <DetailItem label="Data de Sintomas" value={atividade.DT_SINT} />
                        <div className="md:col-span-2">
                           <DetailItem label="Logradouro" value={`${atividade.PAC_LOGR || ''}, ${atividade.PAC_NUM || ''}`} />
                        </div>
                        <DetailItem label="Bairro" value={atividade.PAC_BAIR} />
                        <DetailItem label="Região" value={atividade.PAC_REG} />
                         <div className="md:col-span-2">
                           <DetailItem label="Cidade" value={atividade.PAC_CDD} />
                        </div>
                        {atividade.isAgrupamento && (
                            <>
                                <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-base font-medium text-slate-800 dark:text-slate-200">Informações de Agrupamento</h4>
                                </div>
                                <div className="md:col-span-2">
                                    <DetailItem label="Nome do Agrupamento" value={atividade.agrupamentoNome} />
                                </div>
                            </>
                        )}
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

export default ViewAtividadeModal;