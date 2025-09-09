# Analýza podnikových požadavků - Konsolidace dotazníků

**Verze:** 1.0  
**Datum:** 9. září 2025  
**Projekt:** Questionnaire Consolidation Initiative (AML, KYC, Investment)  
**Framework:** BIAN  

---

## 1. Popis požadavků

### Základní popis

**Problém (Proč):**  
Banka v současnosti provozuje více separátních aplikací pro dotazníky AML (Anti-Money Laundering), KYC (Know Your Customer) a investiční profily klientů. Tato fragmentace způsobuje duplicitní zadávání údajů, zvyšuje administrativní zátěž, komplikuje správu dat a snižuje uživatelskou zkušenost jak pro klienty, tak pro zaměstnance banky. Navíc je plánováno ukončení provozu legacy CRM systému do června 2025, což vyžaduje migraci stávajících dat a funkcionalit. Současný stav také omezuje přístupnost produktového portfolia pro širší spektrum klientů a ztěžuje poskytování investičního poradenství.

**Návrh řešení (Jak):**  
Řešení spočívá v konsolidaci všech dotazníkových aplikací do jediné sjednocené platformy, která bude integrována prostřednictvím stávající ESB WSO2 API infrastruktury a Kafka streaming platformy. Navrhovaná architektura využívá BIAN (Banking Industry Architecture Network) framework s 6 klíčovými doménami služeb. Implementace bude probíhat postupně ve fázích s možností pilotního testování. Stávající evaluační algoritmy zůstanou nezměněny a budou integrovány prostřednictvím API wrapper pattern. Platforma bude podporovat multi-kanálové doručování dotazníků (web, DKCZ, DKSK) s jednotným rozhraním pro administraci.

**Řešení (Co):**  
Výsledkem bude nová sjednocená dotazníková platforma, která poskytne jediné rozhraní pro všechny typy dotazníků (AML, KYC, investiční profily), eliminuje duplicitní zadávání dat, zjednoduší administraci a zlepší uživatelskou zkušenost. Platforma umožní úspěšnou migraci dat z legacy CRM systému, zachová regulatorní compliance a podpoří širší dostupnost produktového portfolia. Systém bude operativní do června 2026 a umožní ukončení provozu legacy CRM do června 2025. Implementace povede k 50% snížení procesní efektivity, zlepšení dostupnosti systému na 99,9% a dosažení spokojenosti uživatelů nad 4,0/5,0.

### Rozsah procesních požadavků

#### Zahrnuté procesy:

1. **BRQ01 - Sjednocené onboarding klientů**
   - **Složitost:** Vysoká - Kritický proces ovlivňující všechny domény
   - **Dopad:** Kompletní přepracování procesu přijímání nových klientů s integrací všech typů dotazníků

2. **BRQ02 - Administrace AML dotazníků**
   - **Složitost:** Vysoká - Regulatorní požadavky a compliance
   - **Dopad:** Centralizace správy anti-money laundering procesů

3. **BRQ03 - Administrace KYC dotazníků**
   - **Složitost:** Vysoká - Know Your Customer compliance
   - **Dopad:** Sjednocení procesů ověřování identity klientů

4. **BRQ04 - Hodnocení investičního profilu**
   - **Složitost:** Střední - Integrace s evaluačními algoritmy
   - **Dopad:** Zlepšení procesu určování vhodnosti investičních produktů

5. **BRQ05 - Správa verzí dotazníků**
   - **Složitost:** Střední - Centrální administrace
   - **Dopad:** Sjednocené řízení verzí a aktualizací dotazníků

6. **BRQ06 - Multi-kanálové doručování dotazníků**
   - **Složitost:** Střední - Synchronizace napříč kanály
   - **Dopad:** Konzistentní uživatelská zkušenost napříč všemi kanály

7. **BRQ07 - Proces kontroly compliance**
   - **Složitost:** Vysoká - Regulatorní požadavky
   - **Dopad:** Centralizace kontrolních mechanismů pro splnění regulatorních požadavků

