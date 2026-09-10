# 📈 주식 가계부 & AI 포트폴리오 진단 (Stock Diary & AI Advisor)

> **스마트한 주식 매수 기록 관리 및 Google Gemini 3.0 기반 포트폴리오 리스크 진단 웹 서비스**

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.0_Flash-4285f4?logo=google&logoColor=white)

---

## ✨ 주요 기능 (Key Features)

1. **📊 포트폴리오 종합 요약 대시보드**
   - 종목별 가중평균 매수가(평단가), 총 보유 수량, 총 투자금액 자동 계산
   - 전체 자산 대비 종목별 보유 비중(%) 시각화 프로그레스 바 제공
   - 원화(₩) 및 해외주식 달러($) 통화 통합/개별 필터링 지원

2. **🏷️ 투자 섹터(분야)별 비중 분석**
   - 반도체, 2차전지, 빅테크/IT, 바이오, 배당주 등 섹터별 비중 스택 차트
   - 40% 이상 편중 시 '특정 섹터 편중 주의' 리스크 알림 배지 제공

3. **📝 주식 매수 기록 원장 관리**
   - 일자별 매수 기록(종목, 섹터, 단가, 수량, 메모) 등록 및 실시간 수정/삭제
   - 수정/삭제 시 상단 포트폴리오 통계 및 비중 실시간 자동 재계산

4. **🤖 Google Gemini AI 포트폴리오 진단 & 대화형 상담**
   - 사용자 본인의 무료 Gemini API Key를 등록하여 안전하게 연동 (로컬 브라우저 암호화 보관)
   - 원클릭 빠른 진단: 종합 포트폴리오 진단, 섹터 쏠림 리스크 점검, 분산 투자 & 리밸런싱 조언, 최대 비중 종목 위험 분석
   - 대화형 챗봇을 통한 실시간 주식 투자 고민 상담

5. **🎨 핀테크 / 토스 스타일 프리미엄 라이트 테마**
   - 눈이 편안한 쿨 그레이 배경과 순백색 카드 디자인
   - 토스 시그니처 블루 포인트 컬러를 적용한 직관적이고 세련된 UI/UX

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (핀테크 라이트 테마)
- **Icons & Effects**: Lucide React, Canvas Confetti
- **AI Integration**: Google Gemini API (`gemini-3-flash-preview` / `gemini-2.5-flash`)
- **Storage**: Browser LocalStorage (서버 없는 100% 안전한 로컬 보관)

---

## 🚀 시작하기 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
```

---

## 🔒 개인정보 및 보안 정책
- 입력하신 모든 주식 매수 내역 및 Gemini API Key는 외부 서버로 전송되지 않으며, 사용자 본인의 브라우저 `LocalStorage`에만 안전하게 저장됩니다.
