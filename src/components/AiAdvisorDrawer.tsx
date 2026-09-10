/**
 * [AI 포트폴리오 상담 챗봇 서랍(Drawer) 컴포넌트]
 * 토스/핀테크 감성의 깔끔하고 세련된 화이트 챗봇 인터페이스입니다.
 * Google Gemini(gemini-3-flash-preview)를 통해 실시간 포트폴리오 데이터를 바탕으로
 * 심층 진단 및 균형 있는 분산 투자 조언을 제공하는 대화형 어드바이저입니다.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RotateCcw, 
  ShieldAlert, 
  Compass, 
  AlertTriangle 
} from 'lucide-react';
import { ChatMessage, StockRecord, StockSummary, CategorySummary, PortfolioStats, GeminiConfig } from '../types';
import { askGeminiAdvisor, generatePortfolioContextString } from '../services/geminiService';

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: GeminiConfig;
  onOpenApiKeyModal: () => void;
  records: StockRecord[];
  stockSummaries: StockSummary[];
  categorySummaries: CategorySummary[];
  stats: PortfolioStats;
  initialQuestion?: string;
}

// 원클릭 추천 질문 프리셋 4종
const QUICK_QUESTIONS = [
  {
    icon: '🚀',
    title: '포트폴리오 종합 진단',
    prompt: '현재 내 전체 포트폴리오의 구성과 안정성, 성장성을 종합적으로 진단하고 총평을 작성해줘.',
  },
  {
    icon: '⚖️',
    title: '섹터 쏠림 & 리스크 점검',
    prompt: '특정 산업이나 섹터에 자산이 과도하게 편중되어 있는지 리스크 요인을 집중 점검해줘.',
  },
  {
    icon: '💡',
    title: '분산 투자 & 리밸런싱 조언',
    prompt: '포트폴리오의 변동성을 낮추기 위해 향후 어떤 섹터나 자산군을 보강하면 좋을지 구체적으로 조언해줘.',
  },
  {
    icon: '📊',
    title: '최대 비중 종목 위험 분석',
    prompt: '현재 가장 큰 투자 비중을 차지하고 있는 1위 종목의 집중 위험과 대응 전략을 알려줘.',
  },
];

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onOpenApiKeyModal,
  records,
  stockSummaries,
  categorySummaries,
  stats,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        content: `안녕하세요! 📈 **AI 포트폴리오 수석 분석가**입니다.\n\n등록하신 매수 내역과 섹터별 비중 데이터를 바탕으로 객관적인 위험 점검과 분산 투자 조언을 제공해 드립니다.\n\n아래의 **추천 질문**을 누르시거나 궁금한 점을 자유롭게 입력해보세요!`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 오면 하단 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // 특정 종목이나 외부 질문으로 열렸을 때 자동 입력
  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  // 메시지 전송 핸들러 (Send Message Handler)
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    if (!config.apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: query,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: '⚠️ **Gemini API Key가 필요합니다.**\n\nAI 분석을 이용하시려면 상단이나 아래 버튼을 통해 Google Gemini API Key를 먼저 등록해주세요.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
      setInputMessage('');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 최신 포트폴리오 컨텍스트 생성
      const portfolioContext = generatePortfolioContextString(
        records,
        stockSummaries,
        categorySummaries,
        stats
      );

      // 이전 대화 히스토리 (에러 메시지 제외)
      const chatHistory = messages
        .filter((m) => !m.isError && m.id !== 'welcome-msg')
        .map((m) => ({
          role: m.role as 'user' | 'model',
          content: m.content,
        }));

      const aiResponse = await askGeminiAdvisor({
        apiKey: config.apiKey,
        modelName: config.modelName,
        userMessage: query,
        portfolioContext,
        chatHistory,
      });

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      const error = err as Error;
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `❌ **오류가 발생했습니다:**\n${error.message || '요청 처리 중 문제가 발생했습니다.'}`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 대화 내용 초기화
  const handleResetChat = () => {
    if (confirm('대화 기록을 초기화하시겠습니까?')) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'model',
          content: `대화 내용이 초기화되었습니다. 📈\n\n새로운 포트폴리오 진단이나 궁금한 점을 질문해주세요!`,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // 마크다운 렌더링 헬퍼
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          // 인용구/주의사항 (> )
          if (line.startsWith('>')) {
            return (
              <div key={idx} className="my-2 p-2.5 rounded-lg bg-amber-50 border-l-4 border-amber-400 text-amber-900 text-xs font-medium">
                {line.replace(/^>\s*/, '')}
              </div>
            );
          }

          // 소제목 (### )
          if (line.startsWith('###')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-sm sm:text-base mt-3 mb-1 flex items-center gap-1.5">
                {line.replace(/^###\s*/, '')}
              </h4>
            );
          }

          // 대제목 (## )
          if (line.startsWith('##')) {
            return (
              <h3 key={idx} className="font-black text-brand-600 text-base sm:text-lg mt-4 mb-2 pb-1 border-b border-slate-200">
                {line.replace(/^##\s*/, '')}
              </h3>
            );
          }

          // 불릿 포인트 (- 또는 * )
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const cleanLine = line.trim().replace(/^[-*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-brand-500 font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cleanLine) }} />
              </div>
            );
          }

          // 번호 매기기 (1. 2. 등)
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="pl-2 font-medium text-slate-800" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
            );
          }

          // 빈 줄
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // 일반 텍스트
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  // 인라인 볼드(**), 코드(`) 변환
  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200 text-brand-700 font-mono text-[11px]">$1</code>');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-fade-in flex justify-end">
      
      {/* 서랍 패널 컨테이너 (Drawer Container) */}
      <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
        
        {/* 상단 서랍 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white/95 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  AI 포트폴리오 상담
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-brand-50 text-brand-600 border border-brand-200">
                  {config.modelName || 'gemini-3-flash-preview'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                실시간 포트폴리오 기반 지능형 리스크 & 분산 진단
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              title="대화 내용 초기화"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key 미설정 시 경고 배너 */}
        {!config.apiKey && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Gemini API Key가 등록되지 않았습니다.</span>
            </div>
            <button
              onClick={onOpenApiKeyModal}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all whitespace-nowrap shadow-sm"
            >
              키 등록하기
            </button>
          </div>
        )}

        {/* 대화 내용 스크롤 영역 */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#f8fafc]">
          
          {/* 메시지 리스트 */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* 아바타 */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : msg.isError
                    ? 'bg-rose-100 border border-rose-200 text-rose-600'
                    : 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* 말풍선 (Chat Bubble) */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap font-medium">
                    {msg.content}
                  </p>
                ) : (
                  renderFormattedContent(msg.content)
                )}

                <div
                  className={`mt-2 text-[10px] ${
                    msg.role === 'user' ? 'text-brand-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* AI 응답 생성 중 로딩 애니메이션 */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 text-slate-600 text-xs shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                <span>포트폴리오 비중과 리스크를 심층 분석하고 있습니다...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 추천 빠른 질문 프리셋 영역 (Quick Questions) */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white">
          <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-brand-500" />
            <span>원클릭 빠른 진단 질문</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.prompt)}
                disabled={isLoading}
                className="p-2 text-left rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand-600 transition-all text-[11px] disabled:opacity-50 flex items-center gap-1.5 truncate shadow-xs"
              >
                <span>{q.icon}</span>
                <span className="truncate font-semibold">{q.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 하단 입력창 및 면책 조항 */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={config.apiKey ? "포트폴리오에 대해 무엇이든 물어보세요..." : "먼저 API 키를 설정해주세요..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="glass-input flex-1 text-xs sm:text-sm py-3"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-500/25 transition-all active:scale-95 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          <p className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-400" />
            <span>AI 진단은 참고용이며 법적 투자 자문이 아닙니다.</span>
          </p>
        </div>

      </div>
    </div>
  );
};