8. **BRQ08 - Proces migrace dat**
   - **Složitost:** Kritická - Nulová ztráta dat
   - **Dopad:** Kompletní migrace historických dat z legacy systémů

9. **BRQ09 - Proces obnovy dotazníků**
   - **Složitost:** Střední - Automatizované notifikace
   - **Dopad:** Automatizace procesu periodického obnovování dotazníků

10. **BRQ10 - Proces investičního poradenství**
    - **Složitost:** Vysoká - Integrace s poradenskými službami
    - **Dopad:** Zlepšení kvality investičního poradenství na základě sjednocených profilů

#### Vyloučené procesy:
- Mobilní aplikace (plánováno pro budoucí fázi)
- Další typy dotazníků mimo AML, KYC a investiční
- Změny stávajících evaluačních algoritmů
- Integrace s externími regulatorními systémy

#### Hlavní omezení:
- Stávající evaluační algoritmy zůstávají nezměněny
- Povinné dokončení do června 2026
- Zachování regulatorní compliance během celé migrace
- Integrace musí využívat stávající ESB WSO2 a Kafka infrastrukturu

### Rozsah business požadavků

#### Zahrnuté business oblasti:

1. **Investment Center**
   - **Dopad:** Zjednodušení simulací investičních dotazníků, širší přístupnost produktového portfolia
   - **Zapojení:** Aktivní - klíčový stakeholder pro investiční procesy

2. **Banking Center**
   - **Dopad:** Jednotné rozhraní pro všechny dotazníky, snížení školicích a operativních nákladů
   - **Zapojení:** Aktivní - hlavní uživatelé systému

3. **Compliance**
   - **Dopad:** Modernizované front-end rozhraní s lepším dohledem napříč aplikacemi
   - **Zapojení:** Kritické - zajištění regulatorní compliance

4. **IT Operations**
   - **Dopad:** Konsolidace infrastruktury, snížení komplexity systémové krajiny
   - **Zapojení:** Podpůrné - technická implementace a provoz

#### Explicitně vyloučené oblasti:
- Externí partnerské banky
- Retailové pobočky mimo český a slovenský trh
- Korporátní bankovnictví (mimo investiční služby)
- Platební systémy a karty

#### Tvrdá omezení:

1. **Regulatorní:** Musí být zachována kompletní AML a KYC compliance podle platných předpisů (Kritické)
2. **Technické:** Integrace pouze prostřednictvím stávající ESB WSO2 API infrastruktury (Vysoké)
3. **Rozpočtové:** Využití stávajících investic do infrastruktury (Kafka, ESB) (Střední)
4. **Časové:** Pevný termín dokončení do června 2026 kvůli ukončení legacy CRM (Kritické)

### Rozsah funkčních požadavků

#### Core capabilities (kritické schopnosti):

1. **Sjednocená administrace dotazníků** (Kritická)
   - Centrální správa všech typů dotazníků (AML, KYC, investiční) z jednoho rozhraní

2. **Multi-kanálové doručování** (Vysoká)
   - Distribuce a sběr dotazníků napříč webovými kanály, DKCZ a DKSK platformami

3. **Integrace evaluačních algoritmů** (Kritická)
   - Zachování stávajících algoritmů pro hodnocení rizik a compliance

4. **Správa verzí a šablon** (Vysoká)
   - Centralizované řízení verzí dotazníků a jejich šablon

#### Supporting capabilities (podpůrné schopnosti):

1. **Reporting a monitoring** (Střední)
   - Jednotné reportování napříč všemi typy dotazníků

2. **Workflow management** (Střední)
   - Řízení workflow pro schválení a review procesů

3. **Audit trail** (Vysoká)
   - Komplětní auditní stopa pro všechny operace

#### Out-of-scope capabilities:
- Mobilní aplikace (budoucí fáze)
- AI/ML doporučovací systémy
- Real-time analytics dashboard
- Integrace s externími credit bureau systémy

### Rozsah technických požadavků

#### Target systems:

