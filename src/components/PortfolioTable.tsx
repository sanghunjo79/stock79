/**
 * [포트폴리오 종합 표 컴포넌트]
 * 프리미엄 핀테크 다크 테마 표입니다.
 * 동일 종목별로 집계된 가중평균 매수가, 총 수량, 총 투자금액, 비중(%)을
 * 정렬 및 검색 기능과 함께 시각적으로 아름답게 표시합니다.
 */

import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Briefcase, 
  Layers, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { StockSummary } from '../types';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../utils/formatters';

interface PortfolioTableProps {
  summaries: StockSummary[];
  onSelectStockForAi?: (stockName: string) => void;
  onOpenRecordModal: () => void;
}

type SortField = 'stockName' | 'category' | 'totalQuantity' | 'avgPrice' | 'totalInvested' | 'allocationPercentage' | 'latestPurchaseDate';
type SortOrder = 'asc' | 'desc';

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  summaries,
  onSelectStockForAi,
  onOpenRecordModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalInvested');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // 새로운 필드는 내림차순 기본
    }
  };

  // 검색 및 정렬 필터링된 데이터
  const filteredAndSortedSummaries = useMemo(() => {
    return summaries
      .filter((s) => {
        const query = searchTerm.toLowerCase();
        return (
          s.stockName.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;

        return sortOrder === 'asc' ? numA - numB : numB - numA;
      });
  }, [summaries, searchTerm, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-brand-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-brand-400" />
    );
  };

  // 섹터별 태그 스타일 매핑
  const getCategoryBadgeClass = (category: string) => {
    if (category.includes('반도체')) return 'bg-blue-950/60 text-blue-300 border-blue-800/50';
    if (category.includes('2차전지')) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50';
    if (category.includes('빅테크') || category.includes('IT')) return 'bg-purple-950/60 text-purple-300 border-purple-800/50';
    if (category.includes('바이오') || category.includes('헬스케어')) return 'bg-rose-950/60 text-rose-300 border-rose-800/50';
    if (category.includes('배당') || category.includes('금융')) return 'bg-amber-950/60 text-amber-300 border-amber-800/50';
    if (category.includes('ETF') || category.includes('지수')) return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50';
    return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* 헤더 및 검색 바 */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                보유 종목별 포트폴리오
              </h2>
              <p className="text-xs text-slate-400">
                종목별 가중평균 매수가와 투자 비중을 한눈에 점검하세요
              </p>
            </div>
          </div>
        </div>

        {/* 실시간 종목 검색 입력창 */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="종목명 또는 섹터 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>
      </div>

      {/* 포트폴리오 테이블 */}
      {filteredAndSortedSummaries.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 mx-auto flex items-center justify-center text-slate-500 mb-3">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            {searchTerm ? '검색 결과가 없습니다' : '등록된 주식 내역이 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm
              ? '다른 검색어로 다시 시도하거나 검색어를 비워보세요.'
              : '상단의 [매수 기록 추가] 또는 [샘플 데이터] 버튼을 눌러 첫 포트폴리오를 구성해보세요.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onOpenRecordModal}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              첫 매수 내역 등록하기
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('stockName')}
                  className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>종목명</span>
                    {renderSortIcon('stockName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>투자 섹터</span>
                    {renderSortIcon('category')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalQuantity')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>보유 수량</span>
                    {renderSortIcon('totalQuantity')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgPrice')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>평균 매수가</span>
                    {renderSortIcon('avgPrice')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalInvested')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>총 투자 금액</span>
                    {renderSortIcon('totalInvested')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('allocationPercentage')}
                  className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-white transition-colors group min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>포트폴리오 비중</span>
                    {renderSortIcon('allocationPercentage')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('latestPurchaseDate')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors group hidden md:table-cell"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>최근 매수일</span>
                    {renderSortIcon('latestPurchaseDate')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <span>AI 분석</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAndSortedSummaries.map((stock) => (
                <tr
                  key={stock.stockName}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* 종목명 */}
                  <td className="py-4 px-4 sm:px-6 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                      <span className="text-sm sm:text-base group-hover:text-brand-300 transition-colors">
                        {stock.stockName}
                      </span>
                      {stock.recordsCount > 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                          {stock.recordsCount}회 분할매수
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 투자 섹터 */}
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeClass(stock.category)}`}>
                      {stock.category}
                    </span>
                  </td>

                  {/* 보유 수량 */}
                  <td className="py-4 px-4 text-right font-medium text-slate-200">
                    {formatNumber(stock.totalQuantity)}주
                  </td>

                  {/* 평균 매수가 */}
                  <td className="py-4 px-4 text-right font-medium text-slate-300">
                    {formatCurrency(stock.avgPrice, stock.currency)}
                  </td>

                  {/* 총 투자금액 */}
                  <td className="py-4 px-4 text-right font-bold text-white text-sm sm:text-base">
                    {formatCurrency(stock.totalInvested, stock.currency)}
                  </td>

                  {/* 비중 프로그레스 바 */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stock.allocationPercentage > 35
                              ? 'bg-rose-500'
                              : stock.allocationPercentage > 20
                              ? 'bg-brand-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(2, stock.allocationPercentage))}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-200 min-w-[42px] text-right">
                        {formatPercentage(stock.allocationPercentage)}
                      </span>
                    </div>
                  </td>

                  {/* 최근 매수일 */}
                  <td className="py-4 px-4 text-center text-xs text-slate-400 hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{formatDate(stock.latestPurchaseDate)}</span>
                    </div>
                  </td>

                  {/* AI 빠른 질문 액션 */}
                  <td className="py-4 px-4 text-center">
                    {onSelectStockForAi && (
                      <button
                        onClick={() => onSelectStockForAi(stock.stockName)}
                        title={`Gemini AI에게 '${stock.stockName}' 종목 분석 요청하기`}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-brand-600/30 text-slate-400 hover:text-brand-300 border border-slate-700/60 hover:border-brand-500/50 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
