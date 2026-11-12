import type { RiskLevel } from '../types/device';

export interface RiskStyle {
  label: RiskLevel;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  hex: string;
  description: string;
}

export const RISK_CONFIG: Record<RiskLevel, RiskStyle> = {
  SAFE: {
    label: 'SAFE',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/20',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-[#091f16] text-emerald-400 border-[#124b33]',
    hex: '#10B981',
    description: 'Electromagnetic RF levels within quiescent baseline (<=2000 ADC). Zero suspicious camera SSIDs identified.'
  },
  LOW: {
    label: 'LOW',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-950/20',
    borderColor: 'border-blue-500/30',
    badgeBg: 'bg-[#0b1b2b] text-blue-300 border-[#1a3a5a]',
    hex: '#3B82F6',
    description: 'Suspicious surveillance SSID beacon identified in ambient scan, while RF signal remains at normal baseline.'
  },
  MEDIUM: {
    label: 'MEDIUM',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/20',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-[#221808] text-amber-300 border-[#533b11]',
    hex: '#F59E0B',
    description: 'Electromagnetic RF anomaly detected (>2000 ADC cutoff). No suspicious camera SSID match in current beacon frame.'
  },
  HIGH: {
    label: 'HIGH',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-950/30',
    borderColor: 'border-rose-500/40',
    badgeBg: 'bg-[#260c10] text-rose-300 border-[#5e1922]',
    hex: '#EF4444',
    description: 'CRITICAL THREAT: Combined RF anomaly + suspicious SSID signature, or manual camera detection interrupt active!'
  }
};

export function getRiskConfig(level?: string): RiskStyle {
  const norm = (level || 'SAFE').toUpperCase() as RiskLevel;
  return RISK_CONFIG[norm] || RISK_CONFIG.SAFE;
}