1. **Nový sjednocený dotazníkový systém**
   - **Role:** Primární - Core aplikace pro všechny dotazníkové procesy
   - **Technologie:** Modern web aplikace s API-first architekturou

2. **Banking Web Application**
   - **Role:** Podpůrný - Uživatelské rozhraní pro bankovní zaměstnance
   - **Technologie:** Web aplikace integrovaná s core systémem

3. **Administrator Web Application**
   - **Role:** Podpůrný - Administrační rozhraní pro správu systému
   - **Technologie:** Specializované admin rozhraní

#### Integrace s existujícími systémy:

1. **ESB WSO2 API Gateway** - API integrace pro centrální orchestrace služeb
2. **Kafka Streaming Platform** - Event streaming pro real-time datovou synchronizaci
3. **Legacy Evaluation Engine** - API wrapper pro zachování stávajících algoritmů
4. **Digital Channels Platform (DKCZ/DKSK)** - Channel integration pro multi-kanálové doručování

#### Systémy mimo rozsah:
- Legacy CRM System (pouze migrace dat, pak ukončení)
- Externí regulatorní reporting systémy
- Core banking systémy
- Mobilní platformy (budoucí fáze)

### Rozsah organizačních požadavků

#### Primární stakeholders:

1. **Investment Center Staff** - Vysoká rozhodovací pravomoc, kritický dopad
2. **Banking Center Staff** - Vysoká rozhodovací pravomoc, kritický dopad (primární uživatelé)
3. **Compliance Officers** - Kritická rozhodovací pravomoc, kritický dopad (garanti compliance)
4. **System Administrators** - Střední rozhodovací pravomoc, vysoký dopad

#### Sekundární stakeholders:

1. **Digital Channel Operators** - Střední vliv, střední dopad
2. **Investment Advisors** - Střední vliv, vysoký dopad
3. **IT Architecture** - Vysoký vliv, střední dopad

#### Externí strany:

1. **Bank Customers** - Koordinace: Uživatelská zkušenost, testování
2. **Regulatorní orgány** - Koordinace: Compliance validation

---

## 2. As-is stav popis

### Popis aktuálního stavu

#### Obecný popis:
Banka v současnosti provozuje fragmentovanou systémovou krajinu s více oddělených aplikací pro různé typy dotazníků. Každá aplikace má vlastní databázi, uživatelské rozhraní a administrační procesy, což způsobuje duplicitní práci a nekonzistentní uživatelskou zkušenost.

#### Problémové oblasti:

1. **Duplicitní zadávání údajů**
   - **Popis:** Klienti musí opakovaně zadávat stejné základní údaje v různých aplikacích
   - **Dopad:** Snížená uživatelská spokojenost, zvýšené riziko chyb

2. **Fragmentovaná administrace**
   - **Popis:** Zaměstnanci musí používat více různých systémů s odlišnými rozhraními
   - **Dopad:** Vyšší náklady na školení, snížená efektivita

3. **Nekonzistentní data**
   - **Popis:** Absence centrálního úložiště zákazníkových profilů
   - **Dopad:** Riziko rozporuplných informací, složitější reporting

4. **Zastaralá technologie**
   - **Popis:** Legacy CRM systém vyžaduje ukončení provozu do června 2025
   - **Dopad:** Technický dluh, bezpečnostní rizika

5. **Omezená škálovatelnost**
   - **Popis:** Současné systémy neumožňují snadné přidání nových typů dotazníků
   - **Dopad:** Pomalé uvedení nových produktů na trh

#### Stávající procesy:

1. **AML Questionnaire Processing**
   - **Stav:** Separátní aplikace s vlastním workflow
   - **Problémy:** Manuální kontroly, pomalý approval proces, nedostatečný reporting

2. **KYC Verification**
   - **Stav:** Oddělená aplikace s rozdílným UI
   - **Problémy:** Nekonzistentní dokumentace, duplicitní dokumenty, složité vyhledávání

3. **Investment Profiling**
   - **Stav:** Třetí separátní systém
   - **Problémy:** Neúplné propojení s ostatními daty, omezené možnosti segmentace

