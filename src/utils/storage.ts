/**
 * [LocalStorage 영속성 관리 모듈]
 * 브라우저 로컬스토리지를 통해 주식 매수 내역 데이터와 Gemini API 설정을 안전하게 영구 보관합니다.
 */

import { StockRecord, GeminiConfig } from '../types';

// 로컬스토리지 키 상수 정의
const STORAGE_KEYS = {
  RECORDS: 'stock_portfolio_records_v1',
  GEMINI_API_KEY: 'stock_portfolio_gemini_key',
  GEMINI_MODEL: 'stock_portfolio_gemini_model',
  CHAT_HISTORY: 'stock_portfolio_chat_history',
};

/**
 * 기본 제공 샘플 포트폴리오 데이터셋
 * 사용자가 첫 실행 시 바로 기능을 체험해볼 수 있도록 현실감 있는 데이터를 구성합니다.
 */
export const SAMPLE_RECORDS: StockRecord[] = [
  {
    id: 'sample-1',
    stockName: '삼성전자',
    category: '반도체',
    purchaseDate: '2026-08-10',
    price: 74000,
    quantity: 50,
    currency: 'KRW',
    totalAmount: 3700000,
    notes: 'HBM 공급 확대 및 메모리 반등 기대 분할 매수',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'sample-2',
    stockName: '삼성전자',
    category: '반도체',
    purchaseDate: '2026-08-25',
    price: 71500,
    quantity: 30,
    currency: 'KRW',
    totalAmount: 2145000,
    notes: '조정 시 추가 물량 확보',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: 'sample-3',
    stockName: 'SK하이닉스',
    category: '반도체',
    purchaseDate: '2026-08-15',
    price: 195000,
    quantity: 20,
    currency: 'KRW',
    totalAmount: 3900000,
    notes: 'AI 서버용 HBM 독점적 경쟁력 주목',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: 'sample-4',
    stockName: '엔비디아 (NVDA)',
    category: '빅테크/IT',
    purchaseDate: '2026-08-20',
    price: 125,
    quantity: 25,
    currency: 'USD',
    totalAmount: 3125,
    notes: '차세대 AI 가속기 플랫폼 수요 지속 전망',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'sample-5',
    stockName: '애플 (AAPL)',
    category: '빅테크/IT',
    purchaseDate: '2026-08-05',
    price: 220,
    quantity: 15,
    currency: 'USD',
    totalAmount: 3300,
    notes: '온디바이스 AI 및 서비스 생태계 수익성',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
  },
  {
    id: 'sample-6',
    stockName: 'LG에너지솔루션',
    category: '2차전지',
    purchaseDate: '2026-08-18',
    price: 360000,
    quantity: 8,
    currency: 'KRW',
    totalAmount: 2880000,
    notes: '북미 배터리 JV 가동 본격화 수혜',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 22,
  },
  {
    id: 'sample-7',
    stockName: 'KODEX 200',
    category: 'ETF/지수추종',
    purchaseDate: '2026-07-28',
    price: 35000,
    quantity: 100,
    currency: 'KRW',
    totalAmount: 3500000,
    notes: '국내 시장 지수 추종 안정형 배분',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
  },
  {
    id: 'sample-8',
    stockName: 'KB금융',
    category: '배당주/금융',
    purchaseDate: '2026-08-12',
    price: 82000,
    quantity: 35,
    currency: 'KRW',
    totalAmount: 2870000,
    notes: '밸류업 프로그램 및 분기 배당 매력',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
  },
];

/**
 * 저장된 전체 매수 기록을 불러옵니다.
 * 데이터가 없을 경우 기본 샘플 데이터를 로드하여 저장합니다.
 */
export function loadStockRecords(): StockRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      // 초기 실행 시 샘플 데이터로 채워줌
      saveStockRecords(SAMPLE_RECORDS);
      return SAMPLE_RECORDS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('로컬스토리지 주식 기록 로드 실패:', error);
    return [];
  }
}

/**
 * 매수 기록 전체를 로컬스토리지에 저장합니다.
 */
export function saveStockRecords(records: StockRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('로컬스토리지 주식 기록 저장 실패:', error);
  }
}

/**
 * 샘플 데이터로 강제 초기화합니다.
 */
export function resetToSampleRecords(): StockRecord[] {
  saveStockRecords(SAMPLE_RECORDS);
  return SAMPLE_RECORDS;
}

/**
 * 모든 주식 기록을 완전히 비웁니다.
 */
export function clearAllRecords(): void {
  saveStockRecords([]);
}

/**
 * 저장된 Gemini API 설정을 불러옵니다.
 */
export function loadGeminiConfig(): GeminiConfig {
  try {
    const apiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
    const modelName = localStorage.getItem(STORAGE_KEYS.GEMINI_MODEL) || 'gemini-3-flash-preview';
    return { apiKey, modelName };
  } catch {
    return { apiKey: '', modelName: 'gemini-3-flash-preview' };
  }
}

/**
 * Gemini API 설정을 로컬스토리지에 저장합니다.
 */
export function saveGeminiConfig(config: GeminiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, config.apiKey.trim());
    localStorage.setItem(STORAGE_KEYS.GEMINI_MODEL, config.modelName);
  } catch (error) {
    console.error('Gemini 설정 저장 실패:', error);
  }
}

/**
 * 저장된 Gemini API Key를 완전히 삭제합니다.
 */
export function clearGeminiApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
  } catch (error) {
    console.error('Gemini 키 삭제 실패:', error);
  }
}
