import React, { useEffect, useRef, useMemo, useState } from 'react';

// Declara o objeto global 'L' do Leaflet para o TypeScript
declare const L: any;

const getFeatureBlockId = (feature: any): string | null => {
    if (feature?.properties?.title) {
        const title = String(feature.properties.title);
        const parts = title.split(':');
        if (parts.length > 1) return parts[1].trim();
    }
    if (feature?.properties?.quadra_id) return String(feature.properties.quadra_id);
    return null;
};

interface PrintLayoutProps {
    onDone: () => void;
    loadedAreas: Map<string, any>;
    selectedQuadras: Set<string>;
    summary: { totalArea: number; totalImoveis: number };
    mapCenter: any; // L.LatLng
    mapZoom: number;
    areaColors: Map<string, string>;
}

// Define an array of SVG pattern definitions for black and white printing
const PATTERNS_SVG = [
    // diagonal-hatch
    `<pattern id="pattern0" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#000" stroke-width="1.5"></path></pattern>`,
    // dots
    `<pattern id="pattern1" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="2" cy="2" r="1.2" fill="#000"></circle></pattern>`,
    // cross-hatch
    `<pattern id="pattern2" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#000" stroke-width="0.8"></path><path d="M2,-2 l4,4 M-8,0 l8,8 M10,6 l-4,4" stroke="#000" stroke-width="0.8"></path></pattern>`,
    // vertical lines
    `<pattern id="pattern3" patternUnits="userSpaceOnUse" width="5" height="5"><path d="M 2 0 V 5" stroke="#000" stroke-width="1.5"></path></pattern>`,
    // horizontal lines
    `<pattern id="pattern4" patternUnits="userSpaceOnUse" width="5" height="5"><path d="M 0 2 H 5" stroke="#000" stroke-width="1.5"></path></pattern>`,
    // grid
    `<pattern id="pattern5" patternUnits="userSpaceOnUse" width="7" height="7"><path d="M 0 2.5 H 7 M 2.5 0 V 7" stroke="#000" stroke-width="1"></path></pattern>`,
    // chevron
    `<pattern id="pattern6" patternUnits="userSpaceOnUse" width="10" height="10"><path d="M 0 0 L 5 5 L 0 10 M 5 0 L 10 5 L 5 10" stroke="#000" stroke-width="1.5" fill="none"></path></pattern>`,
];