4. **Customer Onboarding**
   - **Stav:** Sekvenční proces napříč systémy
   - **Problémy:** Dlouhá doba dokončení, vysoká chybovost, špatná viditelnost stavu

---

## 3. To-be stav popis

### Základní popis

**Řešení:**  
Nová sjednocená dotazníková platforma představuje komplexní řešení, které konsoliduje všechny stávající separátní aplikace do jednoho integrovaného systému. Platforma využívá moderní microservices architekturu založenou na BIAN framework s 6 klíčovými service doménami. Řešení zachovává všechny stávající evaluační algoritmy prostřednictvím API wrapper pattern a integruje se s existující infrastrukturou ESB WSO2 a Kafka. Implementace probíhá postupně ve čtyřech fázích s možností pilotního testování a rollback procedur.

**Výhody:**
- Eliminace duplicitního zadávání dat
- Sjednocené uživatelské rozhraní pro všechny typy dotazníků
- Centralizované řízení verzí a administrace
- Zachování stávající business logiky
- Zlepšená uživatelská zkušenost
- Snížené provozní náklady
- Lepší compliance monitoring
- Rychlejší onboarding proces
- Rozšířená dostupnost produktového portfolia

**Nevýhody:**
- Vysoké počáteční investiční náklady
- Komplexní migrace stávajících dat
- Potřeba rozsáhlého školení uživatelů
- Riziko disruption během přechodu
- Závislost na jediném systému
- Nutnost koordinace napříč více týmy

### Seznam procesních požadavků

1. **PR01 - Sjednocené onboarding klientů (BRQ01)**
   - **Dopad:** Kompletní redesign procesu s integrací všech typů dotazníků do jednoho flow
   - **Změny:**
     - Jednotné vstupní rozhraní pro všechny typy klientů
     - Progresivní vyplňování dotazníků s možností dočasného uložení
     - Automatické pre-vyplnění známých údajů
     - Real-time validace a feedback
     - Integrované workflow pro approval proces

2. **PR02 - Administrace compliance dotazníků (BRQ02, BRQ03)**
   - **Dopad:** Centralizace AML a KYC procesů s jednotným administračním rozhraním
   - **Změny:**
     - Sjednocené dashboardy pro compliance officers
     - Automatizované workflow pro escalation
     - Centralizované reporting napříč všemi typy
     - Integrované audit trail funkce
     - Zjednodušená správa výjimek a flag management

3. **PR03 - Investiční poradenství (BRQ04, BRQ10)**
   - **Dopad:** Zlepšení kvality poradenských služeb díky kompletním zákazníkovým profilům
   - **Změny:**
     - 360° pohled na klienta včetně všech dotazníků
     - Automatické doporučení produktů na základě kompletního profilu
     - Zjednodušená simulace investičních scénářů
     - Integrované nástroje pro advisory session
     - Lepší segmentace klientů pro targeting

4. **PR04 - Multi-kanálová distribuce (BRQ06)**
   - **Dopad:** Konzistentní experience napříč všemi kanály s real-time synchronizací
   - **Změny:**
     - Jednotné API pro všechny kanály
     - Real-time synchronizace stavu dotazníků
     - Responsive design pro různé zařízení
     - Kanál-specifické customizace při zachování jednotnosti
     - Centralizované monitorování napříč kanály

### Seznam business požadavků

1. **BR01 - Konsolidace aplikací pro dotazníky** (Kritická priorita)
   - **Business cíl:** Zjednodušení administrativy a eliminace duplicit
   - **Výsledek:** Jedna aplikace místo tří separátních systémů
   - **Měření:** Počet systémů snížen ze 3 na 1

2. **BR02 - Zlepšení uživatelské zkušenosti** (Vysoká priorita)
   - **Business cíl:** Zvýšení spokojenosti klientů a efektivity zaměstnanců
   - **Výsledek:** Jednotné rozhraní, rychlejší procesy, méně chyb
   - **Měření:** Spokojenost uživatelů >4.0/5.0, čas dokončení snížen o 50%

