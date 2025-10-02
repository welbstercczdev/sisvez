import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import { Ferias, User } from '../types';

interface AgendarFeriasModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Ferias) => void;
    feriasExistente: Ferias | null;
    funcionarios: User[];
}

const AgendarFeriasModal: React.FC<AgendarFeriasModalProps> = ({ isOpen, onClose, onSave, feriasExistente, funcionarios }) => {
    const [funcionarioId, setFuncionarioId] = useState<number | string>('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [status, setStatus] = useState<Ferias['status']>('Agendada');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && feriasExistente) {
            setFuncionarioId(feriasExistente.funcionario.id);
            setDataInicio(feriasExistente.dataInicio);
            setDataFim(feriasExistente.dataFim);
            setStatus(feriasExistente.status);
        } else {
            // Reset form
            setFuncionarioId('');
            setDataInicio('');
            setDataFim('');
            setStatus('Agendada');
            setError(null);
        }
    }, [isOpen, feriasExistente]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!funcionarioId || !dataInicio || !dataFim) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        if (new Date(dataFim) < new Date(dataInicio)) {
            setError('A data de fim não pode ser anterior à data de início.');
            return;
        }

        const funcionario = funcionarios.find(f => f.id === Number(funcionarioId));
        if (!funcionario) {
            setError('Funcionário inválido.');
            return;
        }

        const feriasData: Ferias = {
            id: feriasExistente?.id || '',
            funcionario,
            dataInicio,
            dataFim,
            status,
        };
        onSave(feriasData);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{feriasExistente ? 'Editar' : 'Agendar'} Férias</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="funcionario" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Funcionário</label>
                        <select id="funcionario" value={funcionarioId} onChange={(e) => setFuncionarioId(Number(e.target.value))} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                            <option value="">-- Selecione um funcionário --</option>
                            {funcionarios.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dataInicio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                            <input type="date" id="dataInicio" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="dataFim" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Fim</label>
                            <input type="date" id="dataFim" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
                        </div>
                    </div>
                     {feriasExistente && (
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Ferias['status'])} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                                <option>Agendada</option>
                                <option>Em Andamento</option>
                                <option>Concluída</option>
                                <option>Cancelada</option>
                            </select>
                        </div>
                     )}
                     {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Salvar</button>
                </div>
                <style>{`@keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }`}</style>
            </form>
        {/* FIX: Corrected a typo in the closing div tag. */}
        </div>
    );
};

export default AgendarFeriasModal;
