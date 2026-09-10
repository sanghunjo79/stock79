/**
 * [Gemini AI 서비스 모듈]
 * 사용자의 포트폴리오 집계 데이터를 정밀하게 구조화하여 시스템 컨텍스트로 주입하고,
 * Google Gemini 모델(gemini-3-flash-preview)을 통해 객관적이고 심도 있는 포트폴리오 진단/상담을 수행합니다.
 */

import { StockRecord, StockSummary, CategorySummary, PortfolioStats } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// 사용 가능한 추천 Gemini 모델 목록
export const AVAILABLE_GEMINI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview (최신 고속 분석)', recommended: true },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', recommended: false },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (안정성)', recommended: false },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (심층 심화 분석)', recommended: false },
];

/**
 * 현재 사용자의 전체 포트폴리오 데이터를 Gemini AI가 정밀 분석할 수 있도록 구조화된 마크다운 텍스트로 변환합니다.
 */
export function generatePortfolioContextString(
  records: StockRecord[],
  stockSummaries: StockSummary[],
  categorySummaries: CategorySummary[],
  stats: PortfolioStats
): string {
  if (records.length === 0) {
    return '현재 등록된 보유 주식 데이터가 없습니다.';
  }

  let context = `## 📊 사용자 포트폴리오 현재 상태 데이터\n\n`;

  // 1. 핵심 요약
  context += `### 1. 포트폴리오 개요\n`;
  if (stats.totalInvestmentKRW > 0) {
    context += `- 원화 총 투자금액: ${formatCurrency(stats.totalInvestmentKRW, 'KRW')}\n`;
  }
  if (stats.totalInvestmentUSD > 0) {
    context += `- 달러 총 투자금액: ${formatCurrency(stats.totalInvestmentUSD, 'USD')}\n`;
  }
  context += `- 총 보유 종목 수: ${stats.totalHoldingsCount}개 종목\n`;
  context += `- 총 매수 기록 횟수: ${stats.totalRecordsCount}회\n`;
  if (stats.topCategory) {
    context += `- 최대 투자 섹터: ${stats.topCategory.name} (${formatPercentage(stats.topCategory.percentage)})\n`;
  }
  if (stats.topStock) {
    context += `- 최대 투자 종목: ${stats.topStock.name} (${formatPercentage(stats.topStock.percentage)})\n`;
  }
  context += `\n`;

  // 2. 섹터별 비중 현황
  context += `### 2. 투자 섹터(분야)별 비중 배분 현황\n`;
  context += `| 섹터명 | 투자 금액 | 비중(%) | 보유 종목 수 |\n`;
  context += `| :--- | :--- | :--- | :--- |\n`;
  categorySummaries.forEach((cat) => {
    context += `| ${cat.category} | ${cat.totalInvested.toLocaleString()} | ${formatPercentage(cat.allocationPercentage)} | ${cat.stockCount}개 |\n`;
  });
  context += `\n`;

  // 3. 종목별 세부 보유 현황
  context += `### 3. 종목별 보유 현황 (가중평균단가 및 비중)\n`;
  context += `| 종목명 | 섹터 | 보유수량 | 평균매수가 | 총투자금액 | 비중(%) | 매수횟수 |\n`;
  context += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  stockSummaries.forEach((stock) => {
    context += `| ${stock.stockName} | ${stock.category} | ${stock.totalQuantity.toLocaleString()}주 | ${formatCurrency(stock.avgPrice, stock.currency)} | ${formatCurrency(stock.totalInvested, stock.currency)} | ${formatPercentage(stock.allocationPercentage)} | ${stock.recordsCount}회 |\n`;
  });
  context += `\n`;

  // 4. 최근 매수 내역 (최대 5건)
  const recentRecords = [...records].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).slice(0, 5);
  context += `### 4. 최근 매수 내역 (최근 5건)\n`;
  recentRecords.forEach((r, idx) => {
    context += `${idx + 1}. [${r.purchaseDate}] ${r.stockName} (${r.category}) - ${r.quantity}주 @ ${formatCurrency(r.price, r.currency)} (메모: ${r.notes || '없음'})\n`;
  });

  return context;
}

/**
 * AI 포트폴리오 상담 시스템 프롬프트를 생성합니다.
 */
