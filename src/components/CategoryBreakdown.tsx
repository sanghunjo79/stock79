/**
 * [섹터/분야별 비중 분석 컴포넌트]
 * 프리미엄 핀테크 다크 테마 섹터 분석입니다.
 * 투자 분야(반도체, 2차전지, 빅테크 등)별 총 투자금액과 포트폴리오 내 비중을
 * 시각적인 바 차트 및 정돈된 테이블 형태로 보여줍니다.
 */

import React from 'react';
import { PieChart, ShieldAlert, CheckCircle } from 'lucide-react';
import { CategorySummary } from '../types';
import { formatNumber, formatPercentage } from '../utils/formatters';

interface CategoryBreakdownProps {
  categories: CategorySummary[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ categories }) => {
  // 섹터별 대표 색상 팔레트
  const getSectorColor = (index: number) => {
    const colors = [
      'bg-indigo-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-blue-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-slate-500',
    ];
    return colors[index % colors.length];
  };

  const hasHighConcentration = categories.some((c) => c.allocationPercentage > 40);

  return (
    <div className="glass-card p-5 sm:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              투자 섹터(분야)별 비중 배분
            </h3>
            <p className="text-xs text-slate-400">
              특정 산업 쏠림 현상을 방지하고 균형 있는 분산 투자를 점검하세요
            </p>
          </div>
        </div>

        {/* 쏠림 상태 경고 배지 */}
        {categories.length > 0 && (
          <div>
            {hasHighConcentration ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>특정 섹터 편중 주의</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>안정적 섹터 분산</span>
              </span>
            )}
          </div>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500">
          표시할 섹터 데이터가 없습니다.
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* 종합 스택 바 차트 */}
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800/80">
            {categories.map((cat, idx) => (
              <div
                key={cat.category}
                style={{ width: `${cat.allocationPercentage}%` }}
                className={`h-full ${getSectorColor(idx)} transition-all duration-500`}
                title={`${cat.category}: ${formatPercentage(cat.allocationPercentage)}`}
              />
            ))}
          </div>

          {/* 섹터별 상세 리스트 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {categories.map((cat, idx) => {
              const colorClass = getSectorColor(idx);
              const isOverweighted = cat.allocationPercentage > 40;

              return (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-md ${colorClass}`}></div>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {cat.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({cat.stockCount}개 종목)
                      </span>
                    </div>
                    <span className={`text-xs font-black ${isOverweighted ? 'text-rose-400' : 'text-slate-200'}`}>
                      {formatPercentage(cat.allocationPercentage)}
                    </span>
                  </div>

                  {/* 개별 프로그레스 바 */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${Math.min(100, Math.max(1, cat.allocationPercentage))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>투자금액</span>
                    <span className="font-semibold text-slate-300">
                      {formatNumber(cat.totalInvested)}원 / USD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
