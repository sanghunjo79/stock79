/**
 * [메인 애플리케이션 컴포넌트]
 * 토스/핀테크 스타일의 밝고 선명한 화이트 & 블루 라이트 테마 대시보드입니다.
 * 주식 가계부와 포트폴리오 대시보드, Gemini AI 상담 챗봇을 통합 관리합니다.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  TrendingUp 
} from 'lucide-react';
import { StockRecord, Currency, GeminiConfig } from './types';
import { 
  loadStockRecords, 
  saveStockRecords, 
  resetToSampleRecords, 
  clearAllRecords,
  loadGeminiConfig,
  saveGeminiConfig,
  clearGeminiApiKey
} from './utils/storage';
import { 
  calculateStockSummaries, 
  calculateCategorySummaries, 
  calculatePortfolioStats 
} from './utils/calculations';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { PortfolioTable } from './components/PortfolioTable';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { RecordListTable } from './components/RecordListTable';
import { RecordFormModal } from './components/RecordFormModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';

export const App: React.FC = () => {
  // 1. 핵심 상태 관리 (Core States)
  const [records, setRecords] = useState<StockRecord[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig>({ apiKey: '', modelName: 'gemini-3-flash-preview' });

  // 2. 모달 및 드로어 상태 (Modal & Drawer States)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockRecord | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | undefined>(undefined);

  // 3. 토스트 알림 메시지 상태 (Toast Notification State)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // 알림 토스트 표시 헬퍼
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 4. 초기 로컬스토리지 데이터 로드
  useEffect(() => {
    const loadedRecords = loadStockRecords();
    setRecords(loadedRecords);

    const loadedConfig = loadGeminiConfig();
    setGeminiConfig(loadedConfig);
  }, []);

  // 5. 파생 통계 데이터 실시간 계산 (Memoization)
  const currencyFilter = selectedCurrency === 'ALL' ? undefined : selectedCurrency;

  const stockSummaries = useMemo(() => {
    return calculateStockSummaries(records, currencyFilter);
  }, [records, currencyFilter]);

  const categorySummaries = useMemo(() => {
    return calculateCategorySummaries(records, currencyFilter);
  }, [records, currencyFilter]);

  const portfolioStats = useMemo(() => {
    return calculatePortfolioStats(records);
  }, [records]);

  // 6. 데이터 조작 핸들러들
  // 매수 기록 추가 또는 수정
  const handleSaveRecord = (recordData: Omit<StockRecord, 'id' | 'createdAt'> & { id?: string }) => {
    let updatedRecords: StockRecord[];

    if (recordData.id) {
      // 수정 모드
      updatedRecords = records.map((r) =>
        r.id === recordData.id
          ? { ...r, ...recordData, totalAmount: recordData.price * recordData.quantity }
          : r
      );
      showToast(`'${recordData.stockName}' 매수 기록이 수정되었습니다.`);
    } else {
      // 신규 추가 모드
      const newRecord: StockRecord = {
        ...recordData,
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      updatedRecords = [newRecord, ...records];
      showToast(`'${recordData.stockName}' 매수 내역이 성공적으로 등록되었습니다!`);
    }

    setRecords(updatedRecords);
    saveStockRecords(updatedRecords);
    setEditingRecord(null);
  };

  // 매수 기록 단건 삭제
  const handleDeleteRecord = (id: string) => {
    const targetRecord = records.find((r) => r.id === id);
    const stockName = targetRecord ? targetRecord.stockName : '선택한';
    const updatedRecords = records.filter((r) => r.id !== id);
    setRecords(updatedRecords);
    saveStockRecords(updatedRecords);
    showToast(`'${stockName}' 매수 기록이 삭제되었습니다.`, 'info');
  };

  // 샘플 데이터 불러오기
  const handleLoadSampleData = () => {
    if (confirm('샘플 포트폴리오 데이터를 불러오시겠습니까? (기존 데이터가 샘플 데이터로 대체됩니다)')) {
      const sampleData = resetToSampleRecords();
      setRecords(sampleData);
      showToast('샘플 포트폴리오 데이터를 성공적으로 불러왔습니다!');
    }
  };

  // 전체 기록 초기화
  const handleClearData = () => {
    if (confirm('모든 주식 매수 내역을 삭제하고 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearAllRecords();
      setRecords([]);
      showToast('모든 내역이 초기화되었습니다.', 'info');
    }
  };

  // Gemini 설정 저장
  const handleSaveGeminiConfig = (newConfig: GeminiConfig) => {
    setGeminiConfig(newConfig);
    saveGeminiConfig(newConfig);
    showToast('Gemini API 설정이 저장되었습니다.');
  };

  // Gemini API Key 삭제
  const handleClearApiKey = () => {
    clearGeminiApiKey();
    setGeminiConfig((prev) => ({ ...prev, apiKey: '' }));
    showToast('Gemini API 키가 삭제되었습니다.', 'info');
  };

  // 특정 종목에 대한 AI 진단 원클릭 트리거
  const handleSelectStockForAi = (stockName: string) => {
    setAiInitialQuestion(`내 포트폴리오에서 '${stockName}' 종목의 보유 비중과 리스크, 향후 투자 전략에 대해 심층 분석해줘.`);
    setIsAiDrawerOpen(true);
  };

  // 수정 모달 열기
  const handleOpenEditModal = (record: StockRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      
      {/* 1. 상단 네비게이션 헤더 */}
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        hasApiKey={Boolean(geminiConfig.apiKey)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenRecordModal={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenAiDrawer={() => {
          setAiInitialQuestion(undefined);
          setIsAiDrawerOpen(true);
        }}
        onLoadSampleData={handleLoadSampleData}
        onClearData={handleClearData}
      />

      {/* 2. 토스트 알림 (Toast Notification) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xl text-xs sm:text-sm font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 3. 메인 콘텐츠 대시보드 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* 상단 소개 배너 및 AI 진단 바로가기 (API Key 미등록 시 돋보이는 가이드) */}
        {!geminiConfig.apiKey && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25 flex-shrink-0">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Google Gemini 3.0 기반 AI 포트폴리오 진단 준비하기
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  무료 Gemini API Key를 등록하면 섹터 쏠림 분석과 분산 투자 조언을 실시간으로 받을 수 있습니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-sm shadow-brand-500/25 transition-all active:scale-95 whitespace-nowrap"
            >
              API Key 1초 설정하기
            </button>
          </div>
        )}

        {/* 상단 핵심 지표 통계 요약 카드 4종 */}
        <StatsDashboard
          stats={portfolioStats}
          selectedCurrency={selectedCurrency}
        />

        {/* 상단 섹션 그리드: 좌측 종목별 포트폴리오 종합 표 (2열) + 우측 섹터별 비중 및 AI 상담실 (1열) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* 종목별 포트폴리오 표 (2열 차지) */}
          <div className="lg:col-span-2">
            <PortfolioTable
              summaries={stockSummaries}
              onSelectStockForAi={handleSelectStockForAi}
              onOpenRecordModal={() => {
                setEditingRecord(null);
                setIsRecordModalOpen(true);
              }}
            />
          </div>

          {/* 우측 사이드 패널: 섹터별 비중 차트 & 빠른 AI 어드바이저 위젯 */}
          <div className="space-y-6">
            
            {/* 섹터별 비중 배분율 */}
            <CategoryBreakdown categories={categorySummaries} />

            {/* AI 포트폴리오 진단 추천 카드 위젯 */}
            <div className="glass-card p-5 sm:p-6 bg-gradient-to-b from-white to-blue-50/40 border-brand-200/80 relative overflow-hidden shadow-card">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-500 border border-brand-100 shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  AI 포트폴리오 상담실
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                현재 포트폴리오의 비중과 리스크를 구글 AI가 실시간 진단해 드립니다.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setAiInitialQuestion('현재 내 전체 포트폴리오의 구성과 안정성, 성장성을 종합적으로 진단하고 총평을 작성해줘.');
                    setIsAiDrawerOpen(true);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-brand-50/70 border border-slate-200 hover:border-brand-200 text-left text-xs font-bold text-slate-700 hover:text-brand-600 transition-all flex items-center justify-between group shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    <span>종합 포트폴리오 진단</span>
                  </span>
                  <span className="text-brand-500 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  onClick={() => {
                    setAiInitialQuestion('특정 산업이나 섹터에 자산이 과도하게 편중되어 있는지 리스크 요인을 집중 점검해줘.');
                    setIsAiDrawerOpen(true);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-brand-50/70 border border-slate-200 hover:border-brand-200 text-left text-xs font-bold text-slate-700 hover:text-brand-600 transition-all flex items-center justify-between group shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span>⚖️</span>
                    <span>섹터 쏠림 및 리스크 점검</span>
                  </span>
                  <span className="text-brand-500 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  onClick={() => {
                    setAiInitialQuestion('포트폴리오의 변동성을 낮추기 위해 향후 어떤 섹터나 자산군을 보강하면 좋을지 구체적으로 조언해줘.');
                    setIsAiDrawerOpen(true);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-brand-50/70 border border-slate-200 hover:border-brand-200 text-left text-xs font-bold text-slate-700 hover:text-brand-600 transition-all flex items-center justify-between group shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span>💡</span>
                    <span>분산 투자 및 리밸런싱 조언</span>
                  </span>
                  <span className="text-brand-500 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setAiInitialQuestion(undefined);
                  setIsAiDrawerOpen(true);
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm shadow-brand-500/25 transition-all text-center flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>AI 상담 대화창 열기</span>
              </button>
            </div>

          </div>

        </div>

        {/* 하단 전체 너비 섹션: 개별 매수 내역 원장 리스트 */}
        <section className="w-full">
          <RecordListTable
            records={records}
            onEditRecord={handleOpenEditModal}
            onDeleteRecord={handleDeleteRecord}
            onOpenRecordModal={() => {
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            selectedCurrency={selectedCurrency}
          />
        </section>

      </main>

      {/* 4. 푸터 */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span className="font-bold text-slate-700">주식 가계부 & AI 포트폴리오 진단</span>
          </div>
          <p className="text-[11px] text-slate-500">
            데이터는 브라우저 LocalStorage에 안전하게 보관됩니다. (Google Gemini 3.0 Flash Preview 연동)
          </p>
        </div>
      </footer>

      {/* 5. 모달 및 드로어 컴포넌트 */}
      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        editingRecord={editingRecord}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        config={geminiConfig}
        onSaveConfig={handleSaveGeminiConfig}
        onClearApiKey={handleClearApiKey}
      />

      <AiAdvisorDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        config={geminiConfig}
        onOpenApiKeyModal={() => {
          setIsAiDrawerOpen(false);
          setIsApiKeyModalOpen(true);
        }}
        records={records}
        stockSummaries={stockSummaries}
        categorySummaries={categorySummaries}
        stats={portfolioStats}
        initialQuestion={aiInitialQuestion}
      />

    </div>
  );
};
