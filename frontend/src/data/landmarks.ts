export interface CountryLandmark {
  image: string;
  name: string;
  tagline: string;
}

export const COUNTRY_LANDMARKS: Record<string, CountryLandmark> = {
  KR: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Korea-Seoul-Gyeongbokgung-01.jpg/320px-Korea-Seoul-Gyeongbokgung-01.jpg", name: "경복궁", tagline: "조선 왕조 600년의 역사" },
  US: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/240px-Statue_of_Liberty_7.jpg", name: "Statue of Liberty", tagline: "Freedom since 1776" },
  GB: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tower_of_London_viewed_from_the_River_Thames.jpg/320px-Tower_of_London_viewed_from_the_River_Thames.jpg", name: "Tower of London", tagline: "A thousand years of history" },
  FR: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/240px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", name: "Tour Eiffel", tagline: "La Révolution et la République" },
  DE: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/320px-Brandenburger_Tor_abends.jpg", name: "Brandenburger Tor", tagline: "Unity and reunion" },
  JP: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Itsukushima_torii_distance.jpg/320px-Itsukushima_torii_distance.jpg", name: "厳島神社", tagline: "Land of the Rising Sun" },
  CN: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/320px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg", name: "万里长城", tagline: "5000 years of civilization" },
  EG: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/320px-Kheops-Pyramid.jpg", name: "Pyramids of Giza", tagline: "Cradle of civilization" },
  IT: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/320px-Colosseo_2020.jpg", name: "Colosseo", tagline: "Glory of the Roman Empire" },
  RU: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Moscow_Kremlin_from_Kamenny_bridge.jpg/320px-Moscow_Kremlin_from_Kamenny_bridge.jpg", name: "Kremlin", tagline: "From Tsars to superpowers" },
  GR: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/320px-The_Parthenon_in_Athens.jpg", name: "Parthenon", tagline: "Birthplace of democracy" },
  IN: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/320px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg", name: "Taj Mahal", tagline: "Jewel of India" },
  BR: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Cidade_Maravilhosa.jpg/320px-Cidade_Maravilhosa.jpg", name: "Cristo Redentor", tagline: "Cidade Maravilhosa" },
  TR: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/320px-Hagia_Sophia_Mars_2013.jpg", name: "Ayasofya", tagline: "East meets West" },
  ES: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_702702_702732.jpg/320px-Dawn_Charles_V_702702_702732.jpg", name: "Alhambra", tagline: "Reconquista and golden age" },
  MX: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Chichen-Itza-Castillo-Seen-From-East.JPG/320px-Chichen-Itza-Castillo-Seen-From-East.JPG", name: "Chichén Itzá", tagline: "Legacy of Maya and Aztec" },
  AU: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sydney_Opera_House_Sails.jpg/320px-Sydney_Opera_House_Sails.jpg", name: "Opera House", tagline: "Down Under" },
  MN: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Chinggis_Khaan_Statue_Complex.JPG/320px-Chinggis_Khaan_Statue_Complex.JPG", name: "Genghis Khan", tagline: "Greatest empire in history" },
  PE: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/320px-Machu_Picchu%2C_Peru.jpg", name: "Machu Picchu", tagline: "Lost city of the Incas" },
  CA: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Centre_Block_-_Parliament_Hill.jpg/320px-Centre_Block_-_Parliament_Hill.jpg", name: "Parliament Hill", tagline: "True North strong and free" },
  SA: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Kaaba_at_night.jpg/320px-Kaaba_at_night.jpg", name: "Masjid al-Haram", tagline: "Birthplace of Islam" },
  IL: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Jerusalem_Western_Wall_BW_1.JPG/240px-Jerusalem_Western_Wall_BW_1.JPG", name: "Western Wall", tagline: "Holy land of three faiths" },
  IR: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Persepolis_24.11.2009_11-12-14.jpg/320px-Persepolis_24.11.2009_11-12-14.jpg", name: "Persepolis", tagline: "Heart of the Persian Empire" },
  PL: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Wawel_Castle_seen_from_Vistula_river_01.jpg/320px-Wawel_Castle_seen_from_Vistula_river_01.jpg", name: "Wawel Castle", tagline: "Resilience through centuries" },
  NL: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kinderdijk_Windmills.jpg/320px-Kinderdijk_Windmills.jpg", name: "Kinderdijk", tagline: "Golden Age of trade" },
  TH: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg/320px-Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg", name: "Grand Palace", tagline: "Land of Smiles" },
  ZA: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Table_Mountain_DanieVDM.jpg/320px-Table_Mountain_DanieVDM.jpg", name: "Table Mountain", tagline: "Rainbow Nation" },
  AR: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Casa_Rosada-Exterior.jpg/320px-Casa_Rosada-Exterior.jpg", name: "Casa Rosada", tagline: "Tango and revolution" },
};