const PrintLayout: React.FC<PrintLayoutProps> = ({
    onDone, loadedAreas, selectedQuadras, summary, mapCenter, mapZoom, areaColors
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [showPatternLegend, setShowPatternLegend] = useState(true);
    const [showSummary, setShowSummary] = useState(true);
    const [showQuadrasList, setShowQuadrasList] = useState(true);
    const [isColoredPrint, setIsColoredPrint] = useState(false);
    const [mapHeight, setMapHeight] = useState(180); // Default height in mm

    const isSidebarVisible = showPatternLegend || showSummary || showQuadrasList;

    const uniqueAreaIds = useMemo(() => 
        Array.from(new Set(Array.from(selectedQuadras).map(q => q.split('-')[0]))).sort((a, b) => Number(a) - Number(b)),
        [selectedQuadras]
    );

    // This effect injects styles needed for the patterns into the document head
    useEffect(() => {
        if (isColoredPrint) return; // Don't inject pattern styles in color mode
        
        const styleId = 'print-pattern-styles';
        document.getElementById(styleId)?.remove();

        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;

        let cssRules = '';
        uniqueAreaIds.forEach((_areaId, index) => {
            const patternIndex = index % PATTERNS_SVG.length;
            // The class for the path itself
            cssRules += `.quadra-area-pattern-${index} { fill: url(#pattern${patternIndex}); }\n`;
            // The class for the legend box
            cssRules += `.legend-pattern-box-${index} { fill: url(#pattern${patternIndex}); stroke: #000; stroke-width: 1.5; }\n`;
        });
        
        styleSheet.innerText = cssRules;
        document.head.appendChild(styleSheet);
        
        return () => {
             document.getElementById(styleId)?.remove();
        }

    }, [uniqueAreaIds, isColoredPrint]);


    useEffect(() => {
        if (!mapContainerRef.current) return;
        
        // Clean up previous map instance if it exists
        const existingMap = (mapContainerRef.current as any)._leaflet_map;
        if (existingMap) {
            existingMap.remove();
        }

        const map = L.map(mapContainerRef.current, {
            center: mapCenter,
            zoom: mapZoom,
            zoomControl: false,
            attributionControl: false,
            preferCanvas: false, 
            renderer: L.svg({ padding: 0.5 })
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

        const areaPatternMap = new Map<string, number>();
        uniqueAreaIds.forEach((id, index) => {
            areaPatternMap.set(id, index);
        });

        loadedAreas.forEach((geoJsonData, areaId) => {
            // FIX: Replace L.GeoJSONOptions with 'any' to avoid namespace error when Leaflet types are not available.
            const styleOptions: any = {};

            if (isColoredPrint) {
                const color = areaColors.get(areaId) || '#3388ff';
                styleOptions.style = {
                    color: color,
                    weight: 2,
                    opacity: 1,
                    fillColor: color,
                    fillOpacity: 0.6,
                };
            } else {
                const patternIndex = areaPatternMap.get(areaId);
                const patternClassName = `quadra-area-pattern-${patternIndex}`;
                styleOptions.style = {
                    className: `selected-quadra-print-style ${patternClassName}`
                };
            }

            L.geoJSON(geoJsonData, {
                ...styleOptions,
                filter: (feature: any) => {
                    const blockId = getFeatureBlockId(feature);
                    if (!blockId) return false;
                    const uniqueId = `${areaId}-${blockId}`;
                    return selectedQuadras.has(uniqueId);
                },
                onEachFeature: (feature: any, layer: any) => {
                    const blockId = getFeatureBlockId(feature);
                    if (blockId) {
                         layer.bindTooltip(blockId, { 
                            direction: 'center', 
                            className: 'quadra-label-print', 
                            permanent: true 
                        });
                    }
                }
            }).addTo(map);
        });

        const handleAfterPrint = () => {
            onDone();
            window.removeEventListener('afterprint', handleAfterPrint);
        };
        window.addEventListener('afterprint', handleAfterPrint);

        const timer = setTimeout(() => {
            map.invalidateSize();
            window.print();
        }, 1500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('afterprint', handleAfterPrint);
            if (map) map.remove();
        };
    }, [isColoredPrint, mapHeight]); // Rerun effect when color mode or height changes

    const sortedQuadras = Array.from(selectedQuadras).sort((a,b) => {
        const [areaA, blockA] = a.split('-').map(Number);
        const [areaB, blockB] = b.split('-').map(Number);
        if (areaA !== areaB) return areaA - areaB;
        return blockA - blockB;
    });

    return (
        <div className="print-overlay">
            {/* Hidden SVG for pattern definitions */}
            {!isColoredPrint && (
                 <svg height="0" width="0" style={{ position: 'absolute', top: '-100px', left: '-100px' }}>
                    <defs dangerouslySetInnerHTML={{ __html: PATTERNS_SVG.join('') }} />
                </svg>
            )}

            <div className="print-page">
                <header className="print-header no-print">
                    <h1>Relatório de Impressão</h1>
                    <div className="print-options">
                        <h3 className="options-title">Opções de Impressão</h3>
                        <div className="options-controls">
                            <label><input type="checkbox" checked={showPatternLegend} onChange={() => setShowPatternLegend(p => !p)} /> Legenda</label>
                            <label><input type="checkbox" checked={showSummary} onChange={() => setShowSummary(p => !p)} /> Resumo</label>
                            <label><input type="checkbox" checked={showQuadrasList} onChange={() => setShowQuadrasList(p => !p)} /> Lista de Quadras</label>
                            <label><input type="checkbox" checked={isColoredPrint} onChange={() => setIsColoredPrint(p => !p)} /> Imprimir Colorido</label>
                        </div>
                        <div className="options-slider">
                            <label htmlFor="mapHeightSlider" className="whitespace-nowrap">Altura do Mapa: <strong>{mapHeight}mm</strong></label>
                            <input
                                id="mapHeightSlider"
                                type="range"
                                min="50"
                                max="250"
                                value={mapHeight}
                                onChange={(e) => setMapHeight(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="print-actions">
                         <button onClick={onDone} className="cancel-button">Cancelar</button>
                    </div>
                </header>
                 <div className="print-title print-only">
                    <h1>Relatório de Impressão - Mapa de Quadras</h1>
                    <p>Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
                <main className="print-main-content">
                    <div className="print-map-container" style={{ height: `${mapHeight}mm` }}>
                        <div ref={mapContainerRef} className="print-map"></div>
                    </div>
                    {isSidebarVisible && (
                        <aside className="print-sidebar">
                            {showPatternLegend && (
                                <section>
                                    <h2>Legenda</h2>
                                     <ul className="legend-list">
                                        {uniqueAreaIds.map((areaId, index) => (
                                            <li key={areaId}>
                                                {isColoredPrint ? (
                                                     <span className="legend-color-box" style={{ backgroundColor: areaColors.get(areaId) || '#ccc' }}></span>
                                                ) : (
                                                    <svg className="legend-pattern-box" aria-hidden="true">
                                                        <rect width="20" height="20" className={`legend-pattern-box-${index}`} />
                                                    </svg>
                                                )}
                                                Quadras da Área {areaId}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                            {showSummary && (
                                <section>
                                    <h2>Resumo da Seleção</h2>
                                    <dl>
                                        <dt>Quadras Selecionadas:</dt><dd>{selectedQuadras.size}</dd>
                                        <dt>Área Total:</dt><dd>{summary.totalArea.toLocaleString('pt-BR')} m²</dd>
                                        <dt>Total de Imóveis:</dt><dd>{summary.totalImoveis.toLocaleString('pt-BR')}</dd>
                                    </dl>
                                </section>
                            )}
                            {showQuadrasList && (
                                <section className="quadras-list-section">
                                    <h2>Lista de Quadras Selecionadas</h2>
                                    <ul className="quadras-list">
                                        {sortedQuadras.map(q => <li key={q}>{q}</li>)}
                                        {sortedQuadras.length === 0 && <li>Nenhuma quadra selecionada.</li>}
                                    </ul>
                                </section>
                            )}
                        </aside>
                    )}
                </main>
            </div>
            <style>{`
                /* On-screen overlay styles */
                .print-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(230, 230, 230, 1);
                    z-index: 10000;
                    overflow-y: auto;
                    font-family: 'Open Sans', sans-serif;
                    color: #333;
                }
                .print-page {
                    width: 210mm; /* A4 width */
                    min-height: 297mm; /* A4 height */
                    margin: 2rem auto;
                    padding: 15mm;
                    background-color: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .print-header h1 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1e293b;
                }
                .print-options {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 0.75rem 1rem;
                    font-size: 0.8rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    flex-grow: 1;
                    max-width: 500px;
                }
                .options-title {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .options-controls {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .options-controls label {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                 .options-slider {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .options-slider input[type="range"] {
                    flex-grow: 1;
                }
                .print-actions .cancel-button {
                    background-color: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .print-main-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    flex-grow: 1;
                }
                .print-map-container {
                    border: 1px solid #ccc;
                }
                .print-map {
                    width: 100%;
                    height: 100%;
                }
                .print-sidebar {
                    font-size: 0.8rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                }
                .print-sidebar h2 {
                    font-size: 1rem;
                    font-weight: 600;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 0.25rem;
                    margin-bottom: 0.5rem;
                }
                .legend-list { list-style: none; padding: 0; }
                .legend-list li { display: flex; align-items: center; margin-bottom: 0.25rem; }
                .legend-pattern-box {
                    width: 20px;
                    height: 20px;
                    margin-right: 8px;
                    display: inline-block;
                }
                .legend-color-box {
                    width: 20px;
                    height: 20px;
                    margin-right: 8px;
                    display: inline-block;
                    border: 1.5px solid #333;
                }
                .print-sidebar dl {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 0.25rem 1rem;
                }
                .print-sidebar dt { font-weight: 600; }
                .quadras-list-section {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                .quadras-list {
                    list-style: none;
                    padding: 0.5rem;
                    margin: 0;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    background-color: #f8fafc;
                    overflow-y: auto;
                    flex-grow: 1;
                    font-family: monospace;
                    font-size: 0.75rem;
                    column-count: 3;
                }
                .print-title.print-only {
                    display: none;
                }
                .quadra-label-print {
                    background-color: transparent;
                    border: none;
                    box-shadow: none;
                    color: black;
                    font-weight: bold;
                    font-size: 12px;
                    text-shadow: 1px 1px 1px white, -1px -1px 1px white, 1px -1px 1px white, -1px 1px 1px white;
                }

                /* SVG Path styles for printing */
                .selected-quadra-print-style {
                    stroke: #000;
                    stroke-width: 1.5px;
                    fill-opacity: 1;
                }

                /* Print-specific styles */
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    html, body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-overlay {
                        position: static;
                        overflow: visible;
                        background: none;
                    }
                    .print-page {
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-title.print-only {
                        display: block;
                        text-align: center;
                        margin-bottom: 1rem;
                    }
                    .print-title h1 { font-size: 16pt; margin: 0; }
                    .print-title p { font-size: 9pt; color: #666; margin: 0; }
                    .print-main-content {
                        flex-direction: column;
                        gap: 5mm;
                    }
                    .print-map-container {
                        border: 1px solid #999;
                        width: 100%;
                    }
                    .print-map {
                        height: 100%;
                    }
                    .print-sidebar {
                        font-size: 8pt;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 5mm;
                        width: 100%;
                        page-break-before: auto;
                    }
                     .print-sidebar h2 { font-size: 11pt; }
                     .quadras-list {
                        background-color: #fff;
                        border: 1px solid #ccc;
                        column-count: 4;
                        font-size: 7pt;
                        overflow: visible;
                        height: auto;
                     }
                     .leaflet-control-container { display: block !important; }
                }
            `}</style>
        </div>
    );
};

export default PrintLayout;
