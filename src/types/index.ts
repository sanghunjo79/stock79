/**
 * [타입 정의 모듈]
 * 주식 가계부 및 AI 포트폴리오 진단 앱에서 사용하는 모든 핵심 데이터 타입을 정의합니다.
 */

// 지원하는 주식 투자 섹터(카테고리) 목록
export type StockCategory =
  | '반도체'
  | '2차전지'
  | '빅테크/IT'
  | '바이오/헬스케어'
  | '배당주/금융'
  | 'ETF/지수추종'
  | '자동차/모빌리티'
  | '소비재/유통'
  | '에너지/화학'
  | '기타';

// 지원 통화 단위
export type Currency = 'KRW' | 'USD';

/**
 * 개별 매수 기록 데이터 구조 (단일 거래 내역)
 */
export interface StockRecord {
  id: string;             // 고유 식별자 (UUID 등)
  stockName: string;      // 종목명 또는 티커 (예: 삼성전자, 애플, NVDA 등)
  category: StockCategory | string; // 투자 분야 / 섹터
  purchaseDate: string;   // 매수 일자 (YYYY-MM-DD)
  price: number;          // 1주당 매수가
  quantity: number;       // 매수 수량 (주)
  currency: Currency;     // 통화 단위 (KRW 또는 USD)
  totalAmount: number;    // 총 매수 금액 (자동 계산: price * quantity)
  notes?: string;         // 매수 사유 또는 메모
  createdAt: number;      // 등록 시각 타임스탬프
}

/**
 * 동일 종목별 집계 요약 정보 (포트폴리오 종합 표 표시용)
 */
export interface StockSummary {
  stockName: string;            // 종목명
  category: string;             // 대표 섹터
  currency: Currency;           // 통화
  totalQuantity: number;        // 총 보유 수량
  avgPrice: number;             // 가중평균 매수단가
  totalInvested: number;        // 총 매수 투자금액
  allocationPercentage: number; // 전체 포트폴리오 내 투자 비중 (%)
  recordsCount: number;         // 매수 기록 횟수
  latestPurchaseDate: string;   // 최근 매수일자
}

/**
 * 섹터(분야)별 집계 요약 정보
 */
export interface CategorySummary {
  category: string;             // 섹터명
  totalInvested: number;        // 해당 섹터 총 투자금액
  allocationPercentage: number; // 포트폴리오 내 비중 (%)
  stockCount: number;           // 해당 섹터 내 보유 종목 수
}

/**
 * 전체 포트폴리오 상단 핵심 대시보드 통계 지표
 */
export interface PortfolioStats {
  totalInvestmentKRW: number;   // 원화 총 투자금액
  totalInvestmentUSD: number;   // 달러 총 투자금액
  totalHoldingsCount: number;   // 총 보유 종목 수
  totalRecordsCount: number;    // 총 매수 거래 기록 건수
  topCategory: {                // 가장 비중이 높은 1위 섹터 정보
    name: string;
    percentage: number;
    amount: number;
  } | null;
  topStock: {                   // 가장 비중이 높은 1위 종목 정보
    name: string;
    percentage: number;
    amount: number;
  } | null;
}

/**
 * AI 포트폴리오 상담 챗봇 메시지 구조
 */
export interface ChatMessage {
  id: string;                   // 메시지 식별자
  role: 'user' | 'model' | 'system'; // 발화자 (사용자 / AI 모델 / 시스템 안내)
  content: string;              // 메시지 본문 (마크다운 지원)
  timestamp: string;            // 메시지 전송 시각
  isError?: boolean;            // 오류 메시지 여부
}

/**
 * Gemini API 설정 정보
 */
export interface GeminiConfig {
  apiKey: string;               // 사용자 제공 Gemini API Key
  modelName: string;            // 사용할 모델명 (기본: gemini-3-flash-preview)
}
