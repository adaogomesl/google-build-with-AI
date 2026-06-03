import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { WaterDataResponse } from '../types';
import { Activity, Droplets, AlertTriangle, CheckCircle2, Info, Home, Ship, Wrench, MapPin } from 'lucide-react';

interface DashboardProps {
  data: WaterDataResponse[];
  isLoading: boolean;
}

type TabType = 'environmental' | 'residential';

export const Dashboard: React.FC<DashboardProps> = ({ data, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('environmental');
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(0);

  const chartData = useMemo(() => {
    return data.map(d => ({
      name: d.station.split(' (')[0],
      tds: d.metrics.totalDissolvedSolids_mg_L,
      conductance: d.metrics.specificConductance_uS_cm
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full p-4 md:p-6 bg-slate-100 border-b border-slate-200 shrink-0">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
          </div>
          <div className="h-[250px] bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const getRiskLevel = (tds: number) => {
    if (tds < 500) return { label: 'Low Risk', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, barColor: '#10b981' };
    if (tds <= 1000) return { label: 'Moderate Risk', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Info, barColor: '#f59e0b' };
    return { label: 'High Risk', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, barColor: '#ef4444' };
  };

  const getResidentialAdvice = (tds: number) => {
    if (tds < 500) return {
      title: "Normal Freshwater Conditions",
      desc: "Current metrics align with standard freshwater baselines.",
      bullets: [
        "Municipal plumbing and household pipes are operating under normal conditions.",
        "No special marine maintenance or flushing required for boats.",
        "Standard irrigation and lawn care is safe."
      ]
    };
    if (tds <= 1000) return {
      title: "Elevated Mineral Content",
      desc: "Water shows slightly elevated dissolved solids, typical of mild tidal influence or drought concentration.",
      bullets: [
        "Monitor older household plumbing for potential scaling.",
        "Safe for standard marine use, but occasional motor flushing is recommended.",
        "Sensitive plants may react to prolonged irrigation."
      ]
    };
    if (tds <= 5000) return {
      title: "Brackish Water / Moderate Salinity",
      desc: "Significant saltwater intrusion detected. Water is highly corrosive to standard metals.",
      bullets: [
        "High risk of accelerated corrosion in standard household pipes if drawn directly.",
        "Flush outboard boat motors with fresh water after every use.",
        "Inspect dock hardware and use marine-grade stainless steel."
      ]
    };
    return {
      title: "High Salinity / Saltwater",
      desc: "Water characteristics are approaching or at marine salinity levels.",
      bullets: [
        "Severe corrosion risk for non-marine hardware and infrastructure.",
        "Mandatory fresh water flushing for all boat motors and exposed equipment.",
        "Do not use for irrigation. Protect sensitive coastal property assets."
      ]
    };
  };

  const selectedSite = data[selectedStationIndex];
  const selectedTds = selectedSite?.metrics.totalDissolvedSolids_mg_L || 0;
  const advice = getResidentialAdvice(selectedTds);
  
  // Gauge calculations
  const maxGaugeTds = 10000;
  const clampedTds = Math.min(selectedTds, maxGaugeTds);
  const gaugePercentage = clampedTds / maxGaugeTds;
  const gaugeColor = getRiskLevel(selectedTds).barColor;
  const dashArray = 251.32; // Math.PI * 80
  const dashOffset = dashArray - (gaugePercentage * dashArray);

  return (
    <div className="w-full bg-slate-100 border-b border-slate-200 shrink-0">
      {/* Tabs Header */}
      <div className="border-b border-slate-200 px-4 md:px-6 pt-4">
        <div className="max-w-4xl mx-auto flex gap-6">
          <button 
            onClick={() => setActiveTab('environmental')}
            className={`pb-3 font-medium text-sm md:text-base transition-colors relative ${activeTab === 'environmental' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <div className="flex items-center gap-2">
              <Activity size={18} />
              Environmental Dashboard
            </div>
            {activeTab === 'environmental' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('residential')}
            className={`pb-3 font-medium text-sm md:text-base transition-colors relative ${activeTab === 'residential' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <div className="flex items-center gap-2">
              <Home size={18} />
              Residential Utilities & Property
            </div>
            {activeTab === 'residential' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full"></div>}
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* ENVIRONMENTAL TAB */}
          {activeTab === 'environmental' && (
            <div className="animate-in fade-in duration-300">
              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {data.map((site, idx) => {
                  const shortName = site.station.split(' (')[0];
                  const tds = site.metrics.totalDissolvedSolids_mg_L;
                  const risk = getRiskLevel(tds);
                  const Icon = risk.icon;

                  return (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-700 text-sm leading-tight">{shortName}</h3>
                      </div>
                      <div className="mb-3">
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-full border inline-flex items-center gap-1 ${risk.color}`}>
                          <Icon size={10} />
                          {risk.label}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-2xl font-bold text-slate-900">{tds.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 mb-1">mg/L TDS</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Droplets size={12} className="text-teal-500" />
                          {site.metrics.specificConductance_uS_cm.toLocaleString()} µS/cm
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Regional TDS Comparison</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value.toLocaleString()} mg/L`, 'Calculated TDS']}
                      />
                      <ReferenceLine 
                        y={1000} 
                        stroke="#ef4444" 
                        strokeDasharray="4 4" 
                        label={{ position: 'top', value: 'Corrosion Risk Baseline (1,000 mg/L)', fill: '#ef4444', fontSize: 11, fontWeight: 500 }} 
                      />
                      <Bar dataKey="tds" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRiskLevel(entry.tds).barColor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* RESIDENTIAL TAB */}
          {activeTab === 'residential' && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Selector & Gauge */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-teal-600" />
                    Select Neighborhood
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 outline-none"
                    value={selectedStationIndex}
                    onChange={(e) => setSelectedStationIndex(Number(e.target.value))}
                  >
                    {data.map((site, idx) => (
                      <option key={idx} value={idx}>{site.station.split(' (')[0]}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center flex-1">
                  <h3 className="text-sm font-semibold text-slate-700 mb-6 w-full text-center">Plumbing Corrosion Risk</h3>
                  
                  {/* SVG Half-Circle Gauge */}
                  <div className="relative w-48 h-24 overflow-hidden flex flex-col items-center">
                    <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                      {/* Background Arc */}
                      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="24" strokeLinecap="round" />
                      {/* Value Arc */}
                      <path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke={gaugeColor} 
                        strokeWidth="24" 
                        strokeLinecap="round"
                        strokeDasharray={dashArray} 
                        strokeDashoffset={dashOffset} 
                        className="transition-all duration-1000 ease-out" 
                      />
                    </svg>
                    <div className="absolute bottom-0 flex flex-col items-center translate-y-2">
                      <span className="text-3xl font-bold text-slate-800">{selectedTds.toLocaleString()}</span>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">mg/L TDS</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevel(selectedTds).color}`}>
                      {React.createElement(getRiskLevel(selectedTds).icon, { size: 14 })}
                      {getRiskLevel(selectedTds).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Recommendations */}
              <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className={`p-2 rounded-lg ${getRiskLevel(selectedTds).color.split(' ')[0]}`}>
                    <Wrench size={24} className={getRiskLevel(selectedTds).color.split(' ')[1]} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{advice.title}</h3>
                    <p className="text-sm text-slate-500">{advice.desc}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Household & Property Action Items</h4>
                  <ul className="space-y-3">
                    {advice.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm md:text-base">
                        <div className="mt-1 shrink-0">
                          {bullet.includes('boat') || bullet.includes('marine') || bullet.includes('dock') ? (
                            <Ship size={16} className="text-teal-600" />
                          ) : (
                            <CheckCircle2 size={16} className="text-teal-600" />
                          )}
                        </div>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 flex gap-2">
                  <Info size={16} className="shrink-0 text-slate-400" />
                  <p>
                    <strong>Note:</strong> Standard seawater is approximately 35,000 mg/L TDS. 
                    Municipal drinking water is typically kept below 500 mg/L to prevent infrastructure damage.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};