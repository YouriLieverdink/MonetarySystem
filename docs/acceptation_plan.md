# Acceptatieplan

## 1. Inleiding

## 2. Verantwoordelijken

## 3. Criteria

### 3.1 Performance

### 3.2 Beheerbaarheid

### 3.3 Betrouwbaarheid

### 3.4 Beveiliging

### 3.5 Functionaliteit
De functionaliteit zal bij de afronding van de implementatie worden beoordeeld op basis van de goedgekeurde Use Case Model.

### 3.6 Gebruiksvriendelijkheid
Het opzetten en het gebruik van deze applicaties en het onderliggende netwerk moet zo gebruiksvriendelijk mogelijk verlopen. Om dat proces te vergemakkelijken is het belangrijk dat de eindgebruiker met een minimaal aantal stappen een node en een wallet kan opzetten en deze te gebruiken. 
Daarnaast is het van belang dat de gebruikersinterfaces van de verschillende apps zoveel mogelijk op elkaar lijken en dezelfde functionaliteiten bevatten en op een logische en begrijpelijke manier is ingedeeld.

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
