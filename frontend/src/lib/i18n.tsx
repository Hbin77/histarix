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
  timeline: { ko: "타임라인", en: "Timeline", zh: "时间线", ja: "タイムライン" },
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
  ancient: { ko: "고대", en: "Ancient", zh: "古代", ja: "古代" },
  classical: { ko: "고전기", en: "Classical", zh: "古典时期", ja: "古典期" },
  medieval: { ko: "중세", en: "Medieval", zh: "中世纪", ja: "中世" },
  earlyModern: { ko: "근세", en: "Early Modern", zh: "近世", ja: "近世" },
  modern: { ko: "근대", en: "Modern", zh: "近代", ja: "近代" },
  contemporary: { ko: "현대", en: "Contemporary", zh: "现代", ja: "現代" },
  other: { ko: "기타", en: "Other", zh: "其他", ja: "その他" },
  noHistory: { ko: "이 국가의 역사 데이터가 아직 없습니다.", en: "No history data available yet.", zh: "暂无该国历史数据。", ja: "この国の歴史データはまだありません。" },
  noTimeline: { ko: "타임라인 데이터가 없습니다.", en: "No timeline data.", zh: "无时间线数据。", ja: "タイムラインデータがありません。" },
  totalEvents: { ko: "개의 역사적 사건", en: "historical events", zh: "个历史事件", ja: "件の歴史的事件" },
  signup: { ko: "회원가입", en: "Sign Up", zh: "注册", ja: "新規登録" },
  noInfo: { ko: "국가 정보를 불러올 수 없습니다.", en: "Unable to load country info.", zh: "无法加载国家信息。", ja: "国情報を読み込めません。" },
  aiChat: { ko: "AI 역사 가이드", en: "AI History Guide", zh: "AI历史向导", ja: "AI歴史ガイド" },
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
