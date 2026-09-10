/**
 * [헤더 네비게이션 컴포넌트]
 * 토스/핀테크 스타일의 밝고 깔끔한 화이트 테마 헤더입니다.
 * 서비스 타이틀, 통화 세그먼트 컨트롤, 샘플 데이터 로드, API 키 설정 및 AI 챗봇 트리거 버튼을 제공합니다.
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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* 서비스 로고 및 타이틀 (Logo & Title) */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20 ring-1 ring-brand-400/30">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                주식 가계부
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-brand-50 text-brand-600 rounded-md border border-brand-200/60">
                AI 진단
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              스마트 매수 기록 & Gemini 기반 포트폴리오 분석
            </p>
          </div>
        </div>

        {/* 중앙: 토스 스타일 통화 세그먼트 컨트롤 (Currency Segment Control) */}
        <div className="hidden md:flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl">
          <button
            onClick={() => onCurrencyChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCurrency === 'ALL'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            통합 (전체)
          </button>
          <button
            onClick={() => onCurrencyChange('KRW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCurrency === 'KRW'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            원화 (₩)
          </button>
          <button
            onClick={() => onCurrencyChange('USD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCurrency === 'USD'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            달러 ($)
          </button>
        </div>

        {/* 우측 액션 버튼 영역 (Action Area) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 샘플 데이터 & 초기화 버튼 */}
          <div className="hidden lg:flex items-center gap-1.5 border-r border-slate-200 pr-3">
            <button
              onClick={onLoadSampleData}
              title="초기 샘플 포트폴리오 불러오기"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium flex items-center gap-1.5 border border-slate-200 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-brand-600" />
              샘플 데이터
            </button>
            <button
              onClick={onClearData}
              title="모든 기록 초기화"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* API Key 연결 상태 배지 & 설정 버튼 */}
          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              hasApiKey
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/70 animate-pulse-subtle'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gemini API</span>
            {hasApiKey ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <CheckCircle2 className="w-3 h-3" /> 연결됨
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                <AlertCircle className="w-3 h-3" /> 키 필요
              </span>
            )}
          </button>

          {/* 매수 기록 추가 버튼 (토스 블루 메인 버튼) */}
          <button
            onClick={onOpenRecordModal}
            className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-brand-500/25 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>매수 기록 추가</span>
          </button>

          {/* AI 포트폴리오 상담 챗봇 열기 버튼 (다크 슬레이트 딥 톤 버튼) */}
          <button
            onClick={onOpenAiDrawer}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="hidden xs:inline">AI 진단·상담</span>
            <span className="xs:hidden">AI</span>
          </button>
        </div>

      </div>
    </header>
  );
};
