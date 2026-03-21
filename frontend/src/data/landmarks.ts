export interface CountryLandmark {
  svg: string;      // Inline SVG string (viewBox 0 0 64 64)
  name: string;
  tagline: string;
  era: string;
}

// SVG landmarks - clean architectural silhouettes in single color
const pyramidSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 8L4 56h56L32 8z" fill="#85adff" opacity="0.9"/><path d="M32 8L20 56h24L32 8z" fill="#6e9fff" opacity="0.7"/><circle cx="32" cy="24" r="3" fill="#070e1d"/></svg>`;

const towerSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 56V24l4-16 4 16v32" stroke="#85adff" stroke-width="2" fill="none"/><path d="M24 56V36h16v20" stroke="#85adff" stroke-width="1.5" fill="none"/><path d="M20 56V44h24v12" stroke="#85adff" stroke-width="1.5" fill="none"/><circle cx="32" cy="12" r="2" fill="#85adff"/></svg>`;

const templeSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 8l-20 12h40L32 8z" fill="#85adff" opacity="0.8"/><rect x="16" y="20" width="32" height="4" fill="#85adff" opacity="0.6"/><rect x="20" y="24" width="4" height="28" fill="#85adff" opacity="0.7"/><rect x="28" y="24" width="4" height="28" fill="#85adff" opacity="0.7"/><rect x="36" y="24" width="4" height="28" fill="#85adff" opacity="0.7"/><rect x="14" y="52" width="36" height="4" fill="#85adff" opacity="0.6"/></svg>`;

const castleSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="28" width="40" height="28" fill="#85adff" opacity="0.3"/><rect x="8" y="20" width="10" height="36" fill="#85adff" opacity="0.5"/><rect x="46" y="20" width="10" height="36" fill="#85adff" opacity="0.5"/><rect x="24" y="36" width="16" height="20" rx="8" fill="#85adff" opacity="0.4"/><rect x="10" y="14" width="3" height="6" fill="#85adff"/><rect x="15" y="14" width="3" height="6" fill="#85adff"/><rect x="46" y="14" width="3" height="6" fill="#85adff"/><rect x="51" y="14" width="3" height="6" fill="#85adff"/></svg>`;

const mosqueSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 12c-8 0-16 8-16 16v28h32V28c0-8-8-16-16-16z" fill="#85adff" opacity="0.3"/><ellipse cx="32" cy="28" rx="12" ry="14" fill="#85adff" opacity="0.4"/><rect x="50" y="16" width="3" height="40" fill="#85adff" opacity="0.6"/><circle cx="51.5" cy="14" r="2" fill="#85adff"/><circle cx="32" cy="20" r="2" fill="#85adff" opacity="0.8"/></svg>`;

const pagodaSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 52h20l-2-8H24l-2 8z" fill="#85adff" opacity="0.5"/><path d="M24 44h16l-2-8H26l-2 8z" fill="#85adff" opacity="0.5"/><path d="M26 36h12l-2-8H28l-2 8z" fill="#85adff" opacity="0.5"/><path d="M28 28h8l-2-8h-4l-2 8z" fill="#85adff" opacity="0.5"/><path d="M18 52l14-4 14 4" stroke="#85adff" stroke-width="1.5" fill="none"/><path d="M21 44l11-3 11 3" stroke="#85adff" stroke-width="1.5" fill="none"/><path d="M24 36l8-3 8 3" stroke="#85adff" stroke-width="1.5" fill="none"/><line x1="32" y1="8" x2="32" y2="20" stroke="#85adff" stroke-width="1.5"/></svg>`;

const toriiSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="16" width="4" height="40" fill="#85adff" opacity="0.7"/><rect x="46" y="16" width="4" height="40" fill="#85adff" opacity="0.7"/><rect x="8" y="14" width="48" height="5" rx="2" fill="#85adff" opacity="0.8"/><rect x="12" y="24" width="40" height="3" fill="#85adff" opacity="0.5"/><path d="M6 12c8-4 16-6 26-6s18 2 26 6" stroke="#85adff" stroke-width="2.5" fill="none"/></svg>`;

const wallSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 48c8-8 16-20 24-28s16-8 28 0" stroke="#85adff" stroke-width="3" fill="none"/><path d="M4 52c8-8 16-20 24-28s16-8 28 0" stroke="#85adff" stroke-width="1.5" fill="none" opacity="0.4"/><rect x="28" y="16" width="6" height="8" rx="1" fill="#85adff" opacity="0.6"/><rect x="44" y="24" width="6" height="8" rx="1" fill="#85adff" opacity="0.6"/></svg>`;

const colosseumSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="36" rx="24" ry="16" fill="#85adff" opacity="0.2"/><path d="M8 36c0-12 10.7-20 24-20s24 8 24 20" stroke="#85adff" stroke-width="2" fill="none"/><path d="M12 36V24" stroke="#85adff" stroke-width="1.5"/><path d="M20 36V20" stroke="#85adff" stroke-width="1.5"/><path d="M28 36V17" stroke="#85adff" stroke-width="1.5"/><path d="M36 36V17" stroke="#85adff" stroke-width="1.5"/><path d="M44 36V20" stroke="#85adff" stroke-width="1.5"/><path d="M52 36V24" stroke="#85adff" stroke-width="1.5"/><path d="M8 36h48" stroke="#85adff" stroke-width="1.5" opacity="0.6"/><ellipse cx="32" cy="36" rx="24" ry="8" stroke="#85adff" stroke-width="1" fill="none" opacity="0.4"/></svg>`;

const statueSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="24" y="44" width="16" height="12" fill="#85adff" opacity="0.4"/><rect x="28" y="20" width="8" height="24" fill="#85adff" opacity="0.5"/><circle cx="32" cy="16" r="5" fill="#85adff" opacity="0.6"/><path d="M28 28l-8-4v8" stroke="#85adff" stroke-width="2" fill="none"/><path d="M36 24l12-8" stroke="#85adff" stroke-width="2"/><rect x="44" y="12" width="8" height="6" fill="#85adff" opacity="0.4"/></svg>`;

const horseSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 48l4-16 8-8 8 4 8 8v12" stroke="#85adff" stroke-width="2" fill="none"/><circle cx="40" cy="24" r="6" stroke="#85adff" stroke-width="2" fill="#85adff" opacity="0.3"/><path d="M36 20l-4-8" stroke="#85adff" stroke-width="2"/><path d="M44 22l8-4" stroke="#85adff" stroke-width="2"/><path d="M28 24l-8 4 4 8" stroke="#85adff" stroke-width="1.5" fill="none" opacity="0.5"/></svg>`;

const gateSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="20" width="8" height="36" fill="#85adff" opacity="0.5"/><rect x="48" y="20" width="8" height="36" fill="#85adff" opacity="0.5"/><rect x="4" y="16" width="56" height="6" fill="#85adff" opacity="0.4"/><path d="M16 56V28c0-6 6.7-10 16-10s16 4 16 10v28" stroke="#85adff" stroke-width="2" fill="none"/><circle cx="32" cy="40" r="2" fill="#85adff"/></svg>`;

const monumentSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 8h4v40h-4z" fill="#85adff" opacity="0.6"/><path d="M24 48h16v8H24z" fill="#85adff" opacity="0.4"/><path d="M20 52h24" stroke="#85adff" stroke-width="2"/><path d="M32 8l-4 12h8L32 8z" fill="#85adff" opacity="0.8"/></svg>`;

const moaiSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 56V32c0-8 3-20 8-24 5 4 8 16 8 24v24" fill="#85adff" opacity="0.5"/><rect x="22" y="28" width="20" height="8" rx="2" fill="#85adff" opacity="0.3"/><rect x="28" y="36" width="8" height="6" fill="#85adff" opacity="0.4"/><circle cx="28" cy="24" r="2" fill="#070e1d"/><circle cx="36" cy="24" r="2" fill="#070e1d"/></svg>`;

