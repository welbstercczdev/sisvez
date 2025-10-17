import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Role } from '../types';
import { XIcon, PlusIcon, PencilIcon, TrashIcon } from './icons/IconComponents';

// --- Subcomponente para o formulário de Adicionar/Editar ---
interface RoleFormProps {
    // Passamos a role a ser editada ou nada para criar uma nova
    initialData?: Role; 
    onSave: (data: Omit<Role, 'uuid'> | Role) => void;
    onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSave, onCancel }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [color, setColor] = useState(initialData?.color || '#888888');

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("O nome da permissão é obrigatório.");
            return;
        }
        // Se initialData existe, estamos editando, então passamos o uuid
        const payload = initialData ? { uuid: initialData.uuid, name, description, color } : { name, description, color };
        onSave(payload);
    };

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700 space-y-4 animate-fade-in">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200">
                {initialData ? `Editando "${initialData.name}"` : 'Nova Permissão'}
            </h4>
            <div className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Nome da Permissão (Ex: Admin)" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                />
                <textarea
                    placeholder="Descrição (Opcional)" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={2}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                />
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cor do Badge:</label>
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border-2 dark:border-slate-600">
                        <input 
                            type="color" 
                            value={color} 
                            onChange={e => setColor(e.target.value)} 
                            className="absolute -top-1 -left-1 w-12 h-12 cursor-pointer"
                        />
                    </div>
                    <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{color.toUpperCase()}</span>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancelar</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700">Salvar</button>
            </div>
        </div>
    );
};


// --- Componente Principal do Modal ---
interface GerenciarRolesModalProps {
    isOpen: boolean;
    onClose: () => void;
    roles: Role[];
    onSave: (role: Omit<Role, 'uuid'>) => Promise<boolean>;
    onUpdate: (role: Role) => Promise<boolean>;
    onDelete: (role: Role) => Promise<boolean>;
}

const GerenciarRolesModal: React.FC<GerenciarRolesModalProps> = ({ isOpen, onClose, roles, onSave, onUpdate, onDelete }) => {
    // Um único estado para controlar o modo do formulário
    const [formState, setFormState] = useState<{ mode: 'view' | 'add' | 'edit'; role?: Role }>({ mode: 'view' });

    const handleConfirmDelete = (role: Role) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p>Excluir a permissão <strong>"{role.name}"</strong>? <br/> <span className="text-xs text-red-500">Atenção: A permissão será removida de todos os usuários.</span></p>
                <div className="flex gap-2">
                    <button onClick={async () => { toast.dismiss(t.id); await onDelete(role); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">Confirmar Exclusão</button>
                    <button onClick={() => toast.dismiss(t.id)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1 px-2 rounded text-sm">Cancelar</button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

    const handleSave = async (data: Omit<Role, 'uuid'>) => {
        const success = await onSave(data);
        if (success) setFormState({ mode: 'view' });
    };

    const handleUpdate = async (data: Role) => {
        const success = await onUpdate(data);
        if (success) setFormState({ mode: 'view' });
    };

    // Reseta o estado do formulário ao fechar o modal
    useEffect(() => {
        if (!isOpen) {
            setFormState({ mode: 'view' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Gerenciar Permissões (Roles)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XIcon className="w-6 h-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-3">
                    {/* Lista de Permissões */}
                    {roles.length > 0 ? roles.map(role => (
                        <div key={role.uuid} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="font-bold px-3 py-1 text-sm rounded-full text-white shadow" style={{ backgroundColor: role.color }}>{role.name}</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">{role.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setFormState({ mode: 'edit', role })} className="p-2 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleConfirmDelete(role)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" title="Excluir"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            Nenhuma permissão cadastrada.
                        </div>
                    )}

                    {/* Formulário de Adicionar/Editar */}
                    {(formState.mode === 'add' || formState.mode === 'edit') && (
                        <RoleForm 
                            key={formState.role?.uuid || 'new'} // Força a recriação do formulário ao mudar
                            initialData={formState.role} 
                            onSave={formState.mode === 'add' ? handleSave : handleUpdate} 
                            onCancel={() => setFormState({ mode: 'view' })} 
                        />
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <button onClick={() => setFormState({ mode: 'add' })} disabled={formState.mode !== 'view'} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusIcon className="w-5 h-5"/> Nova Permissão
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Fechar</button>
                </div>
            </div>
             <style>{`.animate-scale-in{animation:scale-in .2s ease-out forwards}@keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}} .animate-fade-in{animation:fade-in .3s ease-out forwards}@keyframes fade-in{from{opacity:0}to{opacity:1}}`}</style>
        </div>
    );
};

export default GerenciarRolesModal;