"use client";

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

const earnedBadges = [
  { icon: "🌍", label: "세계 탐험가" },
  { icon: "⚔️", label: "전쟁사 마스터" },
  { icon: "📜", label: "고대 문명" },
];

const lockedBadges = [
  { icon: "🏛️", label: "유럽 전문가" },
  { icon: "🐉", label: "아시아 전문가" },
  { icon: "🎭", label: "문화유산 수집가" },
];

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
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#0b1323] pt-20 px-6 flex flex-col z-40">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#161f33] ring-2 ring-[#85adff] flex items-center justify-center text-3xl text-[#a4abbf]">
            👤
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
      <main className="ml-[280px] pt-20 p-8 flex-1 min-h-screen">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-6">
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
        <div className="grid grid-cols-2 gap-6 mt-6">
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
          <div className="flex gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 w-24"
              >
                <div className="w-16 h-16 rounded-full bg-[#161f33] ring-1 ring-[#85adff]/30 shadow-[0_0_12px_rgba(133,173,255,0.15)] flex items-center justify-center text-2xl">
                  {badge.icon}
                </div>
                <span className="text-xs text-[#dfe5fa] text-center">
                  {badge.label}
                </span>
              </div>
            ))}
            {lockedBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 w-24 opacity-40"
              >
                <div className="w-16 h-16 rounded-full bg-[#161f33] flex items-center justify-center text-2xl">
                  {badge.icon}
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