function getSystemInstruction(portfolioContext: string): string {
  return `당신은 대한민국 최고의 금융/자산관리 전문 'AI 주식 포트폴리오 수석 분석가'입니다.
사용자가 제공한 포트폴리오 데이터를 바탕으로 객관적이고 균형 잡힌 전문적인 진단과 실용적인 조언을 제공합니다.

### 🌟 사용자 포트폴리오 실시간 데이터:
${portfolioContext}

### 🎯 상담 지침 및 원칙:
1. **객관적인 비중 및 리스크 점검**:
   - 특정 단일 종목 또는 특정 섹터(예: 반도체나 2차전지 등)에 30% 이상 과도하게 편중되어 있는지 확인하고, 집중 투자에 따른 변동성 리스크를 짚어주세요.
   - 현금성 자산, 배당주, 지수 추종 ETF, 성장주 간의 균형 있는 분산 투자(Diversification) 관점을 제시하세요.
2. **건설적인 리밸런싱 조언**:
   - 현재 비중을 고려했을 때 추가 매수 시 어떤 섹터나 자산군을 보강하면 전체 변동성을 낮추고 안정성을 높일 수 있는지 구체적으로 조언하세요.
3. **가독성 높은 서식 사용**:
   - 요점을 명확히 파악할 수 있도록 마크다운 소제목, 불릿 포인트(-), 이모지, 굵은 글씨(**)를 적절히 활용하여 시각적으로 읽기 쉽게 작성하세요.
4. **필수 면책 조항(Disclaimer)**:
   - 답변의 맨 마지막 줄에는 반드시 아래의 면책 문구를 정중하게 포함해야 합니다:
   > ⚠️ **투자 유의사항**: 본 AI 진단 및 상담 내용은 참고용 분석 정보이며, 특정 종목의 매수·매도를 추천하거나 투자 수익을 보장하지 않습니다. 모든 투자의 최종 결정과 책임은 투자자 본인에게 있습니다.`;
}

/**
 * Gemini API Key의 유효성을 검증하기 위한 간단한 Ping 테스트 함수입니다.
 */
export async function testGeminiApiKey(apiKey: string, modelName: string = 'gemini-3-flash-preview'): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim() === '') {
    return { success: false, message: 'API 키를 입력해주세요.' };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Hello, respond with "OK".' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
        },
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Google Gemini API 연결에 성공했습니다!' };
    }

    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || response.statusText;

    if (response.status === 400 && errorMessage.includes('API_KEY_INVALID')) {
      return { success: false, message: '유효하지 않은 API 키입니다. Google AI Studio에서 발급받은 키를 다시 확인해주세요.' };
    }
    if (response.status === 403) {
      return { success: false, message: 'API 키에 권한이 없거나 제한되었습니다 (403 Forbidden).' };
    }
    if (response.status === 404) {
      return { success: false, message: `지정된 모델(${modelName})을 찾을 수 없습니다. 기본 모델을 시도해보세요.` };
    }

    return { success: false, message: `연결 실패 (${response.status}): ${errorMessage}` };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, message: `네트워크 오류가 발생했습니다: ${error.message || '인터넷 연결 상태를 확인해주세요.'}` };
  }
}

/**
 * Gemini 모델에 질문 및 대화 히스토리와 함께 포트폴리오 분석을 요청합니다.
 */
export async function askGeminiAdvisor({
  apiKey,
  modelName = 'gemini-3-flash-preview',
  userMessage,
  portfolioContext,
  chatHistory = [],
}: {
  apiKey: string;
  modelName?: string;
  userMessage: string;
  portfolioContext: string;
  chatHistory?: { role: 'user' | 'model'; content: string }[];
}): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API 키가 설정되지 않았습니다. 상단 우측 [API Key 설정] 버튼을 눌러 키를 먼저 등록해주세요.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

  // 대화 히스토리 포맷 변환 (Gemini API contents 규격)
  const contents = [];

  // 이전 대화 기록 추가
  for (const msg of chatHistory) {
    contents.push({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  // 현재 사용자 질문 추가
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const requestBody = {
    systemInstruction: {
      parts: [{ text: getSystemInstruction(portfolioContext) }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || response.statusText;

      if (response.status === 400 && errorMessage.includes('API_KEY_INVALID')) {
        throw new Error('API 키가 올바르지 않습니다. 정확한 Google Gemini API Key를 입력했는지 확인해주세요.');
      }
      if (response.status === 429) {
        throw new Error('Gemini API 요청 한도(Quota)를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
      if (response.status === 404) {
        throw new Error(`모델(${modelName})을 찾을 수 없습니다. API Key 설정에서 다른 모델(예: gemini-2.5-flash)을 선택해보세요.`);
      }

      throw new Error(`AI 응답 생성 실패 (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      if (candidate?.finishReason === 'SAFETY') {
        return '안전 정책 필터링에 의해 응답이 제한되었습니다. 다른 질문을 입력해주세요.';
      }
      throw new Error('AI 모델로부터 응답 텍스트를 받지 못했습니다.');
    }

    return candidate.content.parts[0].text;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gemini API 호출 중 오류 발생:', error);
    throw error;
  }
}
