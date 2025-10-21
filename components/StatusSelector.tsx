import React, { useState, useEffect, useRef } from 'react';
import { MembroComStatus, MembroStatus } from '../types';

// Essas constantes podem viver aqui ou em um arquivo de constantes compartilhado
const STATUSES: MembroStatus[] = ['Ativo', 'Folga', 'Férias', 'Curso', 'GLM', 'Observação'];

const STATUS_COLORS: Record<MembroStatus, { dot: string; }> = {
    'Ativo': { dot: 'bg-green-500' },
    'Folga': { dot: 'bg-sky-500' },
    'Férias': { dot: 'bg-orange-500' },
    'Curso': { dot: 'bg-violet-500' },
    'GLM': { dot: 'bg-slate-500' },
    'Observação': { dot: 'bg-yellow-500' },
};

interface StatusSelectorProps {
    member: MembroComStatus;
    onStatusChange: (status: MembroStatus, observacao?: string) => void;
    disabled?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ member, onStatusChange, disabled = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingObs, setIsEditingObs] = useState(false);
    const [obsText, setObsText] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                menuRef.current && !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
                setIsEditingObs(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuToggle = () => {
        if (disabled) return;
        if (!isMenuOpen) {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                let top = rect.bottom + 4; // 4px gap below button
                let left = rect.left;

                const menuHeight = 250; 
                const menuWidth = 224;

                // Adjust position to stay within viewport
                if (top + menuHeight > window.innerHeight) {
                    top = rect.top - menuHeight - 4;
                }
                if (left + menuWidth > window.innerWidth) {
                    left = window.innerWidth - menuWidth - 8; // 8px padding from edge
                }

                setMenuPosition({ top, left });
            }
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSelect = (status: MembroStatus) => {
        if (status === 'Observação') {
            setObsText(member.observacao || '');
            setIsEditingObs(true);
        } else {
            onStatusChange(status);
            setIsMenuOpen(false);
        }
    };

    const handleSaveObs = () => {
        onStatusChange('Observação', obsText);
        setIsEditingObs(false);
        setIsMenuOpen(false);
    };

    const colors = STATUS_COLORS[member.status];
    const displayText = member.status === 'Observação' ? (member.observacao || 'Observação') : member.status;

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                title={disabled ? 'Funcionário em Férias' : displayText}
                onClick={handleMenuToggle}
                className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 ${disabled ? 'cursor-not-allowed' : 'transition-transform hover:scale-110'}`}
                disabled={disabled}
            >
                <span className={`w-3.5 h-3.5 rounded-full ${colors.dot}`}></span>
            </button>
            {isMenuOpen && !disabled && menuPosition && (
                <div
                    ref={menuRef}
                    className="fixed z-50 w-56 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-xl"
                    style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                >
                    {!isEditingObs ? (
                        <ul>
                            {STATUSES.map(status => (
                                <li key={status}>
                                    <button
                                        onClick={() => handleSelect(status)}
                                        className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    >
                                        <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status].dot}`}></span>
                                        {status}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 space-y-2">
                            <label htmlFor="obs-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">Observação</label>
                            <input
                                id="obs-input"
                                type="text"
                                value={obsText}
                                onChange={e => setObsText(e.target.value)}
                                className="w-full bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveObs(); }}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setIsEditingObs(false); setIsMenuOpen(false); }}
                                    className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveObs}
                                    className="px-3 py-1 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default StatusSelector;