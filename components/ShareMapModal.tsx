import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons/IconComponents';

declare const QRCode: any;

interface ShareMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareData: string;
}

const ShareMapModal: React.FC<ShareMapModalProps> = ({ isOpen, onClose, shareData }) => {
    const qrCodeRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen && shareData && qrCodeRef.current) {
            QRCode.toCanvas(qrCodeRef.current, shareData, { width: 256, margin: 1 }, (error: any) => {
                if (error) console.error("QRCode generation failed:", error);
            });
        }
    }, [isOpen, shareData]);

    const copyToClipboard = () => {
        if (!navigator.clipboard) {
            alert('A cópia para a área de transferência não é suportada neste navegador.');
            return;
        }
        navigator.clipboard.writeText(shareData).then(() => {
            alert('Dados do mapa copiados para a área de transferência!');
        }).catch(err => {
            alert('Falha ao copiar os dados.');
            console.error('Could not copy text: ', err);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Compartilhar Estado do Mapa</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 text-center space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Outro usuário pode escanear este QR Code ou usar o texto abaixo para carregar esta visualização do mapa.</p>
                    <div className="flex justify-center bg-white p-2 rounded-lg">
                        <canvas ref={qrCodeRef}></canvas>
                    </div>
                    <div>
                        <textarea
                            readOnly
                            value={shareData}
                            className="w-full h-24 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 resize-none"
                        ></textarea>
                        <button onClick={copyToClipboard} className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">
                            Copiar para Área de Transferência
                        </button>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
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

export default ShareMapModal;
