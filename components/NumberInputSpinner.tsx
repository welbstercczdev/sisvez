import React from 'react';
import { MinusIcon, PlusIcon } from './icons/IconComponents';

interface NumberInputSpinnerProps {
    id: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

const NumberInputSpinner: React.FC<NumberInputSpinnerProps> = ({ id, value, onChange, min = 0, max }) => {
    const increment = () => {
        if (max === undefined || value < max) {
            onChange(value + 1);
        }
    };

    const decrement = () => {
        if (min === undefined || value > min) {
            onChange(value - 1);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = parseInt(e.target.value, 10);
        if (!isNaN(num)) {
            if ((min === undefined || num >= min) && (max === undefined || num <= max)) {
                onChange(num);
            }
        } else if (e.target.value === '') {
            onChange(min);
        }
    };

    return (
        <div className="flex items-center w-full">
            <button
                type="button"
                onClick={decrement}
                className="px-3 py-2 border border-r-0 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/50 rounded-l-md"
                aria-label="Diminuir"
            >
                <MinusIcon className="w-4 h-4" />
            </button>
            <input
                type="text"
                id={id}
                value={value}
                onChange={handleChange}
                className="w-full bg-white dark:bg-slate-700 border-t border-b border-slate-300 dark:border-slate-600 shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 text-center z-10"
            />
            <button
                type="button"
                onClick={increment}
                className="px-3 py-2 border border-l-0 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/50 rounded-r-md"
                aria-label="Aumentar"
            >
                <PlusIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default NumberInputSpinner;