3. **BR03 - Úspěšná migrace z legacy CRM** (Kritická priorita)
   - **Business cíl:** Umožnění ukončení zastaralého systému
   - **Výsledek:** 100% migrace dat bez ztráty informací
   - **Měření:** Zero data loss, CRM ukončen do 06/2025

4. **BR04 - Zachování regulatorní compliance** (Kritická priorita)
   - **Business cíl:** Splnění všech AML a KYC požadavků
   - **Výsledek:** Kontinuální compliance během celé migrace
   - **Měření:** 100% compliance rate, žádné regulatory issues

5. **BR05 - Rozšíření produktové dostupnosti** (Střední priorita)
   - **Business cíl:** Zpřístupnění investičních produktů širšímu spektru klientů
   - **Výsledek:** Zjednodušené investiční dotazníky a lepší segmentace
   - **Měření:** Nárůst počtu klientů s investičním profilem o 30%

### Seznam funkčních požadavků

#### Must Have (Priorita 1):

**FR01 - Sjednocená platforma dotazníků**
- **Popis:** Systém musí podporovat všechny typy dotazníků (AML, KYC, investiční) v rámci jediné aplikace
- **Acceptance criteria:**
  - Všechny tři typy dotazníků dostupné z jednoho rozhraní
  - Jednotný datový model pro všechny responses
  - Centralizované administrační rozhraní
  - Cross-reference mezi různými typy dotazníků

**FR02 - Zachování evaluačních algoritmů**
- **Popis:** Stávající algoritmy pro risk scoring a compliance zůstávají nezměněny
- **Acceptance criteria:**
  - API integrace s legacy evaluation engine
  - Identické výsledky jako v současných systémech
  - Žádné změny v business logice
  - Zachování všech scoring parametrů

**FR06 - Migrace legacy dat**
- **Popis:** Kompletní migrace historických dat z CRM systému
- **Acceptance criteria:**
  - 100% migrace všech dotazníkových dat
  - Data cleansing a standardizace
  - Validace integrity po migraci
  - Parallel running možnost během migrace

**FR08 - ESB a Kafka integrace**
- **Popis:** Plná integrace se stávající ESB WSO2 a Kafka infrastrukturou
- **Acceptance criteria:**
  - Všechna API volání přes ESB WSO2
  - Event streaming přes Kafka
  - Zachování existing integration patterns
  - Monitoring a error handling

#### Must Have (Priorita 2):

**FR03 - Multi-kanálové rozhraní**
- **Popis:** Podpora pro web, DKCZ a DKSK kanály s konzistentní experience
- **Acceptance criteria:**
  - Responsive design pro všechny kanály
  - Kanál-specifické customizace
  - Real-time synchronizace stavu
  - Jednotné API pro všechny kanály

**FR04 - Eliminace duplicitního zadávání**
- **Popis:** Společná zákaznická data sdílená napříč všemi dotazníky
- **Acceptance criteria:**
  - Centrální customer master data
  - Auto-completion známých údajů
  - Single point of data entry
  - Data validation a consistency checks

#### Should Have (Priorita 3-4):

**FR05 - Centralizovaná správa verzí**
**FR07 - Automatizované renewal procesy**

### Seznam ne-funkčních požadavků

1. **NFR01 - Performance (Vysoká priorita)**
   - **Požadavek:** Doba odezvy systému <2 sekundy pro 95% transakcí
   - **Měření:** Response time monitoring

2. **NFR02 - Availability (Kritická priorita)**
   - **Požadavek:** Dostupnost systému 99.9%
   - **Měření:** System availability monitoring

3. **NFR03 - Security (Kritická priorita)**
   - **Požadavek:** Implementace bankovních bezpečnostních standardů a GDPR
   - **Měření:** Security audit a penetration testing

4. **NFR04 - Scalability (Střední priorita)**
   - **Požadavek:** Podpora současného objemu + 100% nárůst
   - **Měření:** Load testing

5. **NFR05 - Usability (Vysoká priorita)**
   - **Požadavek:** User satisfaction score >4.0/5.0
   - **Měření:** User acceptance testing a surveys

