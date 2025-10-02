import React, { useState, useEffect } from 'react';
import { HomeIcon, CalendarIcon, MapPinIcon, ClusterIcon } from '../components/icons/IconComponents';
import { Atividade, Equipe } from '../types';
import QuadraSelectionList from '../components/QuadraSelectionList';

interface AtividadeNebulizacaoPageProps {
    onNavigate: (page: string) => void;
    notification: Atividade | null;
    equipes: Equipe[];
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
        {children}
    </div>
);

const AtividadeNebulizacaoPage: React.FC<AtividadeNebulizacaoPageProps> = ({ onNavigate, notification, equipes }) => {
    const [formData, setFormData] = useState({
        diaNeb: '',
        equipeNeb: '',
        numeroNeb: '',
        relacaoQuadrasControleCriadouros: '',
        totalQuadrasControleCriadouros: 0,
        relacaoQuadrasNebulizacao: '',
        totalQuadrasNebulizacao: 0,
    });

    useEffect(() => {
        if (notification) {
            const quadrasCC = notification.relacaoQuadrasControleCriadouros || '';
            const quadrasCCCount = quadrasCC ? quadrasCC.split(',').filter(Boolean).length : 0;
            setFormData(prev => ({
                ...prev,
                diaNeb: '',
                equipeNeb: '',
                numeroNeb: '',
                relacaoQuadrasControleCriadouros: quadrasCC,
                totalQuadrasControleCriadouros: quadrasCCCount,
                relacaoQuadrasNebulizacao: quadrasCC, // Pre-fill NEB quadras for convenience
            }));
        }
    }, [notification]);

    useEffect(() => {
        const count = formData.relacaoQuadrasNebulizacao.split(',').map(s => s.trim()).filter(Boolean).length;
        if (count !== formData.totalQuadrasNebulizacao) {
            setFormData(prev => ({ ...prev, totalQuadrasNebulizacao: count }));
        }
    }, [formData.relacaoQuadrasNebulizacao]);

    const handleQuadrasNebChange = (newValue: string) => {
        setFormData(prev => ({ ...prev, relacaoQuadrasNebulizacao: newValue }));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic to save the nebulization schedule would go here.
        console.log("Saving Nebulization Data:", formData);
        alert('Programação de Nebulização Salva!');
        onNavigate('demandas'); // Navigate back after saving
    };
    
    const breadcrumbs = (
        <nav className="flex items-center text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li className="inline-flex items-center">
                    <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200">
                        <HomeIcon className="w-4 h-4 me-2.5" />
                        Arboviroses
                    </button>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/></svg>
                        <button onClick={() => onNavigate('demandas')} className="ms-1 font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200 md:ms-2">Demandas</button>
                    </div>
                </li>
                <li aria-current="page">
                    <div className="flex items-center">
                        <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/></svg>
                        <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Atividade de Nebulização</span>
                    </div>
                </li>
            </ol>
        </nav>
    );

    if (!notification) {
        return (
            <section className="space-y-6 pb-8">
                <div>{breadcrumbs}</div>
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 text-center">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Nenhuma Notificação Selecionada</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Por favor, retorne à página de Demandas para selecionar uma notificação antes de criar a atividade.</p>
                    <button onClick={() => onNavigate('demandas')} className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-md text-sm">
                        Voltar para Demandas
                    </button>
                </div>
            </section>
        );
    }

    const fullAddress = `${notification.PAC_LOGR}, ${notification.PAC_NUM} - ${notification.PAC_BAIR}, ${notification.PAC_CDD}`;

    return (
        <>
            <section className="space-y-6 pb-8">
                <div>{breadcrumbs}</div>
                
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <FormField label="Número da notificação">
                                <input type="text" value={`DP ${notification.ID}`} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" />
                            </FormField>
                            <FormField label="Dia da NEB">
                                <div className="relative">
                                    <input type="date" name="diaNeb" value={formData.diaNeb} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </FormField>
                            <FormField label="Equipe Neb">
                                <select
                                    name="equipeNeb"
                                    value={formData.equipeNeb}
                                    onChange={handleInputChange}
                                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="">-- Selecione uma equipe --</option>
                                    {equipes.filter(e => e.status === 'Ativo').map(equipe => (
                                        <option key={equipe.id} value={equipe.nome}>{equipe.nome}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="Agravo"><input type="text" value={notification.AGRAVO} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Data CC"><input type="date" value={notification.dataControleCriadouros || ''} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-1.5 text-sm" /></FormField>
                            <FormField label="Equipe CC"><input type="text" value={notification.equipeControleCriadouros || 'N/A'} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <div className="md:col-span-2 lg:col-span-3">
                                <FormField label="Endereço">
                                    <div className="relative">
                                        <input type="text" value={fullAddress} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm pr-10" />
                                        <MapPinIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </FormField>
                            </div>
                            {notification?.isAgrupamento && (
                                <div className="md:col-span-2 lg:col-span-3">
                                    <FormField label="Agrupamento de Origem">
                                        <div className="relative">
                                            <input type="text" value={notification.agrupamentoNome} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm pl-10" />
                                            <ClusterIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </FormField>
                                </div>
                            )}
                            <FormField label="Número da Neb"><input type="text" name="numeroNeb" value={formData.numeroNeb} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" /></FormField>
                            <FormField label="Área"><input type="text" value={notification.PAC_REG} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Bairro"><input type="text" value={notification.PAC_BAIR} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            
                            {/* CC Quadras Section (Reference) */}
                            <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Quadras do Controle de Criadouros (Referência)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <FormField label="Total de quadras CC">
                                        <input type="text" value={formData.totalQuadrasControleCriadouros} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-center font-medium" />
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <QuadraSelectionList
                                            label="Relação de quadras CC"
                                            value={formData.relacaoQuadrasControleCriadouros}
                                            onChange={() => {}} // Read-only, so no action needed
                                            areaId={notification?.PAC_REG}
                                            readOnly={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* NEB Quadras Section (Editable) */}
                             <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Quadras para Nebulização</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <FormField label="Total de quadras NEB">
                                        <input type="text" id="totalQuadrasNeb" value={formData.totalQuadrasNebulizacao} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-center font-medium" />
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <QuadraSelectionList
                                            label="Relação de quadras para Nebulização"
                                            value={formData.relacaoQuadrasNebulizacao}
                                            onChange={handleQuadrasNebChange}
                                            areaId={notification?.PAC_REG}
                                        />
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200"
                            >
                                Salvar Programação Neb
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
};

export default AtividadeNebulizacaoPage;