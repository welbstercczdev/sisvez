import React, { useEffect } from 'react';
import { XIcon } from './icons/IconComponents';

interface QuadraDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: any | null; // The GeoJSON feature object
}

const DetailItem: React.FC<{ label: string, value: string | number | undefined }> = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200 sm:mt-0 sm:col-span-2">{value ?? 'N/A'}</dd>
    </div>
);

const QuadraDetailModal: React.FC<QuadraDetailModalProps> = ({ isOpen, onClose, feature }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !feature) return null;

    const props = feature.properties;
    const quadraId = props.title?.split(':')[1]?.trim() || 'Desconhecida';

    const imoveisKeys = [
        'AP_ACIMA_1_ (NAO TRAB)', 'AP_ACIMA_1_(TRAB)', 'AP_ATE_1_ANDAR', 'JARDIM', 
        'NAO_RESID_1_ANDAR', 'NAO_RESID_TERREO', 'OBRAS', 'PRACA', 'RESID_TERREO', 'TERRENO_BALDIO'
    ];
    const totalImoveis = imoveisKeys.reduce((sum, key) => sum + (Number(props[key]) || 0), 0);

    const displayProps = { ...props, total_imoveis: totalImoveis };

    // Map property keys to human-readable labels
    const propertyLabels: { [key: string]: string } = {
        area_m2: 'Área (m²)',
        perimetro_m: 'Perímetro (m)',
        'AP_ACIMA_1_ (NAO TRAB)': 'AP ACIMA 1 (NÃO TRAB)',
        'AP_ACIMA_1_(TRAB)': 'AP ACIMA 1 (TRAB)',
        'AP_ATE_1_ANDAR': 'AP ATÉ 1 ANDAR',
        'JARDIM': 'JARDIM',
        'NAO_RESID_1_ANDAR': 'NÃO RESID 1 ANDAR',
        'NAO_RESID_TERREO': 'NÃO RESID TERREO',
        'OBRAS': 'OBRAS',
        'PRACA': 'PRAÇA',
        'RESID_TERREO': 'RESID TERREO',
        'TERRENO_BALDIO': 'TERRENO BALDIO',
        censitario: 'Setor Censitário',
        total_imoveis: 'Total de Imóveis',
    };
    
    // Order of display for properties based on user request
    const displayOrder = [
        'area_m2', 'perimetro_m',
        'AP_ACIMA_1_ (NAO TRAB)', 'AP_ACIMA_1_(TRAB)', 'AP_ATE_1_ANDAR', 
        'JARDIM', 'NAO_RESID_1_ANDAR', 'NAO_RESID_TERREO', 'OBRAS', 
        'PRACA', 'RESID_TERREO', 'TERRENO_BALDIO',
        'censitario', 'total_imoveis'
    ];

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Detalhes da Quadra: {quadraId}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                   <dl className="divide-y divide-slate-200 dark:divide-slate-700">
                        {displayOrder.map(key => (
                           <DetailItem key={key} label={propertyLabels[key] || key} value={displayProps[key]} />
                        ))}
                   </dl>
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
             <style>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default QuadraDetailModal;