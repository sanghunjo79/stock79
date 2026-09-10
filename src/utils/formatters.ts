/**
 * [포맷터 유틸리티]
 * 통화, 숫자, 날짜, 퍼센트 표시를 표준화하여 사용자에게 일관되고 가독성 높은 정보를 제공합니다.
 */

import { Currency } from '../types';

/**
 * 금액을 해당 통화 형식에 맞게 천 단위 콤마와 기호를 붙여 변환합니다.
 * @param amount 금액 (숫자)
 * @param currency 통화 단위 ('KRW' | 'USD')
 * @returns 포맷팅된 문자열 (예: ₩1,250,000 또는 $1,250.00)
 */
export function formatCurrency(amount: number, currency: Currency = 'KRW'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'USD' ? '$0.00' : '₩0';
  }

  if (currency === 'USD') {
    // 달러는 소수점 2자리까지 표기
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // 원화는 정수 단위로 표기 (₩ 기호 및 콤마)
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * 일반 숫자에 3자리마다 콤마를 추가합니다.
 * @param num 숫자
 * @param decimals 표시할 소수점 자리수 (기본값: 자동 또는 0)
 */
export function formatNumber(num: number, decimals?: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  
  if (decimals !== undefined) {
    return num.toLocaleString('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  
  return num.toLocaleString('ko-KR');
}

/**
 * 비중이나 비율을 퍼센트(%) 문자열로 변환합니다.
 * @param percentage 퍼센트 수치 (예: 25.4)
 * @param decimals 소수점 자리수 (기본값: 1)
 */
export function formatPercentage(percentage: number, decimals: number = 1): string {
  if (isNaN(percentage) || percentage === null || percentage === undefined) {
    return '0.0%';
  }
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 날짜 문자열(YYYY-MM-DD)을 한국식 날짜 형식으로 가독성 있게 변환합니다.
 * @param dateStr 날짜 문자열
 * @returns '2026. 09. 10.' 형태의 문자열
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]}. ${parts[1]}. ${parts[2]}`;
  }
  return dateStr;
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환합니다. (매수 폼 기본값용)
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
