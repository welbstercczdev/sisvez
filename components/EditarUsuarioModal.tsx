import React, { useState, useEffect } from 'react';
import { User, Role, ROLES_DISPONIVEIS } from '../types';

interface EditarUsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null;
}

const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({ isOpen, onClose, onSave, user }) => {
    // Estados internos para cada campo editável do formulário
    const [id, setId] = useState<string | number>('');
    const [name, setName] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

    // Este efeito é executado sempre que um novo usuário é passado para o modal.
    // Ele preenche os campos do formulário com os dados atuais do usuário.
    useEffect(() => {
        if (user) {
            setId(user.id);
            setName(user.name);
            setSelectedRoles(user.roles || []);
        }
    }, [user]);

    // Função para lidar com a seleção/desseleção dos checkboxes de permissões
    const handleRoleChange = (role: Role) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
                ? prev.filter(r => r !== role) // Se já estiver selecionado, remove
                : [...prev, role]             // Se não, adiciona
        );
    };

    // Função chamada ao clicar no botão "Salvar Alterações"
    const handleSave = () => {
        const idAsString = String(id).trim();
        // Garante que a matrícula e o nome não estão vazios
        if (idAsString && name.trim() && user) {
            // Cria um novo objeto de usuário com todos os dados atualizados
            const updatedUser: User = { 
                ...user, 
                id: idAsString, 
                name: name.trim(), 
                roles: selectedRoles 
            };
            // Envia o objeto atualizado de volta para a página principal
            onSave(updatedUser);
        }
    };

    // Não renderiza nada se o modal não estiver aberto ou se nenhum usuário foi selecionado
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Editar Usuário</h3>
                </div>
                <div className="p-6 space-y-4">
                    {/* Campo para editar a Matrícula (ID) */}
                    <div>
                        <label htmlFor="userIdEdit" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Matrícula / ID
                        </label>
                        <input
                            id="userIdEdit"
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    {/* Campo para editar o Nome Completo */}
                    <div>
                        <label htmlFor="userNameEdit" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Nome Completo
                        </label>
                        <input
                            id="userNameEdit"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    {/* Seção para editar as Permissões (Roles) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Permissões (Roles)
                        </label>
                        <div className="space-y-2">
                            {ROLES_DISPONIVEIS.map(role => (
                                <label key={role} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => handleRoleChange(role)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{role}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!String(id).trim() || !name.trim()} 
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditarUsuarioModal;