import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { HomeIcon, PlusIcon, PencilIcon, TrashIcon } from '../components/icons/IconComponents';
import { User } from '../types';
import InserirUsuarioModal from '../components/InserirUsuarioModal';
import EditarUsuarioModal from '../components/EditarUsuarioModal';

// URL do seu Web App publicado no Google Apps Script
// SUBSTITUA PELA SUA URL REAL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyotEdB0INfTNUK9q6MKbHEMQFUzwi5rMYnfZ6tQ7OaQ4ojOa9J3ItXqNsjjEl4XqN0/exec';

interface UsuariosPageProps {
    onNavigate: (page: string) => void;
}

const UsuariosPage: React.FC<UsuariosPageProps> = ({ onNavigate }) => {
    // Estados para os dados da API
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para controle dos modais
    const [isInserirModalOpen, setIsInserirModalOpen] = useState(false);
    const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
    const [usuarioParaEditar, setUsuarioParaEditar] = useState<User | null>(null);

    // Função para buscar os dados do backend
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?api=usuarios`);
            const result = await response.json();
            if (result.success) {
                setUsuarios(result.data || []);
            } else {
                throw new Error(result.error || 'Falha ao buscar usuários da base de dados.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
            setError(errorMessage);
            toast.error(`Erro ao carregar dados: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Busca os dados iniciais quando o componente é montado
    useEffect(() => {
        fetchData();
    }, []);

    // Função genérica para enviar dados via POST
    const postData = async (action: string, payload: any) => {
        const loadingToastId = toast.loading('Processando sua solicitação...');
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({ api: 'usuarios', action, payload }),
                headers: { "Content-Type": "text/plain;charset=utf-8" },
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            toast.success(result.message || 'Operação realizada com sucesso!', { id: loadingToastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro na operação.';
            toast.error(`Falha: ${errorMessage}`, { id: loadingToastId });
            return false;
        }
    };

    // Funções de manipulação de dados (Salvar, Atualizar, Deletar)
    const handleSaveUsuario = async (name: string) => {
        const success = await postData('create', { name });
        if (success) {
            setIsInserirModalOpen(false);
            fetchData(); // Recarrega a lista para mostrar o novo usuário
        }
    };

    const handleUpdateUsuario = async (user: User) => {
        const success = await postData('update', user);
        if (success) {
            setIsEditarModalOpen(false);
            fetchData(); // Recarrega a lista para mostrar as alterações
        }
    };
    
    const handleDeleteUsuario = (user: User) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p>Tem certeza que deseja excluir o usuário <strong>"{user.name}"</strong>? Esta ação não pode ser desfeita.</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const success = await postData('delete', { id: user.id });
                            if (success) fetchData(); // Recarrega a lista
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Excluir
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1 px-2 rounded text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000, position: "top-center" });
    };

    // Funções para abrir os modais
    const handleOpenEditModal = (user: User) => {
        setUsuarioParaEditar(user);
        setIsEditarModalOpen(true);
    };

    return (
        <>
            <Toaster position="top-right" />
            <section className="space-y-6 pb-8">
                {/* Breadcrumbs */}
                <div>
                     <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse text-sm">
                            <li className="inline-flex items-center">
                                <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200">
                                    <HomeIcon className="w-4 h-4 me-2.5" />
                                </button>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/></svg>
                                    <span className="ms-1 font-medium text-slate-500 dark:text-slate-400 md:ms-2">Recursos Humanos</span>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/></svg>
                                    <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Usuários</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Header da Página */}
                <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gerenciar Usuários</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Adicione, edite ou remova usuários do sistema.</p>
                    </div>
                    <button onClick={() => setIsInserirModalOpen(true)} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Usuário</span>
                    </button>
                </div>
                
                {/* Tabela de Usuários */}
                <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="py-3 px-6">UUID</th>
                                <th scope="col" className="py-3 px-6">ID</th>
                                <th scope="col" className="py-3 px-6">Nome</th>
                                <th scope="col" className="py-3 px-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-6 text-slate-500 dark:text-slate-400">Carregando usuários...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={4} className="text-center py-6 text-red-500"><strong>Falha ao carregar:</strong> {error}</td></tr>
                            ) : usuarios.length > 0 ? usuarios.map(user => (
                                <tr key={user.uuid} className="border-b dark:border-slate-700">
                                    <td className="py-4 px-6 font-mono text-xs text-slate-400">{user.uuid}</td>
                                    <td className="py-4 px-6 font-mono text-xs text-slate-400">{user.id}</td>
                                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{user.name}</td>
                                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenEditModal(user)} className="p-2 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteUsuario(user)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum usuário cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modais */}
            <InserirUsuarioModal 
                isOpen={isInserirModalOpen}
                onClose={() => setIsInserirModalOpen(false)}
                onSave={handleSaveUsuario}
            />
            <EditarUsuarioModal 
                isOpen={isEditarModalOpen}
                onClose={() => setIsEditarModalOpen(false)}
                onSave={handleUpdateUsuario}
                user={usuarioParaEditar}
            />
        </>
    );
};

export default UsuariosPage;