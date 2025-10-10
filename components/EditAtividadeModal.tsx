import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { XIcon, SearchIcon } from './icons/IconComponents';
import { Atividade } from '../types';

interface EditAtividadeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Atividade) => void;
    atividade: Atividade | null;
    apiUrl: string;
}

const EditAtividadeModal: React.FC<EditAtividadeModalProps> = ({ isOpen, onClose, onSave, atividade, apiUrl }) => {
    const [formData, setFormData] = useState<Atividade | null>(null);
    const [agrupamentosList, setAgrupamentosList] = useState<string[]>([]);
    const [isFetchingAgrupamentos, setIsFetchingAgrupamentos] = useState(false);
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const handleFetchAgrupamentos = async () => {
        if (!startDateFilter || !endDateFilter) {
            toast.error('Por favor, preencha as datas de início e fim para a busca.');
            return;
        }
        
        setIsFetchingAgrupamentos(true);
        setAgrupamentosList([]);
        try {
            const url = new URL(apiUrl);
            url.searchParams.append('api', 'agrupamentos');
            url.searchParams.append('startDate', startDateFilter);
            url.searchParams.append('endDate', endDateFilter);
            
            const response = await fetch(url.toString());
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                if (result.data.length === 0) {
                    toast('Nenhum agrupamento encontrado para este período.', { icon: 'ℹ️' });
                } else {
                    const nomes = result.data.map((ag: { nome: string }) => ag.nome);
                    setAgrupamentosList([...new Set(nomes)]);
                    toast.success(`${nomes.length} agrupamento(s) encontrado(s).`);
                }
            } else {
                throw new Error(result.error || 'Falha ao buscar agrupamentos.');
            }
        } catch (error: any) {
            toast.error(`Erro ao buscar agrupamentos: ${error.message}`);
        } finally {
            setIsFetchingAgrupamentos(false);
        }
    };

    useEffect(() => {
        if (atividade && isOpen) {
            setFormData({
                ...atividade,
                isAgrupamento: atividade.isAgrupamento ?? false,
                agrupamentoNome: atividade.agrupamentoNome ?? ''
            });
            if (atividade.NOTIF_DT) {
                const formattedDate = formatDateForInput(atividade.NOTIF_DT);
                setStartDateFilter(formattedDate);
                setEndDateFilter(formattedDate);
            }
        } else if (!isOpen) {
            setFormData(null);
            setStartDateFilter('');
            setEndDateFilter('');
            setAgrupamentosList([]);
        }
    }, [atividade, isOpen]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const newFormData = { ...formData, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value };
        if (name === 'isAgrupamento' && !(e.target as HTMLInputElement).checked) {
            newFormData.agrupamentoNome = '';
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) onSave(formData);
    };

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.split('T')[0];
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month}-${day}`;
        }
        return dateStr;
    }

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl transform animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Editar Atividade VEZ - ID: {formData.ID}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* --- INÍCIO DOS CAMPOS DO FORMULÁRIO RESTAURADOS --- */}
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
                            <input type="date" id="NOTIF_DT" name="NOTIF_DT" value={formatDateForInput(formData.NOTIF_DT)} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        <div>
                            <label htmlFor="DT_SINT" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Sintomas</label>
                            <input type="date" id="DT_SINT" name="DT_SINT" value={formatDateForInput(formData.DT_SINT)} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
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
                        {/* --- FIM DOS CAMPOS DO FORMULÁRIO RESTAURADOS --- */}
                        
                        <div className="lg:col-span-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">Agrupamento</h3>
                        </div>
                        <div className="lg:col-span-3 flex items-center gap-4">
                            <input type="checkbox" id="isAgrupamento" name="isAgrupamento" checked={formData.isAgrupamento || false} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"/>
                            <label htmlFor="isAgrupamento" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Faz parte de Agrupamento?</label>
                        </div>
                        
                        {formData.isAgrupamento && (
                            <>
                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Buscar Agrupamentos por Período</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                        <div>
                                            <label htmlFor="startDateFilter" className="text-xs text-slate-500">Início</label>
                                            <input
                                                type="date"
                                                id="startDateFilter"
                                                value={startDateFilter}
                                                onChange={(e) => setStartDateFilter(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="endDateFilter" className="text-xs text-slate-500">Fim</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="date"
                                                    id="endDateFilter"
                                                    value={endDateFilter}
                                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleFetchAgrupamentos}
                                                    disabled={isFetchingAgrupamentos}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 disabled:opacity-50"
                                                >
                                                    <SearchIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="lg:col-span-3">
                                    <label htmlFor="agrupamentoNome" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione o Agrupamento</label>
                                    <select 
                                        id="agrupamentoNome" 
                                        name="agrupamentoNome" 
                                        value={formData.agrupamentoNome || ''} 
                                        onChange={handleChange} 
                                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-600"
                                        required
                                        disabled={agrupamentosList.length === 0 && !isFetchingAgrupamentos}
                                    >
                                        <option value="">
                                            {isFetchingAgrupamentos ? 'Buscando...' : (agrupamentosList.length === 0 ? 'Busque por um período acima' : '-- Selecione --')}
                                        </option>
                                        {agrupamentosList.map(agrup => (
                                            <option key={agrup} value={agrup}>{agrup}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                   </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                        Cancelar
                    </button>
                     <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </form>
            <style>{`.animate-scale-in { animation: scale-in 0.2s ease-out forwards; } @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
};

export default EditAtividadeModal;