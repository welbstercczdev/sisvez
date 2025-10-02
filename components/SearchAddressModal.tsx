import React, { useState, useEffect, useCallback } from 'react';
import { XIcon, SearchIcon } from './icons/IconComponents';

// Define the structure of a suggestion from Nominatim
interface Suggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface SearchAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (location: { lat: number, lon: number, displayName: string }) => void;
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const SearchAddressModal: React.FC<SearchAddressModalProps> = ({ isOpen, onClose, onSearch }) => {
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const debouncedSearchTerm = useDebounce(address, 500); // 500ms delay

    useEffect(() => {
        if (isOpen) {
            setAddress('');
            setSuggestions([]);
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (debouncedSearchTerm.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Restrict search to São José dos Campos
                const query = `${debouncedSearchTerm}, São José dos Campos, SP`;
                // Bounding box for SJC: min Longitude, max Latitude, max Longitude, min Latitude
                const viewbox = `-46.06,-22.89,-45.72,-23.41`;
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&limit=5`);

                if (!response.ok) {
                    throw new Error('Falha na busca de endereço.');
                }
                const data: Suggestion[] = await response.json();
                setSuggestions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchTerm]);


    const formatDisplayName = (displayName: string): string => {
        const parts = displayName.split(',').map(p => p.trim());
        const cityIndex = parts.findIndex(part => part.toLowerCase() === "são josé dos campos");

        if (cityIndex !== -1) {
            // Take up to the city name
            return parts.slice(0, cityIndex + 1).join(', ');
        }
        
        // Fallback if city name isn't found.
        return parts.slice(0, 3).join(', ');
    };

    const handleSelectSuggestion = (suggestion: Suggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);
        const formattedDisplayName = formatDisplayName(suggestion.display_name);

        if (!isNaN(lat) && !isNaN(lon)) {
             onSearch({ lat, lon, displayName: formattedDisplayName });
        } else {
            alert('Coordenadas inválidas para o endereço selecionado.');
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-4">
                    <div className="relative">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            autoFocus
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Digite um endereço em São José dos Campos..."
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm pl-10 p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                         {isLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {(suggestions.length > 0 || error) && (
                     <div className="border-t border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                        {error && <p className="p-4 text-sm text-red-500">{error}</p>}
                        <ul>
                            {suggestions.map((sugg) => (
                                <li key={sugg.place_id}>
                                    <button
                                        onClick={() => handleSelectSuggestion(sugg)}
                                        className="w-full text-left p-4 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        {formatDisplayName(sugg.display_name)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default SearchAddressModal;