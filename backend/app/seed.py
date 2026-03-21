"""Seed countries and historical events into the database."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Country, HistoricalEvent
from app.utils.country_mapping import ISO_TO_WIKIDATA, ISO_TO_NAME

# Key historical events per country (iso_a2 -> list of (year, title, description))
HISTORICAL_EVENTS = {
    "KR": [
        (-2333, "고조선 건국", "단군왕검이 고조선을 건국했다고 전해진다."),
        (-57, "신라 건국", "박혁거세가 신라를 건국하였다."),
        (-37, "고구려 건국", "주몽이 고구려를 건국하였다."),
        (-18, "백제 건국", "온조왕이 백제를 건국하였다."),
        (676, "신라의 삼국통일", "신라가 당나라의 세력을 몰아내고 삼국을 통일하였다."),
        (918, "고려 건국", "왕건이 고려를 건국하였다."),
        (1392, "조선 건국", "이성계가 조선을 건국하였다."),
        (1446, "훈민정음 반포", "세종대왕이 훈민정음을 반포하였다."),
        (1592, "임진왜란", "일본이 조선을 침략한 임진왜란이 발발하였다."),
        (1636, "병자호란", "청나라가 조선을 침략한 병자호란이 발생하였다."),
        (1876, "강화도 조약", "일본과 강화도 조약을 체결하며 개항하였다."),
        (1910, "한일병합", "대한제국이 일본에 의해 강제 병합되었다."),
        (1919, "3·1 운동", "독립을 요구하는 3·1 만세 운동이 전국적으로 일어났다."),
        (1945, "광복", "일본의 항복으로 한국이 해방되었다."),
        (1950, "한국전쟁 발발", "북한의 남침으로 한국전쟁이 시작되었다."),
        (1988, "서울 올림픽", "제24회 하계 올림픽이 서울에서 개최되었다."),
        (2002, "한일 월드컵", "FIFA 월드컵이 한국과 일본에서 공동 개최되었다."),
    ],
    "US": [
        (1492, "Columbus reaches Americas", "Christopher Columbus arrived in the Americas."),
        (1607, "Jamestown founded", "The first permanent English settlement was established."),
        (1776, "Declaration of Independence", "The United States declared independence from Britain."),
        (1787, "Constitution adopted", "The U.S. Constitution was ratified."),
        (1861, "Civil War begins", "The American Civil War began between North and South."),
        (1865, "Civil War ends", "The Civil War ended with Union victory; slavery abolished."),
        (1869, "Transcontinental Railroad", "The first transcontinental railroad was completed."),
        (1903, "Wright Brothers flight", "The Wright Brothers achieved the first powered flight."),
        (1929, "Great Depression", "The stock market crashed, beginning the Great Depression."),
        (1941, "Pearl Harbor", "Japan attacked Pearl Harbor; U.S. entered World War II."),
        (1945, "End of WWII", "World War II ended after atomic bombs on Japan."),
        (1963, "JFK assassination", "President John F. Kennedy was assassinated."),
        (1969, "Moon landing", "Apollo 11 landed on the Moon; Neil Armstrong walked on it."),
        (1989, "Fall of Berlin Wall", "The Berlin Wall fell, signaling the end of the Cold War."),
        (2001, "September 11 attacks", "Terrorist attacks destroyed the World Trade Center."),
    ],
    "GB": [
        (1066, "Norman Conquest", "William the Conqueror won the Battle of Hastings."),
        (1215, "Magna Carta", "King John signed the Magna Carta at Runnymede."),
        (1348, "Black Death", "The plague devastated England, killing a third of the population."),
        (1588, "Spanish Armada defeated", "England defeated the Spanish Armada."),
        (1642, "English Civil War", "Civil war began between Parliamentarians and Royalists."),
        (1707, "Act of Union", "England and Scotland united to form Great Britain."),
        (1776, "American colonies lost", "Britain lost the American colonies."),
        (1815, "Battle of Waterloo", "Napoleon was defeated at Waterloo."),
        (1837, "Victorian Era begins", "Queen Victoria began her reign."),
        (1914, "World War I begins", "Britain entered the First World War."),
        (1939, "World War II begins", "Britain declared war on Germany."),
        (1945, "WWII ends", "World War II ended in Allied victory."),
        (1947, "Indian independence", "India gained independence from Britain."),
        (1997, "Hong Kong handover", "Britain returned Hong Kong to China."),
    ],
    "FR": [
        (481, "Frankish Kingdom", "Clovis I united the Franks and founded the Merovingian dynasty."),
        (800, "Charlemagne crowned", "Charlemagne was crowned Emperor of the Romans."),
        (1337, "Hundred Years War begins", "The Hundred Years' War with England began."),
        (1431, "Joan of Arc executed", "Joan of Arc was burned at the stake."),
        (1643, "Louis XIV begins reign", "The Sun King began his 72-year reign."),
        (1789, "French Revolution", "The French Revolution began with the storming of the Bastille."),
        (1799, "Napoleon takes power", "Napoleon Bonaparte seized power in a coup."),
        (1804, "Napoleon becomes Emperor", "Napoleon crowned himself Emperor of France."),
        (1815, "Napoleon defeated", "Napoleon was defeated at Waterloo and exiled."),
        (1870, "Franco-Prussian War", "France was defeated by Prussia."),
        (1914, "World War I", "France fought in the devastating First World War."),
        (1940, "Fall of France", "Germany occupied France in World War II."),
        (1944, "D-Day Liberation", "Allied forces liberated France on D-Day."),
        (1958, "Fifth Republic", "Charles de Gaulle established the Fifth Republic."),
    ],
    "DE": [
        (800, "Charlemagne's Empire", "Charlemagne united much of Western Europe."),
        (962, "Holy Roman Empire", "Otto I was crowned Emperor, founding the Holy Roman Empire."),
        (1517, "Protestant Reformation", "Martin Luther posted his 95 Theses."),
        (1618, "Thirty Years War", "The devastating Thirty Years' War began."),
        (1871, "German unification", "Germany was unified under Prussian leadership."),
        (1914, "World War I", "Germany fought in the First World War."),
        (1918, "Weimar Republic", "The German Empire fell; the Weimar Republic was established."),
        (1933, "Hitler rises to power", "Adolf Hitler became Chancellor of Germany."),
        (1939, "World War II begins", "Germany invaded Poland, starting WWII."),
        (1945, "Germany surrenders", "Germany surrendered, ending WWII in Europe."),
        (1961, "Berlin Wall built", "The Berlin Wall was constructed, dividing East and West."),
        (1989, "Berlin Wall falls", "The Berlin Wall fell, leading to reunification."),
        (1990, "German Reunification", "East and West Germany were officially reunified."),
    ],
    "JP": [
        (710, "Nara Period", "The capital was established at Nara."),
        (794, "Heian Period", "The capital moved to Kyoto; classical Japanese culture flourished."),
        (1185, "Kamakura Shogunate", "The first military government was established."),
        (1467, "Onin War", "Civil war began the Sengoku (Warring States) period."),
        (1600, "Battle of Sekigahara", "Tokugawa Ieyasu won, leading to the Tokugawa Shogunate."),
        (1603, "Edo Period begins", "The Tokugawa Shogunate established peace for 250 years."),
        (1853, "Perry's Black Ships", "U.S. Commodore Perry forced Japan to open its ports."),
        (1868, "Meiji Restoration", "Imperial rule was restored; rapid modernization began."),
        (1905, "Russo-Japanese War", "Japan defeated Russia, emerging as a world power."),
        (1941, "Pearl Harbor attack", "Japan attacked Pearl Harbor, entering WWII."),
        (1945, "Atomic bombs & surrender", "Hiroshima and Nagasaki were bombed; Japan surrendered."),
        (1964, "Tokyo Olympics", "Japan hosted the Summer Olympics, showcasing recovery."),
        (1989, "Heisei Era begins", "Emperor Akihito began the Heisei era."),
    ],
    "CN": [
        (-221, "Qin unifies China", "Qin Shi Huang unified China and became the first Emperor."),
        (-206, "Han Dynasty", "The Han Dynasty was established, lasting over 400 years."),
        (618, "Tang Dynasty", "The Tang Dynasty began, a golden age of Chinese civilization."),
        (960, "Song Dynasty", "The Song Dynasty was established, advancing technology and culture."),
        (1271, "Yuan Dynasty", "Kublai Khan established the Mongol-led Yuan Dynasty."),
        (1368, "Ming Dynasty", "The Ming Dynasty was founded, building the Forbidden City."),
        (1644, "Qing Dynasty", "The Manchu Qing Dynasty conquered China."),
        (1839, "Opium War", "The First Opium War with Britain began."),
        (1911, "Xinhai Revolution", "The revolution overthrew the Qing Dynasty."),
        (1912, "Republic of China", "The Republic of China was established."),
        (1949, "People's Republic", "Mao Zedong proclaimed the People's Republic of China."),
        (1966, "Cultural Revolution", "The Cultural Revolution caused massive upheaval."),
        (1978, "Reform and Opening", "Deng Xiaoping began economic reforms."),
        (2001, "WTO membership", "China joined the World Trade Organization."),
    ],
    "EG": [
        (-3100, "Ancient Egypt unified", "Upper and Lower Egypt were unified under the first pharaoh."),
        (-2560, "Great Pyramid built", "The Great Pyramid of Giza was constructed."),
        (-1332, "Tutankhamun's reign", "The boy pharaoh Tutankhamun ruled Egypt."),
        (-332, "Alexander conquers Egypt", "Alexander the Great conquered Egypt."),
        (-30, "Roman Egypt", "Egypt became a province of the Roman Empire."),
        (641, "Arab conquest", "Arab forces conquered Egypt, introducing Islam."),
        (1250, "Mamluk Sultanate", "The Mamluks seized power in Egypt."),
        (1798, "Napoleon in Egypt", "Napoleon invaded Egypt."),
        (1869, "Suez Canal opens", "The Suez Canal was completed and opened."),
        (1922, "Independence", "Egypt gained independence from Britain."),
        (1952, "Egyptian Revolution", "The monarchy was overthrown in a military revolution."),
        (1956, "Suez Crisis", "Egypt nationalized the Suez Canal."),
        (1979, "Peace with Israel", "Egypt signed the Camp David Accords with Israel."),
    ],
    "IT": [
        (-753, "Rome founded", "According to legend, Rome was founded by Romulus."),
        (-509, "Roman Republic", "The Roman Republic was established."),
        (-27, "Roman Empire", "Augustus became the first Roman Emperor."),
        (476, "Fall of Rome", "The Western Roman Empire fell."),
        (1096, "First Crusade", "Italian city-states played key roles in the Crusades."),
        (1300, "Renaissance begins", "The Italian Renaissance began in Florence."),
        (1861, "Italian Unification", "Italy was unified as a single kingdom."),
        (1915, "Enters WWI", "Italy entered World War I on the Allied side."),
        (1922, "Mussolini rises", "Benito Mussolini and the Fascists took power."),
        (1943, "Fall of Fascism", "Mussolini was deposed; Italy switched sides in WWII."),
        (1946, "Republic established", "Italy became a republic after a referendum."),
    ],
    "RU": [
        (882, "Kievan Rus", "The Kievan Rus state was established."),
        (1240, "Mongol invasion", "The Mongols conquered most of Russia."),
        (1480, "End of Mongol rule", "Russia freed itself from Mongol domination."),
        (1547, "Ivan the Terrible", "Ivan IV became the first Tsar of Russia."),
        (1613, "Romanov Dynasty", "The Romanov dynasty began ruling Russia."),
        (1703, "St. Petersburg founded", "Peter the Great founded St. Petersburg."),
        (1812, "Napoleon invades", "Napoleon invaded Russia and was defeated."),
        (1861, "Serfdom abolished", "Tsar Alexander II abolished serfdom."),
        (1905, "Revolution of 1905", "A wave of political unrest swept Russia."),
        (1917, "Russian Revolution", "The Bolsheviks overthrew the Tsar; Soviet Union began."),
        (1941, "Nazi invasion", "Germany invaded the Soviet Union in Operation Barbarossa."),
        (1945, "Victory in WWII", "The Soviet Union helped defeat Nazi Germany."),
        (1957, "Sputnik launched", "The first artificial satellite was launched into space."),
        (1991, "Soviet Union dissolves", "The Soviet Union collapsed; Russia became independent."),
    ],
    "GR": [
        (-776, "First Olympics", "The first recorded Olympic Games were held at Olympia."),
        (-508, "Athenian Democracy", "Cleisthenes established democracy in Athens."),
        (-480, "Battle of Thermopylae", "300 Spartans made their famous last stand."),
        (-334, "Alexander's conquests", "Alexander the Great began his conquest of the known world."),
        (-146, "Roman conquest", "Greece became part of the Roman Empire."),
        (330, "Byzantine Empire", "Constantine moved the capital to Constantinople."),
        (1453, "Fall of Constantinople", "The Ottoman Turks captured Constantinople."),
        (1821, "Greek War of Independence", "Greece fought for independence from the Ottoman Empire."),
        (1896, "Modern Olympics", "The first modern Olympic Games were held in Athens."),
        (1940, "WWII resistance", "Greece resisted the Italian and German invasions."),
    ],
    "IN": [
        (-2500, "Indus Valley Civilization", "One of the world's earliest civilizations flourished."),
        (-1500, "Vedic Period", "The Vedas were composed; Hindu civilization developed."),
        (-322, "Maurya Empire", "Chandragupta Maurya founded the Maurya Empire."),
        (-265, "Ashoka's reign", "Emperor Ashoka promoted Buddhism across India."),
        (320, "Gupta Empire", "The Gupta Empire began India's Golden Age."),
        (1526, "Mughal Empire", "Babur founded the Mughal Empire."),
        (1600, "East India Company", "The British East India Company began trading in India."),
        (1857, "Indian Rebellion", "The first major rebellion against British rule."),
        (1920, "Gandhi's movement", "Mahatma Gandhi led the non-cooperation movement."),
        (1947, "Independence", "India gained independence from Britain; partition occurred."),
        (1950, "Republic of India", "India adopted its constitution and became a republic."),
    ],
    "BR": [
        (1500, "Portuguese arrival", "Pedro Alvares Cabral claimed Brazil for Portugal."),
        (1822, "Independence", "Brazil declared independence from Portugal."),
        (1888, "Slavery abolished", "Brazil was the last country in the Americas to abolish slavery."),
        (1889, "Republic proclaimed", "The monarchy was overthrown; Brazil became a republic."),
        (1960, "Brasilia built", "The new capital Brasilia was inaugurated."),
        (2014, "FIFA World Cup", "Brazil hosted the FIFA World Cup."),
        (2016, "Rio Olympics", "Rio de Janeiro hosted the Summer Olympics."),
    ],
    "TR": [
        (330, "Constantinople founded", "Constantine the Great founded Constantinople."),
        (1071, "Battle of Manzikert", "Seljuk Turks defeated the Byzantine Empire."),
        (1299, "Ottoman Empire founded", "Osman I founded the Ottoman Empire."),
        (1453, "Constantinople conquered", "Mehmed II conquered Constantinople."),
        (1683, "Siege of Vienna", "The Ottomans were defeated at Vienna."),
        (1923, "Republic of Turkey", "Mustafa Kemal Ataturk founded the Republic of Turkey."),
    ],
    "ES": [
        (711, "Moorish conquest", "Muslim forces conquered most of the Iberian Peninsula."),
        (1492, "Reconquista completed", "Granada fell; Columbus sailed to the Americas."),
        (1588, "Spanish Armada", "Spain's Armada was defeated by England."),
        (1808, "Peninsular War", "Napoleon invaded Spain."),
        (1898, "Spanish-American War", "Spain lost Cuba, Philippines, and Puerto Rico."),
        (1936, "Spanish Civil War", "Civil war between Republicans and Nationalists began."),
        (1975, "Democracy restored", "Franco died; Spain transitioned to democracy."),
    ],
    "MX": [
        (-1500, "Olmec civilization", "The first major Mesoamerican civilization arose."),
        (1325, "Tenochtitlan founded", "The Aztecs founded their capital Tenochtitlan."),
        (1521, "Spanish conquest", "Hernan Cortes conquered the Aztec Empire."),
        (1810, "War of Independence", "Mexico's independence movement began."),
        (1846, "Mexican-American War", "War with the United States resulted in territorial loss."),
        (1910, "Mexican Revolution", "The Mexican Revolution began."),
    ],
    "AU": [
        (1770, "Cook claims Australia", "Captain James Cook claimed Australia for Britain."),
        (1788, "First Fleet arrives", "The First Fleet established a penal colony at Sydney."),
        (1851, "Gold Rush", "Gold was discovered, triggering mass immigration."),
        (1901, "Federation", "The six colonies federated to form the Commonwealth."),
        (1942, "Battle of Coral Sea", "Australia helped defeat Japan in the Coral Sea."),
        (2000, "Sydney Olympics", "Sydney hosted the Summer Olympics."),
    ],
}


async def seed_countries(session: AsyncSession) -> None:
    """Seed countries table if empty."""
    result = await session.execute(select(Country).limit(1))
    if result.scalar_one_or_none():
        return

    for iso_code, name in ISO_TO_NAME.items():
        wikidata_id = ISO_TO_WIKIDATA.get(iso_code)
        country = Country(
            iso_a2=iso_code,
            name_en=name,
            wikidata_id=wikidata_id,
        )
        session.add(country)
    await session.commit()


async def seed_historical_events(session: AsyncSession) -> None:
    """Seed historical events table if empty."""
    result = await session.execute(select(HistoricalEvent).limit(1))
    if result.scalar_one_or_none():
        return

    for iso_code, events in HISTORICAL_EVENTS.items():
        for year, title, description in events:
            event = HistoricalEvent(
                title=title,
                description=description,
                year=year,
                date=f"{abs(year):04d}" if year >= 0 else f"-{abs(year):04d}",
                country_iso=iso_code,
                category="general",
                importance=2,
            )
            session.add(event)
    await session.commit()
