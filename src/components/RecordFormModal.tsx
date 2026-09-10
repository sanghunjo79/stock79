/**
 * [매수 내역 추가 및 수정 모달 컴포넌트]
 * 사용자가 새로운 주식 매수 내역을 등록하거나 기존 기록을 수정할 수 있는 반응형 모달 폼입니다.
 * 실시간 총 매수금액 자동 계산 및 엄격한 유효성 검사를 제공합니다.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Check, 
  DollarSign, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StockRecord, StockCategory, Currency } from '../types';
import { getTodayDateString, formatCurrency } from '../utils/formatters';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<StockRecord, 'id' | 'createdAt'> & { id?: string }) => void;
  editingRecord: StockRecord | null;
}

// 자주 쓰이는 추천 섹터 목록
const RECOMMENDED_CATEGORIES: StockCategory[] = [
  '반도체',
  '2차전지',
  '빅테크/IT',
  '바이오/헬스케어',
  '배당주/금융',
  'ETF/지수추종',
  '자동차/모빌리티',
  '기타',
];

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
}) => {
  const [stockName, setStockName] = useState('');
  const [category, setCategory] = useState<string>('반도체');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(getTodayDateString());
  const [currency, setCurrency] = useState<Currency>('KRW');
  const [priceStr, setPriceStr] = useState('');
  const [quantityStr, setQuantityStr] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 수정 모드일 때 초기 데이터 바인딩
  useEffect(() => {
    if (editingRecord) {
      setStockName(editingRecord.stockName);
      if (RECOMMENDED_CATEGORIES.includes(editingRecord.category as StockCategory)) {
        setCategory(editingRecord.category);
        setIsCustomCategory(false);
      } else {
        setCategory('직접입력');
        setCustomCategory(editingRecord.category);
        setIsCustomCategory(true);
      }
      setPurchaseDate(editingRecord.purchaseDate);
      setCurrency(editingRecord.currency);
      setPriceStr(editingRecord.price.toString());
      setQuantityStr(editingRecord.quantity.toString());
      setNotes(editingRecord.notes || '');
      setError(null);
    } else {
      // 신규 등록 시 기본값 리셋
      setStockName('');
      setCategory('반도체');
      setCustomCategory('');
      setIsCustomCategory(false);
      setPurchaseDate(getTodayDateString());
      setCurrency('KRW');
      setPriceStr('');
      setQuantityStr('');
      setNotes('');
      setError(null);
    }
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  // 실시간 총 매수금액 자동 계산
  const priceNum = parseFloat(priceStr) || 0;
  const quantityNum = parseFloat(quantityStr) || 0;
  const calculatedTotal = priceNum * quantityNum;

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. 유효성 검사
    if (!stockName.trim()) {
      setError('종목명을 입력해주세요.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('투자 섹터(분야)를 선택하거나 입력해주세요.');
      return;
    }

    if (!purchaseDate) {
      setError('매수 일자를 선택해주세요.');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('1주당 매수가는 0보다 큰 숫자로 입력해주세요.');
      return;
    }

    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('매수 수량은 0보다 큰 숫자로 입력해주세요.');
      return;
    }

    // 2. 저장 수행
    onSave({
      id: editingRecord?.id,
      stockName: stockName.trim(),
      category: finalCategory,
      purchaseDate,
      currency,
      price: priceNum,
      quantity: quantityNum,
      totalAmount: calculatedTotal,
      notes: notes.trim(),
    });

    // 신규 등록 성공 시 축하 폭죽 효과
    if (!editingRecord) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // 무시
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto border-slate-700/80 shadow-2xl p-6 sm:p-8">
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {editingRecord ? '매수 기록 수정' : '새 주식 매수 기록'}
              </h3>
              <p className="text-xs text-slate-400">
                매수한 종목의 단가와 수량을 입력하여 포트폴리오에 반영합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 에러 알림 */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {/* 종목명 & 통화 단위 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                종목명 / 티커 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 삼성전자, 애플, NVDA 등"
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                통화 단위 <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCurrency('KRW')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currency === 'KRW'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  KRW (₩)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currency === 'USD'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </div>

          {/* 투자 섹터(카테고리) 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              투자 섹터(분야) <span className="text-rose-400">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {RECOMMENDED_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setIsCustomCategory(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    !isCustomCategory && category === cat
                      ? 'bg-brand-600/30 border-brand-500 text-brand-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(true);
                  setCategory('직접입력');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isCustomCategory
                    ? 'bg-brand-600/30 border-brand-500 text-brand-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                + 직접 입력
              </button>
            </div>
            {isCustomCategory && (
              <input
                type="text"
                placeholder="섹터명을 직접 입력하세요 (예: 우주항공, 원자력 등)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="glass-input w-full text-xs mt-1"
                autoFocus
              />
            )}
          </div>

          {/* 매수 일자 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              매수 일자 <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="glass-input w-full text-sm text-slate-200 cursor-pointer"
            />
          </div>

          {/* 1주당 매수가 & 매수 수량 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                1주당 매수가 ({currency === 'USD' ? '달러 $' : '원 ₩'}) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={currency === 'USD' ? '0.01' : '1'}
                  min="0.0001"
                  required
                  placeholder={currency === 'USD' ? '예: 125.50' : '예: 74000'}
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  className="glass-input w-full text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                매수 수량 (주) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                placeholder="예: 10"
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
                className="glass-input w-full text-sm font-mono"
              />
            </div>
          </div>

          {/* 총 매수금액 자동 계산 안내 박스 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>총 매수 금액 (자동 계산):</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              {formatCurrency(calculatedTotal, currency)}
            </div>
          </div>

          {/* 매수 사유 / 메모 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              매수 사유 / 투자 메모 (선택사항)
            </label>
            <textarea
              rows={2}
              placeholder="예: HBM 수요 증가 기대, 실적 발표 후 분할 매수 등"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input w-full text-xs resize-none"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingRecord ? '수정 내용 저장' : '매수 기록 저장'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
