/**
 * [Gemini API Key 관리 모달 컴포넌트]
 * 사용자가 Google AI Studio에서 발급받은 Gemini API 키를 안전하게 입력, 테스트, 저장 및 삭제할 수 있는 모달입니다.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { GeminiConfig } from '../types';
import { AVAILABLE_GEMINI_MODELS, testGeminiApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GeminiConfig;
  onSaveConfig: (config: GeminiConfig) => void;
  onClearApiKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onClearApiKey,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(config.apiKey || '');
      setModelName(config.modelName || 'gemini-3-flash-preview');
      setTestResult(null);
      setShowKey(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // 연결 테스트 수행
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: '테스트할 API 키를 먼저 입력해주세요.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testGeminiApiKey(apiKey, modelName);
    setTestResult(result);
    setIsTesting(false);
  };

  // 저장 수행
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      apiKey: apiKey.trim(),
      modelName,
    });
    onClose();
  };

  // 키 삭제 핸들러
  const handleDelete = () => {
    if (confirm('저장된 Gemini API 키를 삭제하시겠습니까?')) {
      onClearApiKey();
      setApiKey('');
      setTestResult({ success: true, message: 'API 키가 안전하게 삭제되었습니다.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-lg border-slate-700/80 shadow-2xl p-6 sm:p-8">
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Google Gemini API 설정
              </h3>
              <p className="text-xs text-slate-400">
                AI 포트폴리오 진단 및 상담을 위한 API 키를 설정합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 보안 안내 뱃지 */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">안전한 로컬 보관:</span> 입력하신 API 키는 어떤 외부 서버로도 전송되지 않으며, 사용자 본인의 브라우저 LocalStorage에만 암호화 저장됩니다.
          </div>
        </div>

        {/* 폼 입력 영역 */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          
          {/* API Key 입력 필드 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Gemini API Key <span className="text-rose-400">*</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline"
              >
                <span>Google AI Studio에서 무료 발급받기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="glass-input w-full pr-10 text-xs sm:text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* AI 모델 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              사용할 Gemini 모델
            </label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="glass-input w-full text-xs cursor-pointer bg-slate-950 text-slate-200"
            >
              {AVAILABLE_GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.recommended ? '⭐ (기본 권장)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 연결 테스트 버튼 & 결과 */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  <span>API 연결 상태 확인 중...</span>
                </>
              ) : (
                <span>API 연결 상태 테스트</span>
              )}
            </button>

            {/* 테스트 결과 메시지 */}
            {testResult && (
              <div
                className={`mt-2.5 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  testResult.success
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* 하단 액션 버튼 */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            {config.apiKey ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:border-rose-900 border border-transparent transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>키 삭제</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
              >
                설정 저장
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
