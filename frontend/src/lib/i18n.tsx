"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "ko" | "en" | "zh" | "ja";

interface I18nContext {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LABELS: Record<string, Record<Lang, string>> = {
  info: { ko: "정보", en: "Info", zh: "信息", ja: "情報" },
  history: { ko: "역사", en: "History", zh: "历史", ja: "歴史" },
  search: { ko: "국가 검색...", en: "Search countries...", zh: "搜索国家...", ja: "国を検索..." },
  login: { ko: "로그인", en: "Login", zh: "登录", ja: "ログイン" },
  logout: { ko: "로그아웃", en: "Logout", zh: "退出", ja: "ログアウト" },
  backToMap: { ko: "세계 지도로 돌아가기", en: "Back to world map", zh: "返回世界地图", ja: "世界地図に戻る" },
  onThisDay: { ko: "오늘의 역사", en: "On This Day", zh: "历史上的今天", ja: "今日の歴史" },
  capital: { ko: "수도", en: "Capital", zh: "首都", ja: "首都" },
  population: { ko: "인구", en: "Population", zh: "人口", ja: "人口" },
  area: { ko: "면적", en: "Area", zh: "面积", ja: "面積" },
  region: { ko: "지역", en: "Region", zh: "地区", ja: "地域" },
  subregion: { ko: "소지역", en: "Subregion", zh: "分区", ja: "小地域" },
  languages: { ko: "언어", en: "Languages", zh: "语言", ja: "言語" },
  currency: { ko: "통화", en: "Currency", zh: "货币", ja: "通貨" },
  chronicle: { ko: "연대기", en: "Chronicle", zh: "编年史", ja: "年代記" },
  noHistory: { ko: "이 국가의 역사 데이터가 아직 없습니다.", en: "No history data available yet.", zh: "暂无该国历史数据。", ja: "この国の歴史データはまだありません。" },
  play: { ko: "재생", en: "Play", zh: "播放", ja: "再生" },
  pause: { ko: "일시정지", en: "Pause", zh: "暂停", ja: "一時停止" },
  timeSlider: { ko: "연도 선택", en: "Year", zh: "选择年份", ja: "年を選択" },
  bordersSource: { ko: "국경 데이터(간략화):", en: "Borders (simplified):", zh: "疆域数据（简化）：", ja: "国境データ（簡略化）：" },
  thisLandIn: { ko: "이 땅의 그 시절", en: "This land at the time", zh: "这片土地当时", ja: "この地のその頃" },
  eventsThisYear: { ko: "이 해의 사건", en: "This year", zh: "这一年", ja: "この年の出来事" },
  noEventsThisYear: { ko: "이 해에 기록된 사건은 없어요. 가까운 사건을 확인해 보세요.", en: "No recorded event this year — see the nearest ones.", zh: "这一年没有记录的事件，请看相近的事件。", ja: "この年に記録された出来事はありません。近い出来事をご覧ください。" },
  earlierEvents: { ko: "이전 사건", en: "Before", zh: "此前", ja: "それ以前" },
  laterEvents: { ko: "이후 사건", en: "After", zh: "此后", ja: "それ以後" },
  prevEvent: { ko: "이전 사건으로", en: "Previous event", zh: "上一个事件", ja: "前の出来事へ" },
  nextEvent: { ko: "다음 사건으로", en: "Next event", zh: "下一个事件", ja: "次の出来事へ" },
  goToYear: { ko: "이 해로 이동", en: "Go to this year", zh: "跳到这一年", ja: "この年へ移動" },
  currentEra: { ko: "지금 보는 시대", en: "Current era", zh: "当前时代", ja: "表示中の時代" },
  kind_state: { ko: "국가", en: "State", zh: "国家", ja: "国家" },
  kind_culture: { ko: "문화", en: "Culture", zh: "文化", ja: "文化" },
  kind_colonial: { ko: "식민 통치", en: "Colonial rule", zh: "殖民统治", ja: "植民地支配" },
  kind_period: { ko: "시대", en: "Period", zh: "时期", ja: "時代" },
  cat_politics: { ko: "정치", en: "Politics", zh: "政治", ja: "政治" },
  cat_war: { ko: "전쟁", en: "War", zh: "战争", ja: "戦争" },
  cat_culture: { ko: "문화", en: "Culture", zh: "文化", ja: "文化" },
  cat_religion: { ko: "종교", en: "Religion", zh: "宗教", ja: "宗教" },
  cat_science: { ko: "과학", en: "Science", zh: "科学", ja: "科学" },
  cat_economy: { ko: "경제", en: "Economy", zh: "经济", ja: "経済" },
  cat_society: { ko: "사회", en: "Society", zh: "社会", ja: "社会" },
  cat_disaster: { ko: "재난", en: "Disaster", zh: "灾害", ja: "災害" },
  signup: { ko: "회원가입", en: "Sign Up", zh: "注册", ja: "新規登録" },
  noInfo: { ko: "국가 정보를 불러올 수 없습니다.", en: "Unable to load country info.", zh: "无法加载国家信息。", ja: "国情報を読み込めません。" },
  aiChat: { ko: "AI 역사 가이드", en: "AI History Guide", zh: "AI历史向导", ja: "AI歴史ガイド" },
  loadingData: { ko: "데이터를 불러오는 중...", en: "Loading data...", zh: "正在加载数据...", ja: "データ読み込み中..." },
  loadError: { ko: "데이터를 불러올 수 없습니다.", en: "Failed to load data.", zh: "无法加载数据。", ja: "データを読み込めません。" },
  retry: { ko: "다시 시도", en: "Retry", zh: "重试", ja: "再試行" },
  readMore: { ko: "더 보기", en: "Read more", zh: "阅读更多", ja: "もっと見る" },
  searchHint: { ko: "국가 이름을 입력하세요 — 한국어도 검색됩니다", en: "Type a country name to explore", zh: "输入国家名称开始探索", ja: "国名を入力して探索" },
  recent: { ko: "최근 본 국가", en: "Recent", zh: "最近查看", ja: "最近見た国" },
  introTagline: { ko: "세계의 역사를 지구본 위에서", en: "World history on a living globe", zh: "在地球仪上探索世界历史", ja: "地球儀の上で巡る世界史" },
};

const I18nCtx = createContext<I18nContext>({
  lang: "ko",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("histarix_lang") as Lang | null;
    if (saved && ["ko", "en", "zh", "ja"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("histarix_lang", l);
  };

  const t = (key: string) => LABELS[key]?.[lang] ?? key;

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}
