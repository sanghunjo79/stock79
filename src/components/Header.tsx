/**
 * [헤더 네비게이션 컴포넌트]
 * 서비스 타이틀, 통화 선택 필터, 샘플 데이터 로드, API 키 설정 및 AI 챗봇 트리거 버튼을 제공합니다.
 */

import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Key, 
  PlusCircle, 
  Database, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Currency } from '../types';

interface HeaderProps {
  selectedCurrency: Currency | 'ALL';
  onCurrencyChange: (currency: Currency | 'ALL') => void;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  onOpenRecordModal: () => void;
  onOpenAiDrawer: () => void;
  onLoadSampleData: () => void;
  onClearData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCurrency,
  onCurrencyChange,
  hasApiKey,
  onOpenApiKeyModal,
  onOpenRecordModal,
  onOpenAiDrawer,
  onLoadSampleData,
  onClearData,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* 서비스 로고 및 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                주식 가계부
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-brand-500/20 text-brand-300 rounded-md border border-brand-500/30">
                AI 진단
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              스마트 매수 기록 & Gemini 기반 포트폴리오 분석
            </p>
          </div>
        </div>

        {/* 중앙: 통화 필터 버튼 */}
        <div className="hidden md:flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => onCurrencyChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCurrency === 'ALL'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            통합 (전체)
          </button>
          <button
            onClick={() => onCurrencyChange('KRW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCurrency === 'KRW'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            원화 (₩)
          </button>
          <button
            onClick={() => onCurrencyChange('USD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCurrency === 'USD'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            달러 ($)
          </button>
        </div>

        {/* 우측 컨트롤 액션 영역 */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 샘플 데이터 & 초기화 드롭다운 대안 버튼들 */}
          <div className="hidden lg:flex items-center gap-1.5 border-r border-slate-800 pr-3">
            <button
              onClick={onLoadSampleData}
              title="초기 샘플 포트폴리오 불러오기"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700/50 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              샘플 데이터
            </button>
            <button
              onClick={onClearData}
              title="모든 기록 초기화"
              className="p-1.5 rounded-lg bg-slate-800/40 hover:bg-rose-950/40 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* API Key 상태 및 설정 버튼 */}
          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40 animate-pulse-subtle'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gemini API</span>
            {hasApiKey ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> 연결됨
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <AlertCircle className="w-3 h-3" /> 키 필요
              </span>
            )}
          </button>

          {/* 매수 기록 추가 버튼 */}
          <button
            onClick={onOpenRecordModal}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>매수 기록 추가</span>
          </button>

          {/* AI 포트폴리오 상담 챗봇 열기 버튼 */}
          <button
            onClick={onOpenAiDrawer}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/25 ring-1 ring-white/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="hidden xs:inline">AI 진단·상담</span>
            <span className="xs:hidden">AI</span>
          </button>
        </div>

      </div>
    </header>
  );
};
