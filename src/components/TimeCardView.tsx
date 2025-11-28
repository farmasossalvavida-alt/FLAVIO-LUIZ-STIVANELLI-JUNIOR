
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
                        <User size={32} className="mx-auto mb-