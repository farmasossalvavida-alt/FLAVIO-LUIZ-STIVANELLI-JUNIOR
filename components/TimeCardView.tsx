import React, { useState, useEffect } from 'react';
import { MapPin, Clock, LogIn, LogOut, CheckCircle, AlertTriangle, User, History, ExternalLink } from 'lucide-react';
import { Employee, TimeRecord } from '../types';

interface TimeCardViewProps {
  employees: Employee[];
  timeRecords: TimeRecord[];
  onCheckIn: (employeeId: string, location: { lat: number; lng: number }) => void;
  onCheckOut: (recordId: string, location: { lat: number; lng: number }) => void;
}

export const TimeCardView: React.FC<TimeCardViewProps> = ({ employees, timeRecords, onCheckIn, onCheckOut }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationError, setLocationError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalização não suportada pelo navegador.');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject('Erro ao obter localização. Verifique as permissões.');
          }
        );
      }
    });
  };

  const handleCheckIn = async () => {
    if (!selectedEmployeeId) return;
    setIsLoading(true);
    setLocationError('');
    try {
      const location = await getCurrentLocation();
      onCheckIn(selectedEmployeeId, location);
    } catch (err: any) {
      setLocationError(err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!openRecord) return;
    setIsLoading(true);
    setLocationError('');
    try {
      const location = await getCurrentLocation();
      onCheckOut(openRecord.id, location);
    } catch (err: any) {
      setLocationError(err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar registros do colaborador selecionado
  const myRecords = timeRecords
    .filter(r => r.employeeId === selectedEmployeeId)
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  // Verificar se há ponto aberto hoje
  const todayStr = new Date().toISOString().slice(0, 10);
  const openRecord = myRecords.find(r => r.status === 'Aberto');
  
  // Calcular Total de Horas
  const totalMilliseconds = myRecords.reduce((acc, record) => {
    if (record.checkIn && record.checkOut) {
        const start = new Date(record.checkIn).getTime();
        const end = new Date(record.checkOut).getTime();
        return acc + (end - start);
    }
    return acc;
  }, 0);

  const totalHours = Math.floor(totalMilliseconds / 3600000);
  const totalMinutes = Math.floor((totalMilliseconds % 3600000) / 60000);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-tech font-bold text-white flex items-center gap-2">
            <MapPin className="text-cyan-500" /> CARTÃO PONTO & GEOLOCALIZAÇÃO
        </h2>
        <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-lg border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
             <Clock className="text-cyan-400" size={20}/>
             <span className="text-xl font-mono font-bold text-white tracking-widest">
                {currentTime.toLocaleTimeString('pt-BR')}
             </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Registro */}
        <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Simular Colaborador Logado</label>
                <div className="relative mb-6">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                    <select 
                        className="w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg p-3 outline-none text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    >
                        <option value="">Selecione quem você é...</option>
                        {employees.filter(e => e.status === 'Ativo').map(e => (
                            <option key={e.id} value={e.id}>{e.name} - {e.role}</option>
                        ))}
                    </select>
                </div>

                {selectedEmployeeId ? (
                    <div className="text-center space-y-6">
                        {openRecord ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <p className="text-emerald-400 font-bold mb-1 tracking-wider">PONTO ABERTO</p>
                                <p className="text-sm text-slate-400 font-mono">Entrada: {formatTime(openRecord.checkIn)}</p>
                            </div>
                        ) : (
                            <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl">
                                <p className="text-slate-500 font-bold tracking-wider">AGUARDANDO REGISTRO</p>
                            </div>
                        )}

                        <div className="flex justify-center">
                             {openRecord ? (
                                 <button 
                                    onClick={handleCheckOut}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] font-bold text-xl flex flex-col items-center gap-2 transition-all transform hover:scale-105"
                                 >
                                     <LogOut size={32} />
                                     {isLoading ? 'Registrando...' : 'REGISTRAR SAÍDA'}
                                 </button>
                             ) : (
                                <button 
                                    onClick={handleCheckIn}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] font-bold text-xl flex flex-col items-center gap-2 transition-all transform hover:scale-105"
                                 >
                                     <LogIn size={32} />
                                     {isLoading ? 'Registrando...' : 'REGISTRAR ENTRADA'}
                                </button>
                             )}
                        </div>
                        
                        {locationError && (
                            <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-900/20 p-3 rounded-lg border border-rose-900/50">
                                <AlertTriangle size={16} />
                                {locationError}
                            </div>
                        )}
                        
                        <p className="text-xs text-slate-500">
                           <MapPin size={12} className="inline mr-1" />
                           A localização será capturada automaticamente.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-600 border border-dashed border-slate-800 rounded-lg">
                        <User size={32} className="mx-auto mb-2 opacity-50"/>
                        <p>Selecione um colaborador acima.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Histórico */}
        <div className="lg:col-span-2">
             <div className="glass-panel rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                    <History size={18} className="text-cyan-400" />
                    <h3 className="font-bold text-white tracking-wide">HISTÓRICO DE REGISTROS</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Entrada</th>
                                <th className="p-4">Saída</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Localização</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {myRecords.length > 0 ? myRecords.map(record => {
                                // Calculate hours worked
                                let duration = '-';
                                if (record.checkIn && record.checkOut) {
                                    const start = new Date(record.checkIn).getTime();
                                    const end = new Date(record.checkOut).getTime();
                                    const diff = end - start;
                                    const hours = Math.floor(diff / 3600000);
                                    const minutes = Math.floor((diff % 3600000) / 60000);
                                    duration = `${hours}h ${minutes}m`;
                                }

                                return (
                                    <tr key={record.id} className="hover:bg-white/5 transition">
                                        <td className="p-4 font-mono text-slate-300">
                                            {new Date(record.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4 text-emerald-400 font-mono font-bold">
                                            {formatTime(record.checkIn)}
                                        </td>
                                        <td className="p-4 text-rose-400 font-mono font-bold">
                                            {formatTime(record.checkOut)}
                                        </td>
                                        <td className="p-4 font-medium text-white">
                                            {duration}
                                        </td>
                                        <td className="p-4">
                                            {record.checkInLocation && (
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${record.checkInLocation.lat},${record.checkInLocation.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-cyan-500 hover:text-cyan-400 text-xs transition-colors"
                                                >
                                                    <MapPin size={12} /> Ver Mapa <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                record.status === 'Aberto' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-600 italic">
                                        Nenhum registro encontrado para este colaborador.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total de Horas Footer */}
                {myRecords.length > 0 && (
                    <div className="p-4 border-t border-white/5 bg-slate-900/30 flex justify-end items-center gap-3">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Acumulado:</span>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-lg text-cyan-400 font-mono font-bold text-lg shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            {totalHours}h {totalMinutes}m
                        </div>
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};