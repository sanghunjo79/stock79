/**
 * [대시보드 상단 핵심 통계 카드 컴포넌트]
 * 토스/핀테크 스타일의 밝고 선명한 화이트 카드 대시보드입니다.
 * 총 투자금액(KRW/USD), 보유 종목 수, 최고 비중 섹터 및 종목 등 포트폴리오 핵심 지표를 요약 표시합니다.
 */

import React from 'react';
import { 
  Wallet, 
  Layers, 
  PieChart, 
  Award, 
  ArrowUpRight 
} from 'lucide-react';
import { PortfolioStats, Currency } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface StatsDashboardProps {
  stats: PortfolioStats;
  selectedCurrency: Currency | 'ALL';
  onQuickCategoryFilter?: (category: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  selectedCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      {/* 카드 1: 총 투자금액 (Total Investment) */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-slate-500">
            총 투자 금액
          </span>
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          {selectedCurrency === 'USD' ? (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(stats.totalInvestmentUSD, 'USD')}
            </div>
          ) : selectedCurrency === 'KRW' ? (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(stats.totalInvestmentKRW, 'KRW')}
            </div>
          ) : (
            <>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {formatCurrency(stats.totalInvestmentKRW, 'KRW')}
              </div>
              {stats.totalInvestmentUSD > 0 && (
                <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <span>+ {formatCurrency(stats.totalInvestmentUSD, 'USD')}</span>
                  <span className="text-[11px] text-slate-400 font-normal">(해외주식)</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>총 매수 횟수:</span>
          <span className="font-bold text-slate-700">{stats.totalRecordsCount}건</span>
        </div>
      </div>

      {/* 카드 2: 보유 종목 수 (Holdings Count) */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-slate-500">
            보유 종목 수
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{stats.totalHoldingsCount}</span>
            <span className="text-base font-medium text-slate-400">개 종목</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs">
          {stats.totalHoldingsCount >= 5 ? (
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80 font-bold">
              안정적 분산 투자 중
            </span>
          ) : stats.totalHoldingsCount > 0 ? (
            <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80 font-bold">
              집중 투자 (분산 권장)
            </span>
          ) : (
            <span className="text-slate-400">종목을 등록해주세요</span>
          )}
        </div>
      </div>

      {/* 카드 3: 최대 투자 섹터 (Top Sector) */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-slate-500">
            최대 투자 섹터
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
            <PieChart className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {stats.topCategory ? stats.topCategory.name : '-'}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">섹터 비중:</span>
          {stats.topCategory ? (
            <span className={`font-bold px-2 py-0.5 rounded-md ${
              stats.topCategory.percentage > 40
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {formatPercentage(stats.topCategory.percentage)}
            </span>
          ) : (
            <span className="text-slate-400">0%</span>
          )}
        </div>
      </div>

      {/* 카드 4: 최대 보유 종목 (Top Stock) */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-slate-500">
            최대 보유 종목
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {stats.topStock ? stats.topStock.name : '-'}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">포트폴리오 비중:</span>
          {stats.topStock ? (
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {formatPercentage(stats.topStock.percentage)}
            </span>
          ) : (
            <span className="text-slate-400">0%</span>
          )}
        </div>
      </div>

    </div>
  );
};