export const COUNTRY_LANDMARKS: Record<string, CountryLandmark> = {
  "KR": { svg: templeSvg, name: "경복궁", tagline: "조선 왕조 600년의 역사", era: "1395~" },
  "US": { svg: statueSvg, name: "Statue of Liberty", tagline: "Freedom and democracy since 1776", era: "1886~" },
  "GB": { svg: castleSvg, name: "Tower of London", tagline: "A thousand years of royal history", era: "1066~" },
  "FR": { svg: towerSvg, name: "Eiffel Tower", tagline: "La Révolution et la République", era: "1789~" },
  "DE": { svg: gateSvg, name: "Brandenburg Gate", tagline: "Unity through division and reunion", era: "1791~" },
  "JP": { svg: toriiSvg, name: "Torii Gate", tagline: "Land of the Rising Sun", era: "710~" },
  "CN": { svg: wallSvg, name: "Great Wall", tagline: "5000 years of civilization", era: "BC 221~" },
  "EG": { svg: pyramidSvg, name: "Pyramids of Giza", tagline: "Cradle of ancient civilization", era: "BC 2560~" },
  "IT": { svg: colosseumSvg, name: "Colosseum", tagline: "The glory of the Roman Empire", era: "BC 753~" },
  "RU": { svg: castleSvg, name: "Kremlin", tagline: "From Tsars to superpowers", era: "1482~" },
  "GR": { svg: templeSvg, name: "Parthenon", tagline: "Birthplace of democracy", era: "BC 447~" },
  "IN": { svg: mosqueSvg, name: "Taj Mahal", tagline: "Jewel of ancient civilizations", era: "BC 2500~" },
  "BR": { svg: monumentSvg, name: "Christ the Redeemer", tagline: "Land of diversity and rhythm", era: "1500~" },
  "TR": { svg: mosqueSvg, name: "Hagia Sophia", tagline: "Bridge between East and West", era: "537~" },
  "ES": { svg: castleSvg, name: "Alhambra", tagline: "Reconquista and golden age", era: "711~" },
  "MX": { svg: pyramidSvg, name: "Chichén Itzá", tagline: "Legacy of Maya and Aztec", era: "BC 1500~" },
  "AU": { svg: monumentSvg, name: "Sydney Opera House", tagline: "Modern frontier Down Under", era: "1788~" },
  "MN": { svg: horseSvg, name: "Genghis Khan", tagline: "The greatest empire in history", era: "1206~" },
  "PE": { svg: monumentSvg, name: "Machu Picchu", tagline: "Lost city of the Incas", era: "1450~" },
  "CA": { svg: monumentSvg, name: "Parliament Hill", tagline: "True North strong and free", era: "1867~" },
  "SA": { svg: mosqueSvg, name: "Kaaba", tagline: "Birthplace of Islam", era: "622~" },
  "IL": { svg: castleSvg, name: "Western Wall", tagline: "Holy land of three faiths", era: "BC 1000~" },
  "IR": { svg: templeSvg, name: "Persepolis", tagline: "Heart of the Persian Empire", era: "BC 550~" },
  "PL": { svg: castleSvg, name: "Wawel Castle", tagline: "Resilience through centuries", era: "1038~" },
  "NL": { svg: monumentSvg, name: "Windmills", tagline: "Golden Age of trade and art", era: "1588~" },
  "SE": { svg: monumentSvg, name: "Vasa Museum", tagline: "Vikings to modern welfare state", era: "793~" },
  "TH": { svg: pagodaSvg, name: "Grand Palace", tagline: "Land of Smiles", era: "1238~" },
  "VN": { svg: pagodaSvg, name: "Imperial City", tagline: "Resilience and reunification", era: "BC 2879~" },
  "ZA": { svg: monumentSvg, name: "Table Mountain", tagline: "Rainbow Nation", era: "1652~" },
  "NG": { svg: monumentSvg, name: "Zuma Rock", tagline: "Giant of Africa", era: "1000~" },
  "AR": { svg: monumentSvg, name: "Casa Rosada", tagline: "Tango and revolution", era: "1816~" },
  "CL": { svg: moaiSvg, name: "Moai (Easter Island)", tagline: "End of the world", era: "1200~" },
};