6. **NFR06 - Compliance (Kritická priorita)**
   - **Požadavek:** 100% splnění AML, KYC a bankovních regulací
   - **Měření:** Regulatory audit

### Seznam systémových požadavků

#### Nové systémy:

1. **Nový sjednocený dotazníkový systém** (Vysoká složitost)
   - Kompletně nový microservices-based systém
   - BIAN architecture s 6 service domains
   - Modern web UI s responsive designem
   - API-first approach s comprehensive documentation
   - Built-in monitoring a logging capabilities

#### Rozšíření stávajících systémů:

2. **ESB WSO2 API Gateway** (Střední složitost)
   - Přidání nových API endpoints
   - Rozšíření security policies
   - Nové routing rules a transformations

3. **Kafka Streaming Platform** (Střední složitost)
   - Nové topics pro questionnaire events
   - Stream processing pro real-time synchronizaci
   - Event sourcing pro audit trail

4. **Digital Channels Platform (DKCZ/DKSK)** (Střední složitost)
   - Nové adaptéry pro questionnaire integration
   - UI komponenty pro dotazníky
   - Session management pro multi-step flows

#### Wrapping stávajících systémů:

5. **Legacy Evaluation Engine** (Nízká složitost)
   - API wrapper pro existing algoritmy
   - Input/output format adaptace
   - Error handling a timeout management

#### Migrace a ukončení:

6. **Legacy CRM System** (Vysoká složitost)
   - Data extraction utilities
   - Migration validation procedures
   - Parallel running capability
   - Controlled shutdown proces do 06/2025

### Seznam datových požadavků

1. **Customer Profile (Party Data Management)** - Kritický dopad, vysoká složitost
   - Sjednocení customer profilu ze všech zdrojů
   - Master data management implementace
   - Data quality rules a validation
   - GDPR compliance s consent management

2. **Questionnaire Responses (Regulatory Compliance)** - Kritický dopad, vysoká složitost
   - Unifikace response schemas pro všechny typy
   - Audit trail s immutable history
   - Compliance flagging a scoring
   - Cross-questionnaire relationship management

3. **Risk Scores (Customer Offer)** - Vysoký dopad, střední složitost
   - Centralizované risk scoring napříč produkty
   - Real-time score updates
   - Historical scoring trends
   - Product suitability matrix

4. **Questionnaire Templates (Customer Workbench)** - Střední dopad, střední složitost
   - Centrální template repository
   - Version control a branching
   - Multi-language support
   - Template inheritance a reusability

5. **Channel Interactions (Channel Management)** - Střední dopad, střední složitost
   - Cross-channel session management
   - Channel preference tracking
   - Interaction history consolidation

6. **Authentication Data (Party Authentication)** - Kritický dopad, vysoká složitost
   - Enhanced authentication schemas
   - Multi-factor authentication support
   - Session management a security tokens
   - Access control lists a permissions

---

## Acceptance Criteria

### Měřitelné podmínky úspěchu:

1. **Funkční konsolidace**
   - **Pass:** 100% funkcionalita AML, KYC a investičních dotazníků v novém systému
   - **Fail:** Jakákoli funkcionalita chybí nebo nefunguje správně

2. **Migrace dat**
   - **Pass:** Zero data loss, 100% data integrity validation passed
   - **Fail:** Jakákoli ztráta dat nebo failed validation checks

3. **Performance**
   - **Pass:** Response time <2s pro 95% transakcí podle monitoring dat
   - **Fail:** Response time přesahuje 2 sekundy pro více než 5% transakcí

4. **Dostupnost**
   - **Pass:** Availability monitoring shows ≥99.9% uptime
   - **Fail:** Uptime klesne pod 99.9%

5. **Uživatelská spokojenost**
   - **Pass:** Průzkum spokojenosti s průměrným skóre >4.0/5.0
   - **Fail:** Průměrné skóre ≤4.0

6. **Compliance**
   - **Pass:** Úspěšný compliance audit bez findings
   - **Fail:** Jakékoli compliance violations or audit findings

