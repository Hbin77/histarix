export interface CountryLandmark {
  symbol: string;  // Unicode symbol or short text icon
  name: string;    // Landmark name
  tagline: string; // One-line historical description
  era: string;     // Historical era
}

export const COUNTRY_LANDMARKS: Record<string, CountryLandmark> = {
  "KR": { symbol: "🏯", name: "경복궁", tagline: "조선 왕조 600년의 역사", era: "1395~" },
  "US": { symbol: "🗽", name: "Statue of Liberty", tagline: "Freedom and democracy since 1776", era: "1886~" },
  "GB": { symbol: "🏰", name: "Tower of London", tagline: "A thousand years of royal history", era: "1066~" },
  "FR": { symbol: "🗼", name: "Eiffel Tower", tagline: "La Révolution et la République", era: "1789~" },
  "DE": { symbol: "🏛️", name: "Brandenburg Gate", tagline: "Unity through division and reunion", era: "1791~" },
  "JP": { symbol: "⛩️", name: "Torii Gate", tagline: "Land of the Rising Sun", era: "710~" },
  "CN": { symbol: "🏯", name: "Great Wall", tagline: "5000 years of civilization", era: "BC 221~" },
  "EG": { symbol: "🔺", name: "Pyramids of Giza", tagline: "Cradle of ancient civilization", era: "BC 2560~" },
  "IT": { symbol: "🏛️", name: "Colosseum", tagline: "The glory of the Roman Empire", era: "BC 753~" },
  "RU": { symbol: "🏰", name: "Kremlin", tagline: "From Tsars to superpowers", era: "1482~" },
  "GR": { symbol: "🏛️", name: "Parthenon", tagline: "Birthplace of democracy", era: "BC 447~" },
  "IN": { symbol: "🕌", name: "Taj Mahal", tagline: "Jewel of ancient civilizations", era: "BC 2500~" },
  "BR": { symbol: "🗿", name: "Christ the Redeemer", tagline: "Land of diversity and rhythm", era: "1500~" },
  "TR": { symbol: "🕌", name: "Hagia Sophia", tagline: "Bridge between East and West", era: "537~" },
  "ES": { symbol: "🏰", name: "Alhambra", tagline: "Reconquista and golden age", era: "711~" },
  "MX": { symbol: "🏛️", name: "Chichén Itzá", tagline: "Legacy of Maya and Aztec", era: "BC 1500~" },
  "AU": { symbol: "🏗️", name: "Sydney Opera House", tagline: "Modern frontier Down Under", era: "1788~" },
  "MN": { symbol: "🏇", name: "Genghis Khan", tagline: "The greatest empire in history", era: "1206~" },
  "PE": { symbol: "🏔️", name: "Machu Picchu", tagline: "Lost city of the Incas", era: "1450~" },
  "CA": { symbol: "🍁", name: "Parliament Hill", tagline: "True North strong and free", era: "1867~" },
  "SA": { symbol: "🕋", name: "Kaaba", tagline: "Birthplace of Islam", era: "622~" },
  "IL": { symbol: "✡️", name: "Western Wall", tagline: "Holy land of three faiths", era: "BC 1000~" },
  "IR": { symbol: "🏛️", name: "Persepolis", tagline: "Heart of the Persian Empire", era: "BC 550~" },
  "PL": { symbol: "🏰", name: "Wawel Castle", tagline: "Resilience through centuries", era: "1038~" },
  "NL": { symbol: "🌷", name: "Windmills", tagline: "Golden Age of trade and art", era: "1588~" },
  "SE": { symbol: "⚔️", name: "Vasa Museum", tagline: "Vikings to modern welfare state", era: "793~" },
  "TH": { symbol: "🏛️", name: "Grand Palace", tagline: "Land of Smiles", era: "1238~" },
  "VN": { symbol: "🏯", name: "Imperial City", tagline: "Resilience and reunification", era: "BC 2879~" },
  "ZA": { symbol: "🏔️", name: "Table Mountain", tagline: "Rainbow Nation", era: "1652~" },
  "NG": { symbol: "🏛️", name: "Zuma Rock", tagline: "Giant of Africa", era: "1000~" },
  "AR": { symbol: "🏔️", name: "Casa Rosada", tagline: "Tango and revolution", era: "1816~" },
  "CL": { symbol: "🗿", name: "Moai (Easter Island)", tagline: "End of the world", era: "1200~" },
};
