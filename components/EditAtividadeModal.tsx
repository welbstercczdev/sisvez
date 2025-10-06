import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import { Atividade } from '../types';

interface EditAtividadeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Atividade) => void;
    atividade: Atividade | null;
}

const DUMMY_AGRUPAMENTOS = [
    'AG-JD-AMERICA-2023-SE34',
    'AG-VILA-INDUSTRIAL-2023-SE41',
    'AG-CENTRO-2023-SE01',
    'AG-SATELITE-2023-SE35'
];

const EditAtividadeModal: React.FC<EditAtividadeModalProps> = ({ isOpen, onClose, onSave, atividade }) => {
    const [formData, setFormData] = useState<Atividade | null>(null);

    useEffect(() => {
        // When the modal opens with new data, update the form state
        if (atividade) {
            setFormData({
                ...atividade,
                isAgrupamento: atividade.isAgrupamento ?? false,
                agrupamentoNome: atividade.agrupamentoNome ?? ''
            });
        } else {
            // Reset form when there's no activity (e.g., modal is closed)
            setFormData(null);
        }
    }, [atividade]);

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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (formData) {
            const { name, value, type } = e.target;
            const isCheckbox = type === 'checkbox';

            const newFormData = {
                ...formData,
                [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
            };

            if (name === 'isAgrupamento' && !(e.target as HTMLInputElement).checked) {
                newFormData.agrupamentoNome = '';
            }
            
            setFormData(newFormData);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Editar Atividade VEZ - ID: {formData.ID}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="PAC_NOME" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Paciente</label>
                            <input type="text" id="PAC_NOME" name="PAC_NOME" value={formData.PAC_NOME} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        <div>
                            <label htmlFor="AGRAVO" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agravo</label>
                            <input type="text" id="AGRAVO" name="AGRAVO" value={formData.AGRAVO} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                         <div>
                            <label htmlFor="CLASSIF" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classificação</label>
                             <select id="CLASSIF" name="CLASSIF" value={formData.CLASSIF} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                                <option>Suspeito</option>
                                <option>Confirmado</option>
                                <option>Descartado</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="NOTIF_DT" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Notificação</label>
                            <input type="date" id="NOTIF_DT" name="NOTIF_DT" value={formData.NOTIF_DT} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        <div>
                            <label htmlFor="DT_SINT" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Sintomas</label>
                            <input type="date" id="DT_SINT" name="DT_SINT" value={formData.DT_SINT} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="md:col-span-2">
                             <label htmlFor="PAC_LOGR" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logradouro</label>
                             <input type="text" id="PAC_LOGR" name="PAC_LOGR" value={formData.PAC_LOGR} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                           </div>
                           <div>
                             <label htmlFor="PAC_NUM" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número</label>
                             <input type="text" id="PAC_NUM" name="PAC_NUM" value={formData.PAC_NUM} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                           </div>
                        </div>
                        <div>
                            <label htmlFor="PAC_BAIR" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
                            <input type="text" id="PAC_BAIR" name="PAC_BAIR" value={formData.PAC_BAIR} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                         <div>
                            <label htmlFor="PAC_REG" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Região</label>
                            <input type="text" id="PAC_REG" name="PAC_REG" value={formData.PAC_REG} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                         <div>
                            <label htmlFor="PAC_CDD" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                            <input type="text" id="PAC_CDD" name="PAC_CDD" value={formData.PAC_CDD} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        <div className="lg:col-span-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">Agrupamento</h3>
                        </div>
                        <div className="lg:col-span-3 flex items-center gap-4">
                            <input 
                                type="checkbox" 
                                id="isAgrupamento" 
                                name="isAgrupamento"
                                checked={formData.isAgrupamento || false}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            <label htmlFor="isAgrupamento" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Faz parte de Agrupamento?</label>
                        </div>
                        {formData.isAgrupamento && (
                            <div className="lg:col-span-3">
                                <label htmlFor="agrupamentoNome" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione o Agrupamento</label>
                                <select 
                                    id="agrupamentoNome" 
                                    name="agrupamentoNome" 
                                    value={formData.agrupamentoNome || ''} 
                                    onChange={handleChange} 
                                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    required
                                >
                                    <option value="">-- Selecione --</option>
                                    {DUMMY_AGRUPAMENTOS.map(agrup => (
                                        <option key={agrup} value={agrup}>{agrup}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                   </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        Cancelar
                    </button>
                     <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                    >
                        Salvar Alterações
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

export default EditAtividadeModal;