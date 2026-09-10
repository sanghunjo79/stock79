/**
 * [대시보드 상단 핵심 통계 카드 컴포넌트]
 * 프리미엄 핀테크 다크 카드 대시보드입니다.
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
      
      {/* 카드 1: 총 투자금액 */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            총 투자 금액
          </span>
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          {selectedCurrency === 'USD' ? (
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(stats.totalInvestmentUSD, 'USD')}
            </div>
          ) : selectedCurrency === 'KRW' ? (
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(stats.totalInvestmentKRW, 'KRW')}
            </div>
          ) : (
            <>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatCurrency(stats.totalInvestmentKRW, 'KRW')}
              </div>
              {stats.totalInvestmentUSD > 0 && (
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                  <span>+ {formatCurrency(stats.totalInvestmentUSD, 'USD')}</span>
                  <span className="text-[11px] text-slate-400 font-normal">(해외주식)</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500">총 기록 건수:</span>
          <span className="font-semibold text-slate-300">{stats.totalRecordsCount}회 매수</span>
        </div>
      </div>

      {/* 카드 2: 보유 종목 수 */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            보유 종목 수
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
            <span>{stats.totalHoldingsCount}</span>
            <span className="text-base font-normal text-slate-400">개 종목</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs">
          {stats.totalHoldingsCount >= 5 ? (
            <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
              안정적 분산 투자 중
            </span>
          ) : stats.totalHoldingsCount > 0 ? (
            <span className="text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-800/40">
              집중 투자 (분산 권장)
            </span>
          ) : (
            <span className="text-slate-500">종목을 등록해주세요</span>
          )}
        </div>
      </div>

      {/* 카드 3: 최대 투자 섹터 (1위) */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            최대 투자 섹터
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <PieChart className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
            {stats.topCategory ? stats.topCategory.name : '-'}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">섹터 집중도:</span>
          {stats.topCategory ? (
            <span className={`font-bold px-2 py-0.5 rounded-md ${
              stats.topCategory.percentage > 40
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                : 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
            }`}>
              {formatPercentage(stats.topCategory.percentage)}
            </span>
          ) : (
            <span className="text-slate-500">0%</span>
          )}
        </div>
      </div>

      {/* 카드 4: 최대 보유 종목 (1위) */}
      <div className="glass-card glass-card-hover p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            최대 보유 종목
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
            {stats.topStock ? stats.topStock.name : '-'}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">포트폴리오 비중:</span>
          {stats.topStock ? (
            <span className="font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/50 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {formatPercentage(stats.topStock.percentage)}
            </span>
          ) : (
            <span className="text-slate-500">0%</span>
          )}
        </div>
      </div>

    </div>
  );
};
