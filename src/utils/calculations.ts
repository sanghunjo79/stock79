/**
 * [포트폴리오 계산 로직 모듈]
 * 개별 매수 기록을 바탕으로 종목별 그룹화, 가중평균 매수단가,
 * 섹터별 비중, 상단 대시보드 통계 지표 등을 정밀하게 계산합니다.
 */

import { StockRecord, StockSummary, CategorySummary, PortfolioStats, Currency } from '../types';

/**
 * 개별 매수 기록을 종목(stockName)별로 그룹화하여 종합 집계 데이터를 생성합니다.
 * @param records 개별 매수 기록 배열
 * @param selectedCurrency 필터링할 통화 단위 (선택적)
 * @returns 종목별 집계 요약 배열 (비중 높은 순 정렬)
 */
export function calculateStockSummaries(
  records: StockRecord[],
  selectedCurrency?: Currency
): StockSummary[] {
  // 특정 통화로 필터링 (지정된 경우)
  const filteredRecords = selectedCurrency
    ? records.filter((r) => r.currency === selectedCurrency)
    : records;

  if (filteredRecords.length === 0) return [];

  // 전체 포트폴리오 총 투자금액 계산 (비중 계산의 분모)
  const grandTotal = filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0);

  // 종목명을 Key로 하여 그룹화 맵 생성
  const stockMap = new Map<string, {
    stockName: string;
    category: string;
    currency: Currency;
    totalQuantity: number;
    totalInvested: number;
    recordsCount: number;
    latestPurchaseDate: string;
  }>();

  for (const record of filteredRecords) {
    const existing = stockMap.get(record.stockName);

    if (existing) {
      existing.totalQuantity += record.quantity;
      existing.totalInvested += record.totalAmount;
      existing.recordsCount += 1;
      // 가장 최근 매수 일자 갱신
      if (record.purchaseDate > existing.latestPurchaseDate) {
        existing.latestPurchaseDate = record.purchaseDate;
      }
    } else {
      stockMap.set(record.stockName, {
        stockName: record.stockName,
        category: record.category,
        currency: record.currency,
        totalQuantity: record.quantity,
        totalInvested: record.totalAmount,
        recordsCount: 1,
        latestPurchaseDate: record.purchaseDate,
      });
    }
  }

  // 맵 데이터를 StockSummary 배열로 변환 및 가중평균 단가/비중 계산
  const summaries: StockSummary[] = Array.from(stockMap.values()).map((item) => {
    // 가중평균 매수단가 = 총 투자금액 / 총 보유수량
    const avgPrice = item.totalQuantity > 0 ? item.totalInvested / item.totalQuantity : 0;
    
    // 비중(%) = (종목 총 투자금액 / 전체 포트폴리오 총 투자금액) * 100
    const allocationPercentage = grandTotal > 0 ? (item.totalInvested / grandTotal) * 100 : 0;

    return {
      stockName: item.stockName,
      category: item.category,
      currency: item.currency,
      totalQuantity: item.totalQuantity,
      avgPrice,
      totalInvested: item.totalInvested,
      allocationPercentage,
      recordsCount: item.recordsCount,
      latestPurchaseDate: item.latestPurchaseDate,
    };
  });

  // 기본적으로 투자 금액이 큰 순서(내림차순)로 정렬
  return summaries.sort((a, b) => b.totalInvested - a.totalInvested);
}

/**
 * 카테고리(투자 섹터)별로 그룹화하여 투자금액과 비중을 계산합니다.
 * @param records 개별 매수 기록 배열
 * @param selectedCurrency 필터링할 통화 단위
 * @returns 섹터별 요약 배열 (비중 높은 순 정렬)
 */
export function calculateCategorySummaries(
  records: StockRecord[],
  selectedCurrency?: Currency
): CategorySummary[] {
  const filteredRecords = selectedCurrency
    ? records.filter((r) => r.currency === selectedCurrency)
    : records;

  if (filteredRecords.length === 0) return [];

  const grandTotal = filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0);

  // 카테고리별 집계 맵
  const categoryMap = new Map<string, { totalInvested: number; stocks: Set<string> }>();

  for (const record of filteredRecords) {
    const cat = record.category || '기타';
    const existing = categoryMap.get(cat);

    if (existing) {
      existing.totalInvested += record.totalAmount;
      existing.stocks.add(record.stockName);
    } else {
      categoryMap.set(cat, {
        totalInvested: record.totalAmount,
        stocks: new Set([record.stockName]),
      });
    }
  }

  const summaries: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, data]) => {
    const allocationPercentage = grandTotal > 0 ? (data.totalInvested / grandTotal) * 100 : 0;
    return {
      category,
      totalInvested: data.totalInvested,
      allocationPercentage,
      stockCount: data.stocks.size,
    };
  });

  // 투자금액 기준 내림차순 정렬
  return summaries.sort((a, b) => b.totalInvested - a.totalInvested);
}

/**
 * 대시보드 상단에 표시할 포트폴리오 핵심 종합 통계를 산출합니다.
 * @param records 전체 매수 기록
 */
export function calculatePortfolioStats(records: StockRecord[]): PortfolioStats {
  if (records.length === 0) {
    return {
      totalInvestmentKRW: 0,
      totalInvestmentUSD: 0,
      totalHoldingsCount: 0,
      totalRecordsCount: 0,
      topCategory: null,
      topStock: null,
    };
  }

  // 통화별 총 투자금액 분리 계산
  const totalInvestmentKRW = records
    .filter((r) => r.currency === 'KRW')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const totalInvestmentUSD = records
    .filter((r) => r.currency === 'USD')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  // 고유 보유 종목 집합(Set)을 통한 고유 종목 수 계산
  const uniqueStocks = new Set(records.map((r) => r.stockName));

  // 전체 종목 요약 및 카테고리 요약 계산 (KRW 기준 우선 또는 통합)
  const stockSummaries = calculateStockSummaries(records);
  const categorySummaries = calculateCategorySummaries(records);

  // 1위 섹터 정보 추출
  const topCategoryData = categorySummaries[0];
  const topCategory = topCategoryData
    ? {
        name: topCategoryData.category,
        percentage: topCategoryData.allocationPercentage,
        amount: topCategoryData.totalInvested,
      }
    : null;

  // 1위 종목 정보 추출
  const topStockData = stockSummaries[0];
  const topStock = topStockData
    ? {
        name: topStockData.stockName,
        percentage: topStockData.allocationPercentage,
        amount: topStockData.totalInvested,
      }
    : null;

  return {
    totalInvestmentKRW,
    totalInvestmentUSD,
    totalHoldingsCount: uniqueStocks.size,
    totalRecordsCount: records.length,
    topCategory,
    topStock,
  };
}
