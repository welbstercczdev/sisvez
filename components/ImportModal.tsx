import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, XIcon, FileTextIcon } from './icons/IconComponents';
import { Atividade } from '../types';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Atividade[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Por favor, selecione um arquivo CSV válido.');
                setFile(null);
            }
        }
    };
    
    const parseCSV = (text: string): Atividade[] => {
        const lines = text.trim().replace(/\r/g, '').split('\n');
        // Handle potential BOM character at the start of the file
        const headerLine = lines[0].startsWith('\uFEFF') ? lines[0].substring(1) : lines[0];
        const headers = headerLine.split(',').map(h => h.trim());
        const data: Atividade[] = [];

        for (let i = 1; i < lines.length; i++) {
            if(lines[i].trim() === '') continue;

            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= headers.length) {
                const entry = headers.reduce((obj, header, index) => {
                    (obj as any)[header] = values[index];
                    return obj;
                }, {} as any);

                // Add default classification for new imports
                entry.CLASSIF = 'Suspeito';
                
                // Map AGRAVO codes to full names
                if (entry.AGRAVO === 'A90') {
                    entry.AGRAVO = 'DENGUE';
                } else if (entry.AGRAVO === 'A92.0') {
                    entry.AGRAVO = 'CHIKUNGUNYA';
                }

                data.push(entry as Atividade);
            }
        }
        return data;
    };


    const handleImport = () => {
        if (!file) {
            setError('Nenhum arquivo selecionado.');
            return;
        }

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsedData = parseCSV(text);
                onImport(parsedData);
                setIsProcessing(false);
                handleClose();
            } catch (err) {
                setError('Falha ao processar o arquivo. Verifique o formato.');
                setIsProcessing(false);
            }
        };
        
        reader.onerror = () => {
             setError('Falha ao ler o arquivo.');
             setIsProcessing(false);
        }

        reader.readAsText(file, 'UTF-8');
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setIsProcessing(false);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Importar Atividades de Arquivo CSV</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div 
                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv"
                            className="hidden"
                        />
                        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                           <UploadIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            <span className="font-semibold text-sky-600 dark:text-sky-400">Clique para selecionar</span> ou arraste um arquivo
                        </p>
                         <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            Apenas arquivos .csv
                        </p>
                    </div>
                    {file && (
                        <div className="mt-4 flex items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                           <FileTextIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-3 shrink-0"/>
                           <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                        </div>
                    )}
                    {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button 
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        Cancelar
                    </button>
                     <button
                        onClick={handleImport}
                        disabled={!file || isProcessing}
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800"
                    >
                        {isProcessing ? 'Processando...' : 'Importar'}
                    </button>
                </div>
            </div>
            {/* Simple animation for modal entrance */}
            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ImportModal;