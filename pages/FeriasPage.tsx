import React, { useState } from 'react';
import { HomeIcon, PlusIcon, PencilIcon, TrashIcon } from '../components/icons/IconComponents';
import { Ferias, User } from '../types';
import AgendarFeriasModal from '../components/AgendarFeriasModal';

const statusStyles: { [key in Ferias['status']]: string } = {
    Agendada: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Em Andamento': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Concluída: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Cancelada: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

interface FeriasPageProps {
    onNavigate: (page: string) => void;
    feriasList: Ferias[];
    setFeriasList: React.Dispatch<React.SetStateAction<Ferias[]>>;
    allUsers: User[];
}

const FeriasPage: React.FC<FeriasPageProps> = ({ onNavigate, feriasList, setFeriasList, allUsers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feriasParaEditar, setFeriasParaEditar] = useState<Ferias | null>(null);

    const handleOpenModal = (ferias?: Ferias) => {
        setFeriasParaEditar(ferias || null);
        setIsModalOpen(true);
    };
    
    const handleSaveFerias = (ferias: Ferias) => {
        if (feriasParaEditar) {
            setFeriasList(prev => prev.map(f => f.id === ferias.id ? ferias : f));
        } else {
            setFeriasList(prev => [...prev, { ...ferias, id: `FER-${Date.now()}` }]);
        }
        setIsModalOpen(false);
        setFeriasParaEditar(null);
    };

    const handleDeleteFerias = (id: string) => {
        if (window.confirm('Tem certeza que deseja cancelar estas férias?')) {
            setFeriasList(prev => prev.map(f => f.id === id ? { ...f, status: 'Cancelada' } : f));
        }
    };
    
    const calculateDuration = (start: string, end: string): number => {
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
        return diffDays;
    };

    return (
        <>
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
                            <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <span className="ms-1 font-medium text-slate-500 dark:text-slate-400 md:ms-2">Recursos Humanos</span>
                        </div>
                        </li>
                        <li aria-current="page">
                        <div className="flex items-center">
                            <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Férias</span>
                        </div>
                        </li>
                    </ol>
                  </nav>
                </div>

                {/* Header and Actions */}
                <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Controle de Férias</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os períodos de férias dos funcionários.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                        <PlusIcon className="w-5 h-5" />
                        <span>Agendar Férias</span>
                    </button>
                </div>

                {/* Vacations Table */}
                <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th scope="col" className="py-3 px-6">Funcionário</th>
                                    <th scope="col" className="py-3 px-6">Data de Início</th>
                                    <th scope="col" className="py-3 px-6">Data de Fim</th>
                                    <th scope="col" className="py-3 px-6 text-center">Duração</th>
                                    <th scope="col" className="py-3 px-6 text-center">Status</th>
                                    <th scope="col" className="py-3 px-6 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feriasList.sort((a,b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()).map((item) => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                        <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.funcionario.name}</td>
                                        <td className="py-4 px-6">{new Date(item.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td className="py-4 px-6">{new Date(item.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td className="py-4 px-6 text-center">{calculateDuration(item.dataInicio, item.dataFim)} dias</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[item.status]}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-4">
                                                <button onClick={() => handleOpenModal(item)} className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300" title="Editar">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteFerias(item.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Cancelar Férias">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            <AgendarFeriasModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFeriasParaEditar(null); }}
                onSave={handleSaveFerias}
                feriasExistente={feriasParaEditar}
                funcionarios={allUsers}
            />
        </>
    );
};

export default FeriasPage;