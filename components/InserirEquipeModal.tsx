import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import { User, Equipe } from '../types';
import MultiSelect from './MultiSelect';

interface InserirEquipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Equipe, 'id' | 'historico'>) => void;
    // Recebe a lista de usuários que não estão em nenhuma outra equipe
    availableUsers: User[];
}

const InserirEquipeModal: React.FC<InserirEquipeModalProps> = ({ isOpen, onClose, onSave, availableUsers }) => {
    // Estados internos do formulário
    const [nome, setNome] = useState('');
    const [lider, setLider] = useState<User | null>(null);
    const [membros, setMembros] = useState<User[]>([]);
    const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
    const [error, setError] = useState<string | null>(null);

    // Efeito para resetar o formulário sempre que o modal for fechado
    useEffect(() => {
        if (!isOpen) {
            setNome('');
            setLider(null);
            setMembros([]);
            setStatus('Ativo');
            setError(null);
        }
    }, [isOpen]);

    // Função chamada ao clicar no botão "Salvar"
    const handleSave = () => {
        // Validação dos campos
        if (!nome.trim()) {
            setError('O nome da equipe é obrigatório.');
            return;
        }
        if (!lider) {
            setError('Selecione um líder para a equipe.');
            return;
        }
        
        setError(null);

        // Cria o objeto da nova equipe e o envia para a página principal
        onSave({ 
            nome: nome.trim(), 
            lider, 
            membros, 
            status 
        });
    };

    // Não renderiza o modal se não estiver aberto
    if (!isOpen) return null;

    // Filtra a lista de membros disponíveis para garantir que o líder não apareça
    const availableMembers = availableUsers.filter(u => u.uuid !== lider?.uuid);

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Criar Nova Equipe</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="nome_equipe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Equipe</label>
                            <input 
                                type="text" 
                                id="nome_equipe" 
                                value={nome} 
                                onChange={(e) => setNome(e.target.value)} 
                                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" 
                                placeholder="Ex: Equipe de Campo - Setor 1" 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="lider_equipe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Líder</label>
                            <select 
                                id="lider_equipe" 
                                value={lider?.uuid || ''} 
                                onChange={(e) => setLider(availableUsers.find(u => u.uuid === e.target.value) || null)} 
                                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="">-- Selecione um Líder --</option>
                                {/* Popula o select com os usuários DISPONÍVEIS */}
                                {availableUsers.map(user => (
                                    <option key={user.uuid} value={user.uuid}>
                                        {user.name} ({user.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Membros</label>
                             <MultiSelect
                                options={availableMembers}
                                selectedValues={membros}
                                onChange={setMembros}
                                placeholder="Selecione os membros..."
                             />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                             <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        value="Ativo" 
                                        checked={status === 'Ativo'} 
                                        onChange={(e) => setStatus(e.target.value as any)} 
                                        className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500" 
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Ativo</span>
                                </label>
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        value="Inativo" 
                                        checked={status === 'Inativo'} 
                                        onChange={(e) => setStatus(e.target.value as any)} 
                                        className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500" 
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Inativo</span>
                                </label>
                             </div>
                        </div>
                        {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}
                   </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancelar</button>
                    <button 
                        type="button" 
                        onClick={handleSave} 
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700"
                    >
                        Criar Equipe
                    </button>
                </div>
            </div>
             <style>{`.animate-scale-in{animation:scale-in .2s ease-out forwards}@keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        </div>
    );
};

export default InserirEquipeModal;