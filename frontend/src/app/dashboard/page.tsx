"use client";

import React from "react";

const navItems = [
  { label: "대시보드", active: true },
  { label: "탐험 기록", active: false },
  { label: "업적", active: false },
  { label: "퀴즈 기록", active: false },
  { label: "설정", active: false },
];

const stats = [
  { label: "탐험한 국가", value: "23개국", badge: "+3 이번 주" },
  { label: "학습 시간", value: "47시간", badge: null },
  { label: "퀴즈 점수", value: "평균 82%", badge: null },
  { label: "연속 출석", value: "12일", streak: true },
];

const recentExplorations = [
  { flag: "🇫🇷", country: "프랑스", time: "2시간 전" },
  { flag: "🇯🇵", country: "일본", time: "어제" },
  { flag: "🇪🇬", country: "이집트", time: "3일 전" },
  { flag: "🇬🇷", country: "그리스", time: "5일 전" },
  { flag: "🇰🇷", country: "대한민국", time: "1주 전" },
];

const EARNED_BADGES = [
  { id: "explorer", label: "세계 탐험가" },
  { id: "war", label: "전쟁사 마스터" },
  { id: "ancient", label: "고대 문명" },
];

const LOCKED_BADGES = [
  { id: "europe", label: "유럽 전문가" },
  { id: "asia", label: "아시아 전문가" },
  { id: "culture", label: "문화유산 수집가" },
];

function BadgeIcon({ id, className }: { id: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    explorer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    war: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>,
    ancient: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
    europe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M7 12h10"/><path d="M12 7v10"/></svg>,
    asia: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    culture: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 20h20"/><path d="M5 20V8l7-4 7 4v12"/><rect x="9" y="12" width="6" height="8"/></svg>,
  };
  return <>{icons[id] || null}</>;
}

function getHeatmapColor(col: number, row: number): string {
  const v = (col * 7 + row * 3 + col * row) % 10;
  if (v < 3) return "#070e1d";
  if (v < 5) return "#1b263b";
  if (v < 7) return "#3b6bcc";
  return "#85adff";
}

export default function DashboardPage() {
  return (
    <div className="flex">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 pt-16 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#161f33] flex items-center justify-center ring-2 ring-[#85adff]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#dfe5fa]">탐험가</p>
            <p className="text-[10px] text-[#85adff]">Lv.7 역사학자</p>
          </div>
        </div>
      </div>

      {/* Left Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] bg-[#0b1323] pt-20 px-6 flex-col z-40">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#161f33] ring-2 ring-[#85adff] flex items-center justify-center text-3xl text-[#a4abbf]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          </div>
          <span className="text-xl font-bold text-[#dfe5fa] font-[family-name:'Space_Grotesk']">
            탐험가
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[#5391ff] to-[#85adff] text-[#dfe5fa]">
            Lv.7 역사학자
          </span>
          <div className="w-full mt-1">
            <div className="w-full h-2 bg-[#161f33] rounded-full overflow-hidden">
              <div className="w-[60%] h-full bg-gradient-to-r from-[#5391ff] to-[#85adff] rounded-full" />
            </div>
            <p className="text-xs text-[#a4abbf] text-center mt-1.5">
              2,450 / 4,000 XP
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`text-left py-3 px-4 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-[#161f33] text-[#85adff] border-l-2 border-[#85adff] font-semibold"
                  : "text-[#a4abbf] hover:bg-[#161f33]/50 hover:text-[#dfe5fa]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-4 lg:pt-20 p-4 md:p-8 flex-1 min-h-screen">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#161f33] rounded-xl p-6 hover:bg-[#1b263b] transition-colors cursor-default"
            >
              <p className="text-sm text-[#a4abbf] mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-[#dfe5fa] font-[family-name:'Space_Grotesk']">
                {stat.value}
              </p>
              {stat.badge && (
                <span className="inline-block mt-2 text-xs text-[#85adff] bg-[#85adff]/10 px-2 py-0.5 rounded-full">
                  {stat.badge}
                </span>
              )}
              {stat.streak && (
                <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#85adff]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#85adff] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#85adff]" />
                  </span>
                  진행 중
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Middle: Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
          {/* Recent Explorations */}
          <div className="bg-[#11192b] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#dfe5fa] mb-4 font-[family-name:'Space_Grotesk']">
              최근 탐험 기록
            </h2>
            <div className="flex flex-col">
              {recentExplorations.map((item, i) => (
                <div
                  key={item.country}
                  className={`flex items-center gap-3 py-3 px-3 rounded-lg ${
                    i % 2 === 0 ? "bg-[#161f33]/40" : ""
                  }`}
                >
                  <span className="text-2xl">{item.flag}</span>
                  <span className="text-sm text-[#dfe5fa] font-medium flex-1">
                    {item.country}
                  </span>
                  <span className="text-xs text-[#a4abbf]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-[#11192b] rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#dfe5fa] font-[family-name:'Space_Grotesk']">
                학습 활동
              </h2>
              <p className="text-sm text-[#a4abbf] mt-0.5">
                이번 주 5일 활동
              </p>
            </div>
            <div className="flex gap-[3px]">
              {Array.from({ length: 12 }, (_, col) => (
                <div key={col} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }, (_, row) => (
                    <div
                      key={row}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: getHeatmapColor(col, row) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-[#11192b] rounded-xl p-6 mt-6">
          <h2 className="text-lg font-bold text-[#dfe5fa] mb-4 font-[family-name:'Space_Grotesk']">
            수집한 배지
          </h2>
          <div className="flex flex-wrap gap-4">
            {EARNED_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 w-24"
              >
                <div className="w-16 h-16 rounded-full bg-[#161f33] ring-1 ring-[#85adff]/30 shadow-[0_0_12px_rgba(133,173,255,0.15)] flex items-center justify-center">
                  <BadgeIcon id={badge.id} className="w-8 h-8" />
                </div>
                <span className="text-xs text-[#dfe5fa] text-center">
                  {badge.label}
                </span>
              </div>
            ))}
            {LOCKED_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 w-24 opacity-40"
              >
                <div className="w-16 h-16 rounded-full bg-[#161f33] flex items-center justify-center">
                  <BadgeIcon id={badge.id} className="w-8 h-8" />
                </div>
                <span className="text-xs text-[#a4abbf] text-center">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
