# Acceptatieplan

## 1. Inleiding

### 1.1 Doel
Als project wordt er gewerkt aan een applicatie voor een monetair systeem. Dit systeem kan worden vergeleken met andere monetaire systemen als Bitcoin, Ethereum en andere cryptocurrency. Een cryptomunt heeft een aantal belangrijke eisen waar het aan moet voldoen voor het als geldige cryptocurrency kan worden gebruikt. Dit acceptatieplan is daarom opgesteld om een meetbare basis te leveren voor het testen en accepteren van het geleverde product. Hierin is vastgelegd welke afspraken zijn gemaakt aangaande het testen en accepteren van het opgeleverde monetaire systeem. Tevens zijn in dit document de verantwoordelijkheden van alle betrokken partijen vastgelegd. 

### 1.2 Referenties

## 2. Verantwoordelijken

## 3. Criteria

### 3.1 Performance
Performance is een belangrijk aspect tijdens de ontwikkeling van elk software product. Ondanks dat een product met een lage performance wel kan werken, is dit zeker niet gewenst. Men wil bijvoorbeeld bij gebruik van een applicatie als Instagram of Thuisbezorgd niet uren wachten totdat de applicatie geladen wordt. Zo zal men in het geval van dit project niet uren willen wachten voordat transacties gevalideerd worden. Daaruit voortvloeiend zijn er acceptatie criteria opgesteld betreffende de performance om zo een meetbare basis te verstrekken waaraan de applicatie moet voldoen.

#### 3.1.1 Transacties
Elke transactie moet op basis van consensus van de meerderheid gevalideerd worden door een node en toch efficiënt plaatsvinden (geen 'Proof-of-Work' algoritme). Efficiënt in deze zin wil zeggen dat ...


### 3.2 Beheerbaarheid

#### 3.2.1 Unit tests
Er wordt testcode geschreven voor beheerbaarheid. De tests moeten er voor zorgen dat er een check wordt gedaan op alle criteria. Deze tests moeten eraan voldoen dat bij uitbreiding of verandering er nog steeds gebruik van kan worden gemaakt. 

#### 3.2.2 Documentatie
Alle code moet worden gedocumenteerd. De documentatie moet bondig en helder zijn voor de lezer. Dit houdt tevens in dat jargon uitgelegd moet worden. Dit creëert leesbare code voor de lezer waardoor de beheerbaarheid bevorderd wordt.

#### 3.2.3 Logging
Voor en in het systeem moet logging worden toegepast om gebeurtenissen, errors en functionaliteiten vast te leggen. Op deze manier worden incidenten getraceerd en kan de omgeving efficiënt beheerd blijven. De data moet eenduidig en gestructureerd bewaard worden om makkelijk te kunnen worden opgezocht. Dit houdt ook in dat de verschillende gelogde processen gescheiden opgeslagen worden.

### 3.3 Betrouwbaarheid

### 3.4 Beveiliging

### 3.5 Functionaliteit

### 3.6 Gebruiksvriendelijkheid

### 3.7 Standaarden

### 3.8 Documentatie

#### 3.8.1 Inline
Inline documentatie zal in dit project worden gebruikt om code te verduidelijken. Deze criteria zal worden toegepast op stukken code die niet zelfstandig te begrijpen zijn door een andere developer. Dit zal er uiteindelijk voor zorgen dat iedereen weet hoe de applicatie in elkaar zit.

**Eigenaar**  
Zowel de huidige als de toekomstige developers zijn eigenaar van deze criteria.

**Meetmethode**  
Deze criteria zal worden gemeten door het handmatig doorlopen van de code van andere developers. Wanneer de code, met of zonder inline documentatie, goed te begrijpen is voldoet deze criteria.

**Planning**  
Tijdens de review van elke pull-request zal deze criteria aan bod komen. De geschreven code wordt door een andere developer, de reviewer, bekenen. 

**Corrigerende acties**  
Wanneer een reviewer code onduidelijk vindt, zal deze dat aangeven bij de developer in kwestie om de code te veruidelijken met (betere) inline documentatie.

#### 3.8.2 Api  
Een node binnen het netwerk zal kunnen worden bemiddeld door het gebruik van een api. Deze api biedt mogelijkheden voor de wallet applicatie te communiceren met het netwerk. Deze api moet goed gedocumenteerd zijn om verwarringen te voorkomen.

**Eigenaar**  
Zowel de huidige als de toekomste developers zijn eigenaar van deze criteria.

**Meetmethode**  
Deze criteria zal worden gemeten op basis van een documentatie review. Eén developer zal worden aangewezen om te controleren of de documentatie overeenkomt met de daadwerkelijke implementatie van de api.

**Planning**  
Deze criteria wordt aan het eind van elke sprint uitgevoerd om zo de documentatie tijdens het project correct te houden.

**Corrigerende acties**  
Wanneer er bepaalde documentatie niet overeenkomt met de implementatie van de api moet eerst worden vastgesteld welke van de twee incorrect is. Vervolgens wordt deze dan aangepast zodat ze weer overeenkomen.

#### 3.8.3 Architectueel  
De architectuur van de hele applicatie zal moeten worden beschreven. Dit houdt in dat er een
duidelijk beeld van de architectuur moet onstaan door middel van een context diagram, use case
model en een klassediagram.

**Eigenaar**  
Zowel de huidge als de toekomstige developers zijn eigenaar van deze criteria.

**Meetmethode**  
Deze criteria zal worden gemeten op basis van het begrijpen van de architectuur door de opdrachtgever.

**Planning**  
Tijdens elke sprintdemo zal de architectuur van de huidige applicatie worden besproken om te controleren of de opdrachtgever een goed beeld heeft van de architectuur van de applicatie.

**Corrigerende acties**  
Waneer de architectuur van de applicatie niet geheel duidelijk is zullen de developers samen gaan brainstormen over waarom het niet duidelijk is. Dit kan zijn door een onduidelijk diagram of een onlogische opbouw van de architectuur zelf. Wanneer het probleem naar voren is gekomen wordt er een passende oplossing toegepast.
