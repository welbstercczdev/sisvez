import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import { Equipe, User } from '../types';
import MultiSelect from './MultiSelect';

interface EditarEquipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Equipe) => void;
    equipe: Equipe | null;
    // Prop atualizada para receber a lista de usuários já filtrada
    availableUsers: User[];
}

const EditarEquipeModal: React.FC<EditarEquipeModalProps> = ({ isOpen, onClose, onSave, equipe, availableUsers }) => {
    // Usamos um único estado para o formulário, inicializado como nulo
    const [formData, setFormData] = useState<Equipe | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Efeito para preencher o formulário quando uma equipe é selecionada
    useEffect(() => {
        if (isOpen && equipe) {
            setFormData(equipe);
            setError(null);
        } else if (!isOpen) {
            // Limpa o formulário quando o modal é fechado
            setFormData(null);
        }
    }, [isOpen, equipe]);

    // Handler genérico para atualizar o estado do formulário
    const handleInputChange = (field: keyof Equipe, value: any) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : null);
    };
    
    // Handler específico para o select do líder
    const handleLiderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUuid = e.target.value;
        const selectedLider = availableUsers.find(u => u.uuid === selectedUuid) || null;
        if (selectedLider) {
            handleInputChange('lider', selectedLider);
        }
    };
    
    // Handler para o MultiSelect de membros
    const handleMembrosChange = (selectedMembros: User[]) => {
        handleInputChange('membros', selectedMembros);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        if (!formData.nome || !formData.nome.trim()) {
            setError('O nome da equipe é obrigatório.');
            return;
        }
        if (!formData.lider) {
            setError('Selecione um líder.');
            return;
        }
        
        setError(null);
        onSave(formData);
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Editar Equipe</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="edit_nome_equipe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Equipe</label>
                            <input 
                                type="text" 
                                id="edit_nome_equipe" 
                                value={formData.nome} 
                                onChange={(e) => handleInputChange('nome', e.target.value)} 
                                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" 
                                placeholder="Ex: Equipe de Campo - Setor 1" 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="edit_lider" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Líder</label>
                            <select 
                                id="edit_lider" 
                                value={formData.lider?.uuid || ''} 
                                onChange={handleLiderChange} 
                                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="">-- Selecione um Líder --</option>
                                {/* Popula o select com os usuários DISPONÍVEIS para esta edição */}
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
                                // A lista de opções não deve incluir o líder atualmente selecionado
                                options={availableUsers.filter(u => u.uuid !== formData.lider?.uuid)}
                                selectedValues={formData.membros || []}
                                onChange={handleMembrosChange}
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
                                        checked={formData.status === 'Ativo'} 
                                        onChange={(e) => handleInputChange('status', e.target.value as any)} 
                                        className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500" 
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Ativo</span>
                                </label>
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        value="Inativo" 
                                        checked={formData.status === 'Inativo'} 
                                        onChange={(e) => handleInputChange('status', e.target.value as any)} 
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
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Salvar Alterações</button>
                </div>
            </form>
             <style>{`.animate-scale-in{animation:scale-in .2s ease-out forwards}@keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        </div>
    );
};

export default EditarEquipeModal;