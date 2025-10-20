import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Role } from '../types';
import { TrashIcon } from './icons/IconComponents'; // Adicionar ícone de lixeira

interface EditarUsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null;
    availableRoles: Role[];
}

const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({ isOpen, onClose, onSave, user, availableRoles }) => {
    const [id, setId] = useState<string | number>('');
    const [name, setName] = useState('');
    const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setId(user.id);
            setName(user.name);
            setSelectedRoleNames(user.roles || []);
        }
    }, [user]);

    // Função para ADICIONAR uma role (clicando no checkbox)
    const handleAddRole = (roleName: string) => {
        if (!selectedRoleNames.includes(roleName)) {
            setSelectedRoleNames(prev => [...prev, roleName]);
        }
    };

    // ====================== NOVA LÓGICA DE REMOÇÃO SEGURA ======================
    // Função para INICIAR a remoção de uma role (clicando na lixeira)
    const handleInitiateRemoveRole = (roleName: string) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p>Remover a permissão <strong>"{roleName}"</strong> de {name}?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            // Efetiva a remoção no estado do modal
                            setSelectedRoleNames(prev => prev.filter(name => name !== roleName));
                            toast.dismiss(t.id);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Confirmar
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)} 
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1 px-2 rounded text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };
    // =======================================================================

    const handleSave = () => {
        const idAsString = String(id).trim();
        if (idAsString && name.trim() && user) {
            const updatedUser: User = { ...user, id: idAsString, name: name.trim(), roles: selectedRoleNames };
            onSave(updatedUser);
        }
    };

    if (!isOpen || !user) return null;

    // Separa as roles que o usuário já tem das que ele não tem
    const userRoles = availableRoles.filter(role => selectedRoleNames.includes(role.name));
    const unassignedRoles = availableRoles.filter(role => !selectedRoleNames.includes(role.name));

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Editar Usuário</h3>
                </div>
                <div className="p-6 space-y-6">
                    {/* Campos de Matrícula e Nome (sem alterações) */}
                    <div>
                        <label htmlFor="userIdEdit" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Matrícula / ID</label>
                        <input id="userIdEdit" type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full form-input"/>
                    </div>
                    <div>
                        <label htmlFor="userNameEdit" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Nome Completo</label>
                        <input id="userNameEdit" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full form-input"/>
                    </div>
                    
                    {/* Seção de Permissões redesenhada */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Permissões (Roles)</label>
                        
                        {/* Lista de permissões que o usuário JÁ POSSUI */}
                        <div className="space-y-2">
                            {userRoles.length > 0 ? userRoles.map(role => (
                                <div key={role.uuid} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{role.name}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleInitiateRemoveRole(role.name)}
                                        className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                        title={`Remover permissão ${role.name}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-400 italic text-center py-2">Nenhuma permissão atribuída.</p>
                            )}
                        </div>

                        <hr className="my-4 border-slate-200 dark:border-slate-700"/>

                        {/* Lista de permissões disponíveis para ADICIONAR */}
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Adicionar permissões</label>
                        <div className="space-y-2">
                            {unassignedRoles.length > 0 ? unassignedRoles.map(role => (
                                <label key={role.uuid} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={false} // Sempre desmarcado, pois é apenas para adicionar
                                        onChange={() => handleAddRole(role.name)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{role.name}</span>
                                </label>
                            )) : (
                                <p className="text-sm text-slate-400 italic">Todas as permissões já foram atribuídas.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancelar</button>
                    <button onClick={handleSave} disabled={!String(id).trim() || !name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};

export default EditarUsuarioModal;