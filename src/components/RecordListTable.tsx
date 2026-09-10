/**
 * [개별 매수 내역 리스트(원장) 컴포넌트]
 * 날짜별 매수 기록의 상세 조회, 수정, 삭제를 지원하며
 * 검색, 섹터 필터, 날짜순 정렬 및 명확한 관리(수정/삭제) 액션을 제공합니다.
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  Filter, 
  History,
  Plus,
  AlertCircle
} from 'lucide-react';
import { StockRecord, Currency } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

interface RecordListTableProps {
  records: StockRecord[];
  onEditRecord: (record: StockRecord) => void;
  onDeleteRecord: (id: string) => void;
  onOpenRecordModal: () => void;
  selectedCurrency: Currency | 'ALL';
}

export const RecordListTable: React.FC<RecordListTableProps> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onOpenRecordModal,
  selectedCurrency,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 고유 카테고리 목록 추출
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    records.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    return Array.from(cats);
  }, [records]);

  // 필터링 및 최신 매수일 기준 정렬
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        // 통화 필터
        if (selectedCurrency !== 'ALL' && r.currency !== selectedCurrency) {
          return false;
        }
        // 섹터 필터
        if (selectedCategoryFilter !== 'ALL' && r.category !== selectedCategoryFilter) {
          return false;
        }
        // 검색어 필터
        const query = searchTerm.toLowerCase();
        return (
          r.stockName.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query) ||
          (r.notes && r.notes.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate) || b.createdAt - a.createdAt);
  }, [records, selectedCurrency, selectedCategoryFilter, searchTerm]);

  // 삭제 확정 처리
  const handleConfirmDelete = (id: string) => {
    onDeleteRecord(id);
    setDeletingId(null);
  };

  return (
    <div className="glass-card overflow-hidden w-full">
      {/* 헤더 및 컨트롤 바 */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                매수 기록 원장
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                총 {filteredRecords.length}건
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              과거 매수 일자와 수량, 매수 사유를 관리하고 수정·삭제할 수 있습니다
            </p>
          </div>
        </div>

        {/* 필터 & 검색 영역 */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* 섹터 드롭다운 필터 */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="glass-input py-1.5 pl-8 pr-8 text-xs appearance-none bg-slate-950 text-slate-300 cursor-pointer"
            >
              <option value="ALL">모든 섹터</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 검색창 */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="종목, 섹터, 메모 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-8 pr-3 py-1.5 text-xs"
            />
          </div>

          {/* 추가 버튼 */}
          <button
            onClick={onOpenRecordModal}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>기록 추가</span>
          </button>
        </div>
      </div>

      {/* 매수 기록 테이블 */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <History className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-50" />
          <p className="text-sm font-medium text-slate-300 mb-1">
            해당 조건의 매수 내역이 없습니다.
          </p>
          <p className="text-xs text-slate-500">
            새로운 주식 매수 내역을 추가하여 포트폴리오를 관리해보세요.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6 w-32">매수 일자</th>
                <th className="py-3 px-4">종목명</th>
                <th className="py-3 px-4">투자 분야</th>
                <th className="py-3 px-4 text-right">매수가</th>
                <th className="py-3 px-4 text-right">수량</th>
                <th className="py-3 px-4 text-right">총 매수금액</th>
                <th className="py-3 px-4 min-w-[140px]">매수 사유 / 메모</th>
                <th className="py-3 px-4 text-center w-36 bg-slate-900/50 sticky right-0">관리 (수정/삭제)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* 일자 */}
                  <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-300 whitespace-nowrap font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDate(record.purchaseDate)}</span>
                    </div>
                  </td>

                  {/* 종목명 */}
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    <span className="text-sm group-hover:text-brand-300 transition-colors">
                      {record.stockName}
                    </span>
                  </td>

                  {/* 섹터 */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700/60 font-medium">
                      {record.category}
                    </span>
                  </td>

                  {/* 매수가 */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-300 whitespace-nowrap">
                    {formatCurrency(record.price, record.currency)}
                  </td>

                  {/* 수량 */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-200 whitespace-nowrap">
                    {formatNumber(record.quantity)}주
                  </td>

                  {/* 총 매수금액 */}
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                    {formatCurrency(record.totalAmount, record.currency)}
                  </td>

                  {/* 메모 */}
                  <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs">
                    {record.notes ? (
                      <div className="flex items-center gap-1.5" title={record.notes}>
                        <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{record.notes}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* 수정 및 삭제 액션 (우측 고정 배경으로 선명하게 표시) */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap bg-slate-900/60 sticky right-0">
                    {deletingId === record.id ? (
                      <div className="flex items-center justify-center gap-1.5 animate-fade-in">
                        <button
                          onClick={() => handleConfirmDelete(record.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                        >
                          삭제 확정
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {/* 수정 버튼 */}
                        <button
                          onClick={() => onEditRecord(record)}
                          title="매수 내역 수정"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/50 text-xs font-medium flex items-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-400" />
                          <span>수정</span>
                        </button>

                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => setDeletingId(record.id)}
                          title="매수 내역 삭제"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/80 text-xs font-medium flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>삭제</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 하단 알림 안내 */}
      <div className="p-3.5 bg-slate-950/70 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>매수 기록을 수정하거나 삭제하면 상단 포트폴리오 표와 통계가 실시간으로 자동 재계산됩니다.</span>
        </div>
      </div>
    </div>
  );
};
