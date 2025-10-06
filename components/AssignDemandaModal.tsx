import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import { Atividade, Demanda, Equipe } from '../types';

interface AssignDemandaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (demanda: Demanda) => void;
    notification: Atividade | null;
    demandaType: 'Controle de Criadouro' | 'Nebulização';
    equipes: Equipe[];
}

const AssignDemandaModal: React.FC<AssignDemandaModalProps> = ({ isOpen, onClose, onSave, notification, demandaType, equipes }) => {
    const [equipeId, setEquipeId] = useState('');
    const [prazo, setPrazo] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              handleClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!notification) return;
        if (!equipeId) {
            setError('Por favor, selecione uma equipe.');
            return;
        }
        if (!prazo) {
            setError('Por favor, defina um prazo.');
            return;
        }

        const equipeSelecionada = equipes.find(e => e.id === equipeId);
        if (!equipeSelecionada) {
            setError('Equipe inválida selecionada.');
            return;
        }

        const newDemanda: Demanda = {
            id: `${demandaType === 'Nebulização' ? 'NEB' : 'CC'}-${notification.ID}`,
            tipo: demandaType,
            endereco: `${notification.PAC_LOGR}, ${notification.PAC_NUM} - ${notification.PAC_BAIR}`,
            responsavel: equipeSelecionada.lider, // Assigning to team leader for now
            status: 'Pendente',
            prazo: prazo,
            dataCriacao: new Date().toISOString().split('T')[0],
            observacoes: observacoes,
            notificacaoOrigem: notification.ID
        };

        onSave(newDemanda);
    };
    
    const handleClose = () => {
        setEquipeId('');
        setPrazo('');
        setObservacoes('');
        setError(null);
        onClose();
    };

    if (!isOpen || !notification) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Atribuir Demanda</h2>
                    <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="font-medium text-slate-700 dark:text-slate-300">Notificação: <span className="font-normal">{notification.ID} - {notification.PAC_NOME}</span></h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{`${notification.PAC_LOGR}, ${notification.PAC_NUM} - ${notification.PAC_BAIR}`}</p>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700" />
                    
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="demandaType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Demanda</label>
                            <input type="text" id="demandaType" value={demandaType} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                            <label htmlFor="equipe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Atribuir à Equipe</label>
                            <select id="equipe" value={equipeId} onChange={(e) => setEquipeId(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                                <option value="">-- Selecione uma equipe --</option>
                                {equipes.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.nome} (Líder: {eq.lider.name})</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="prazo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo</label>
                            <input type="date" id="prazo" value={prazo} onChange={(e) => setPrazo(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        <div>
                            <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                            <textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Adicione observações importantes para a equipe..."></textarea>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800">Salvar Demanda</button>
                </div>
            </form>
            <style>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AssignDemandaModal;
