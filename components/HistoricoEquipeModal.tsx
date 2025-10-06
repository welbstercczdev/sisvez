import React, { useEffect, useMemo } from 'react';
import { XIcon, CalendarIcon, PersonIcon, PencilIcon, PersonPlusIcon, PersonMinusIcon, ToggleOnIcon } from './icons/IconComponents';
import { Equipe, HistoricoEquipe, HistoricoAcao } from '../types';

interface HistoricoEquipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipe: Equipe | null;
}

const AcaoIcon: React.FC<{ acao: HistoricoAcao }> = ({ acao }) => {
    const iconMap: Record<HistoricoAcao, React.ComponentType<{ className?: string }>> = {
        criacao: PencilIcon,
        edicao_nome: PencilIcon,
        troca_lider: PersonIcon,
        add_membro: PersonPlusIcon,
        rem_membro: PersonMinusIcon,
        mudanca_status: ToggleOnIcon,
    };
    const IconComponent = iconMap[acao] || PencilIcon;
    return <IconComponent className="w-4 h-4 text-sky-800 dark:text-sky-300" />;
};

const DetalhesAlteracao: React.FC<{ item: HistoricoEquipe }> = ({ item }) => {
    const renderDetalhe = () => {
        switch (item.acao) {
            case 'criacao':
                return <>Equipe criada com o nome: <strong>{item.detalhes.para}</strong></>;
            case 'edicao_nome':
                return <>Nome alterado de <strong>'{item.detalhes.de}'</strong> para <strong>'{item.detalhes.para}'</strong></>;
            case 'troca_lider':
                return <>Líder alterado de <strong>'{item.detalhes.de}'</strong> para <strong>'{item.detalhes.para}'</strong></>;
            case 'add_membro':
                return <>Membro adicionado: <span className="font-semibold text-green-600 dark:text-green-400">{item.detalhes.membro}</span></>;
            case 'rem_membro':
                return <>Membro removido: <span className="font-semibold text-red-600 dark:text-red-400">{item.detalhes.membro}</span></>;
            case 'mudanca_status':
                return <>Status alterado de <strong>'{item.detalhes.de}'</strong> para <strong>'{item.detalhes.para}'</strong></>;
            default:
                return <span>Detalhes não especificados.</span>;
        }
    };

    return <p className="text-sm font-normal text-slate-600 dark:text-slate-300">{renderDetalhe()}</p>;
};

const HistoricoEquipeModal: React.FC<HistoricoEquipeModalProps> = ({ isOpen, onClose, equipe }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const historicoOrdenado = useMemo(() => {
        if (!equipe?.historico) return [];
        return [...equipe.historico].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [equipe]);

    if (!isOpen || !equipe) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Histórico da Equipe: <span className="font-bold">{equipe.nome}</span>
                    </h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {historicoOrdenado.length > 0 ? (
                        <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-4">                  
                           {historicoOrdenado.map((item, index) => (
                                <li key={item.id} className={`mb-8 ml-8 ${index === historicoOrdenado.length - 1 ? 'mb-0' : ''}`}>
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-sky-100 rounded-full -left-4 ring-8 ring-white dark:ring-slate-800 dark:bg-sky-900">
                                        <AcaoIcon acao={item.acao} />
                                    </span>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <time className="block text-xs font-normal leading-none text-slate-400 dark:text-slate-500">
                                                {new Date(item.data).toLocaleDateString('pt-BR')} às {new Date(item.data).toLocaleTimeString('pt-BR')}
                                            </time>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <PersonIcon className="w-3 h-3" />
                                                <span>{item.usuario}</span>
                                            </div>
                                        </div>
                                        <DetalhesAlteracao item={item} />
                                    </div>
                                </li>
                           ))}
                        </ol>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">Nenhum histórico encontrado para esta equipe.</p>
                    )}
                </div>
                 <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                        Fechar
                    </button>
                </div>
            </div>
            <style>{`.animate-scale-in{animation:scale-in .2s ease-out forwards}@keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        </div>
    );
};

export default HistoricoEquipeModal;