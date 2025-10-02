import React, { useState } from 'react';
import { HomeIcon } from '../components/icons/IconComponents';

interface PerfilPageProps {
    onNavigate: (page: string) => void;
}

const PerfilPage: React.FC<PerfilPageProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'edit':
                return <ProfileEditForm />;
            case 'password':
                return <ChangePasswordForm />;
            case 'overview':
            default:
                return <ProfileOverview />;
        }
    };

    return (
        <section className="space-y-6 pb-8">
            {/* Breadcrumbs */}
            <div>
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse text-sm">
                        <li className="inline-flex items-center">
                            <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200">
                                <HomeIcon className="w-4 h-4 me-2.5" />
                                Home
                            </button>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Perfil</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="xl:col-span-1">
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 text-center">
                        <img className="w-28 h-28 rounded-full mx-auto mb-4 ring-4 ring-slate-200 dark:ring-slate-700" src="https://picsum.photos/seed/user/128/128" alt="Profile" />
                        <h5 className="mb-1 text-xl font-medium text-slate-900 dark:text-white">WELBSTER</h5>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Desenvolvedor de Sistemas</span>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="xl:col-span-2">
                    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                        <div className="border-b border-slate-200 dark:border-slate-700">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('overview')} className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'overview' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}`}>
                                    Visão Geral
                                </button>
                                <button onClick={() => setActiveTab('edit')} className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'edit' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}`}>
                                    Editar Perfil
                                </button>
                                <button onClick={() => setActiveTab('password')} className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'password' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}`}>
                                    Alterar Senha
                                </button>
                            </nav>
                        </div>
                        <div className="pt-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ProfileOverview = () => (
    <div className="space-y-4">
        <h5 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Detalhes do Perfil</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="font-medium text-slate-500 dark:text-slate-400">Nome Completo</div>
            <div className="text-slate-700 dark:text-slate-300">Welbster de Souza</div>
            
            <div className="font-medium text-slate-500 dark:text-slate-400">Empresa</div>
            <div className="text-slate-700 dark:text-slate-300">Prefeitura de São José dos Campos</div>

            <div className="font-medium text-slate-500 dark:text-slate-400">Cargo</div>
            <div className="text-slate-700 dark:text-slate-300">Desenvolvedor de Sistemas</div>

            <div className="font-medium text-slate-500 dark:text-slate-400">País</div>
            <div className="text-slate-700 dark:text-slate-300">Brasil</div>

            <div className="font-medium text-slate-500 dark:text-slate-400">Endereço</div>
            <div className="text-slate-700 dark:text-slate-300">Rua Exemplo, 123, Bairro, SJC, SP</div>

            <div className="font-medium text-slate-500 dark:text-slate-400">Telefone</div>
            <div className="text-slate-700 dark:text-slate-300">(12) 3456-7890</div>

            <div className="font-medium text-slate-500 dark:text-slate-400">Email</div>
            <div className="text-slate-700 dark:text-slate-300">welbster.exemplo@sjc.sp.gov.br</div>
        </div>
    </div>
);

const ProfileEditForm = () => (
    <form className="space-y-6">
        <h5 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Editar Perfil</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input type="text" id="fullName" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" defaultValue="Welbster de Souza" />
            </div>
             <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Empresa</label>
                <input type="text" id="company" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" defaultValue="Prefeitura de São José dos Campos" />
            </div>
             <div>
                <label htmlFor="job" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo</label>
                <input type="text" id="job" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" defaultValue="Desenvolvedor de Sistemas" />
            </div>
             <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">País</label>
                <input type="text" id="country" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" defaultValue="Brasil" />
            </div>
             <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                <input type="text" id="address" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" defaultValue="Rua Exemplo, 123, Bairro, SJC, SP" />
            </div>
             <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                <input type="tel" id="phone" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" defaultValue="(12) 3456-7890" />
            </div>
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" id="email" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" defaultValue="welbster.exemplo@sjc.sp.gov.br" />
            </div>
        </div>
        <div className="text-right">
            <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900">
                Salvar Alterações
            </button>
        </div>
    </form>
);

const ChangePasswordForm = () => (
    <form className="space-y-6 max-w-lg">
         <h5 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Alterar Senha</h5>
        <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha Atual</label>
            <input type="password" id="currentPassword" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
         <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
            <input type="password" id="newPassword" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
         <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar Nova Senha</label>
            <input type="password" id="confirmPassword" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div className="text-right">
             <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900">
                Alterar Senha
            </button>
        </div>
    </form>
);

export default PerfilPage;