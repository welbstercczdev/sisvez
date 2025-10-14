import React, { useState, useEffect } from 'react';
// 1. IMPORTAR A BIBLIOTECA DE TOAST
import toast, { Toaster } from 'react-hot-toast';
import { HomeIcon, MapPinIcon, ClusterIcon } from '../components/icons/IconComponents';
import { Atividade, Equipe } from '../types';
import QuadraSelectionList from '../components/QuadraSelectionList';

// URL do seu Web App publicado no Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyotEdB0INfTNUK9q6MKbHEMQFUzwi5rMYnfZ6tQ7OaQ4ojOa9J3ItXqNsjjEl4XqN0/exec'; 

// Interface das props do componente
interface AtividadeControleCriadourosPageProps {
    onNavigate: (page: string) => void;
    notification: Atividade | null;
    equipes: Equipe[];
}

// Componente auxiliar para campos de formulário
const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
        {children}
    </div>
);

// Função utilitária para converter data DD/MM/YYYY para YYYY-MM-DD
const formatDateForInput = (dateStr: string): string => {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return '';
    }
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};

const AtividadeControleCriadourosPage: React.FC<AtividadeControleCriadourosPageProps> = ({ onNavigate, notification, equipes }) => {
    
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        dataCC: '',
        equipeCC: '',
        relacaoQuadras: '',
        totalQuadras: 0,
    });

    useEffect(() => {
        if (notification) {
            const quadras = notification.relacaoQuadrasControleCriadouros || '';
            const quadrasCount = quadras ? quadras.split(',').filter(Boolean).length : 0;
            
            setFormData({
                dataCC: formatDateForInput(notification.NOTIF_DT),
                equipeCC: '',
                relacaoQuadras: quadras,
                totalQuadras: quadrasCount
            });
        }
    }, [notification]);

    useEffect(() => {
        const count = formData.relacaoQuadras.split(',').map(s => s.trim()).filter(Boolean).length;
        if (count !== formData.totalQuadras) {
            setFormData(prev => ({ ...prev, totalQuadras: count }));
        }
    }, [formData.relacaoQuadras]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleQuadrasChange = (newValue: string) => {
        setFormData(prev => ({ ...prev, relacaoQuadras: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!notification) {
            // Substituído alert por toast.error
            toast.error("Erro: Nenhuma notificação está carregada.");
            return;
        }

        if (!formData.dataCC || !formData.equipeCC) {
            // Substituído alert por toast.error
            toast.error("Por favor, preencha a Data e selecione uma Equipe.");
            return;
        }

        setIsLoading(true);
        // Usamos um toast de loading que será atualizado para sucesso ou erro
        const loadingToastId = toast.loading('Salvando programação...');

        const fullAddress = `${notification.PAC_LOGR}, ${notification.PAC_NUM} - ${notification.PAC_BAIR}, ${notification.PAC_CDD}`;

        const payload = {
            dataCC: formData.dataCC,
            equipeCC: formData.equipeCC,
            totalQuadras: formData.totalQuadras,
            relacaoQuadras: formData.relacaoQuadras,
            notificationId: notification.ID,
            notificationYear: notification.ANO,
            agravo: notification.AGRAVO,
            fullAddress: fullAddress,
            agrupamentoNome: notification.agrupamentoNome || "",
            area: notification.PAC_REG,
            bairro: notification.PAC_BAIR,
        };

        const requestBody = {
            api: 'controleCriadouros',
            payload: payload
        };

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                redirect: "follow",
                body: JSON.stringify(requestBody),
                headers: { "Content-Type": "text/plain;charset=utf-8" },
            });

            const result = await response.json();

            if (result.success) {
                // Substituído alert por toast.success
                toast.success(result.message, { id: loadingToastId });
                // Adiciona um pequeno delay antes de navegar para o usuário ver a mensagem
                setTimeout(() => {
                    onNavigate('demandas');
                }, 1500);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Substituído alert por toast.error
            toast.error(`Falha ao salvar: ${errorMessage}`, { id: loadingToastId });
        } finally {
            setIsLoading(false);
        }
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
                        <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Atividade de Controle de Criadouros</span>
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
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Por favor, retorne à página de Demandas para selecionar uma notificação.</p>
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
            {/* 2. ADICIONAR O COMPONENTE <Toaster /> PARA RENDERIZAR AS NOTIFICAÇÕES */}
            {/* Ele pode ficar em qualquer lugar, mas aqui no topo é uma boa prática. */}
            <Toaster position="top-right" reverseOrder={false} />

            <section className="space-y-6 pb-8">
                <div>{breadcrumbs}</div>
                
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <FormField label="Número da notificação">
                                <input type="text" value={`${notification.ID}/${String(notification.ANO).slice(-2)}`} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" />
                            </FormField>
                            <FormField label="Agravo"><input type="text" value={notification.AGRAVO} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Data CC">
                                <input
                                    type="date"
                                    id="dataCC"
                                    name="dataCC"
                                    value={formData.dataCC}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                />
                            </FormField>
                            <FormField label="Equipe CC">
                                <select
                                    id="equipeCC"
                                    name="equipeCC"
                                    value={formData.equipeCC}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="">-- Selecione uma equipe --</option>
                                    {equipes.filter(e => e.status === 'Ativo').map(equipe => (
                                        <option key={equipe.id} value={equipe.nome}>{equipe.nome}</option>
                                    ))}
                                </select>
                            </FormField>
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
                            <FormField label="Área"><input type="text" value={notification.PAC_REG} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Bairro"><input type="text" value={notification.PAC_BAIR} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Total de quadras">
                                <input
                                    type="text"
                                    id="totalQuadras"
                                    value={formData.totalQuadras}
                                    disabled
                                    className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-center font-medium"
                                />
                            </FormField>
                            <div className="md:col-span-2 lg:col-span-3">
                                <QuadraSelectionList
                                    label="Relação de quadras"
                                    value={formData.relacaoQuadras}
                                    onChange={handleQuadrasChange}
                                    areaId={notification?.PAC_REG}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 disabled:bg-sky-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Programação de CC'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
};

export default AtividadeControleCriadourosPage;