---

## Assumptions (Předpoklady)

### Business předpoklady:
1. **Stakeholder buy-in** - Všichni klíčoví stakeholders podporují konsolidaci (Riziko: Střední)
2. **Regulatorní stabilita** - AML a KYC regulace zůstanou stabilní během implementace (Riziko: Nízké)
3. **Business continuity** - Current operations budou pokračovat během migrace (Riziko: Střední)

### Technické předpoklady:
1. **Infrastructure availability** - ESB WSO2 a Kafka zůstanou dostupné a stabilní (Riziko: Nízké)
2. **Legacy system access** - CRM systém zůstane přístupný pro migraci dat (Riziko: Střední)
3. **Development resources** - Dostatečné development resources k dispozici (Riziko: Střední)

### Resource předpoklady:
1. **Budget approval** - Schválený rozpočet pro celou implementaci (Riziko: Střední)
2. **Skilled personnel** - Dostupnost qualified IT specialistů (Riziko: Vysoké)
3. **Training time** - Uživatelé budou mít čas na training a adaptation (Riziko: Střední)

### Timeline předpoklady:
1. **CRM retirement date** - Legacy CRM bude skutečně ukončen v 06/2025 (Riziko: Střední)
2. **No major scope changes** - Rozsah projektu zůstane stabilní (Riziko: Vysoké)
3. **Vendor support** - Vendoři budou poskytovat potřebnou podporu (Riziko: Nízké)

---

## Success Metrics (Metriky úspěchu)

### Business KPIs:

1. **Process Efficiency Gain**
   - **Baseline:** Průměrný čas 45 minut
   - **Target:** Snížení o 50% na 22.5 minut
   - **Timeframe:** 3 měsíce po go-live

2. **User Satisfaction Score**
   - **Baseline:** Current average 3.2/5.0
   - **Target:** >4.0/5.0
   - **Timeframe:** 6 měsíců po go-live

3. **Data Quality Improvement**
   - **Baseline:** Current data inconsistency ~15%
   - **Target:** <5% data inconsistency
   - **Timeframe:** 6 měsíců po migraci

4. **Cost Reduction**
   - **Target:** 20% reduction v operativních nákladech
   - **Timeframe:** 12 měsíců po go-live

### Technical KPIs:

1. **System Availability**
   - **Target:** 99.9%
   - **Measurement:** Continuous monitoring

2. **Response Time Performance**
   - **Baseline:** Current systems varied 3-8 seconds
   - **Target:** <2 sekundy pro 95% transakcí

3. **Error Rate**
   - **Baseline:** Current ~0.5%
   - **Target:** <0.1%

4. **Integration Success Rate**
   - **Target:** >99.5%
   - **Measurement:** API gateway monitoring

### Process KPIs:

1. **Compliance Review Time**
   - **Baseline:** Current average 2-3 days
   - **Target:** ≤1 day

2. **Customer Onboarding Completion Rate**
   - **Baseline:** Current ~85%
   - **Target:** >95%

3. **Multi-channel Consistency**
   - **Target:** 100% consistent functionality

### Measuring Methods:

- **Real-time:** System performance, Availability, Error rates
- **Daily:** Data quality metrics, Transaction volumes
- **Weekly:** Process efficiency, User adoption rates
- **Monthly:** Cost metrics, Compliance metrics
- **Quarterly:** User satisfaction, Business impact assessment

---

## Závěr

Tento dokument představuje komplexní analýzu požadavků pro konsolidaci dotazníkových aplikací banky. Implementace sjednocené platformy přinese významné výhody v podobě zlepšené uživatelské zkušenosti, snížených nákladů a lepší compliance. Úspěch projektu závisí na pečlivém dodržení definovaných požadavků, acceptance criteria a kontinuálním monitorování klíčových metrik.

**Klíčové faktory úspěchu:**
- Silná podpora managementu
- Efektivní change management
- Kvalitní testování a validace
- Postupná implementace s možností rollback
- Kontinuální monitoring a optimalizace