import React from 'react';
import { 
    HomeIcon,
    ListIcon,
    PlusIcon,
    MinusIcon,
    FullscreenIcon,
} from '../components/icons/IconComponents';
import MapComponent from '../components/MapComponent';

// Declara o objeto global 'L' do Leaflet para o TypeScript
declare const L: any;

interface MapasClassificacaoPageProps {
    onNavigate: (page: string) => void;
}


const MapasClassificacaoPage: React.FC<MapasClassificacaoPageProps> = ({ onNavigate }) => {

  // Definição das camadas de base
  const baseLayers = {
    'Padrão': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      updateWhenIdle: true
    }),
    'Satélite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      updateWhenIdle: true
    }),
    'Relevo': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      updateWhenIdle: true
    })
  };

  // Definição das camadas de sobreposição (overlays) com marcadores de exemplo
  const overlays = {
    'Agrupamentos': L.layerGroup(),
    'Casos Confirmados': L.layerGroup([
        L.marker([-23.2237, -45.9009]).bindPopup('Caso Confirmado 1'),
        L.marker([-23.1791, -45.8872]).bindPopup('Caso Confirmado 2')
    ]),
    'Casos Descartados': L.layerGroup(),
    'Casos Suspeitos': L.layerGroup([
        L.marker([-23.1963, -45.8869]).bindPopup('Caso Suspeito 1')
    ]),
    'Limites de Bairros': L.layerGroup(),
    'Limites de Setores': L.layerGroup(),
  };


  return (
    <section className="space-y-6 pb-8">
      {/* Breadcrumbs */}
      <div>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse text-sm">
            <li className="inline-flex items-center">
              <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200">
                <HomeIcon className="w-4 h-4 me-2.5" />
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ms-1 font-medium text-slate-500 dark:text-slate-400 md:ms-2">Arboviroses</span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                 <button onClick={() => onNavigate('fichas_vez')} className="ms-1 font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200 md:ms-2">Fichas VEZ</button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Mapas</span>
              </div>
            </li>
             <li aria-current="page">
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Classificação</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Filter Card */}
      <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              <div>
                  <label htmlFor="agravo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agravo</label>
                  <select id="agravo" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                      <option></option>
                  </select>
              </div>
              <div>
                  <label htmlFor="filtrar_por" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filtrar por</label>
                  <select id="filtrar_por" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                       <option></option>
                  </select>
              </div>
              <div>
                  <label htmlFor="ano" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ano</label>
                  <select id="ano" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                       <option></option>
                  </select>
              </div>
              <div>
                  <label htmlFor="filtro_data" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filtro Data</label>
                  <select id="filtro_data" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                       <option></option>
                  </select>
              </div>
              <div>
                  <label htmlFor="data_inicial" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Inicial</label>
                  <input type="date" id="data_inicial" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div>
                  <label htmlFor="data_final" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Final</label>
                  <input type="date" id="data_final" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
              </div>
               <div className="col-span-full flex justify-end">
                <button className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200">
                    Aplicar
                </button>
            </div>
          </div>
      </div>
      
      {/* Map Card */}
      <div className="bg-white dark:bg-slate-800/50 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
        <div className="relative w-full h-[60vh] rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700">
            <MapComponent 
                center={[-23.2237, -45.9009]} 
                zoom={12}
                baseLayers={baseLayers}
                overlays={overlays}
            />
            
            {/* Map Controls */}
            <div className="absolute top-2 left-2 flex flex-col space-y-px z-20">
                 <button className="bg-white dark:bg-slate-800 p-2 rounded-t-md shadow border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ListIcon className="w-5 h-5" />
                 </button>
            </div>

            <div className="absolute top-2 right-12 flex flex-col space-y-px z-20">
                 <button className="bg-white dark:bg-slate-800 p-2 rounded-t-md shadow border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <PlusIcon className="w-5 h-5" />
                 </button>
                 <button className="bg-white dark:bg-slate-800 p-2 shadow border-x border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <MinusIcon className="w-5 h-5" />
                 </button>
                 <button className="bg-white dark:bg-slate-800 p-2 rounded-b-md shadow border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <FullscreenIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>
      </div>

    </section>
  );
};

export default MapasClassificacaoPage;