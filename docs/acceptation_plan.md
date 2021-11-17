# Acceptatieplan

## 1. Inleiding

### 1.1 Doel 
During this project there will be worked on building an application for a monetary system, in this case a cryptocurrency. This system can be compared with other monetary systems like Bitcoin, Ethereum and other cryptocurrencies. A cryptocoin has several important requirements that it must meet in order for it to be used as a valid cryptocurrency. This acceptationplan is therefore set up to give a measurable basis for the testing and accepting of the delivered product. In this document the agreements regarding the testing and accepting of the delivered cryptocurrency. Also the responsibilities of all the involved parties are captured in this document.

### 1.2 Referenties

## 2. Verantwoordelijken

## 3. Criteria

### 3.1 Performance
Performance is a very important aspect during the development of every software product. Despite a product with a low performance can work it is certainly not desirable. People do not want to be waiting for hours for pages to load during the use of applications like Instagram or Github. In the case of this project people do not want to wait for hours before transactions are validated and completed. Resulting from this problem there are several criteria set up concerning the performance to provide a measurable basis to which the application must fulfil.

### 3.2 Beheerbaarheid

#### 3.2.1 Unit tests
There will be testcode written for manageability. The tests must take care of a check on every aspect of the product and ensure everything works as it should. These test must comply to the requirement that when expanded or change the tests are still usable.

#### 3.2.2 Documentatie
All code must be documented. The documentation must be concise and clear for the reader. This implies that slang must be explained. This creates readable code for the reader ensuring more advanced manageability.

#### 3.2.3 Logging
For and in the system logging must be applied to capture events, errors and functionalities. In this way incidents will be traced and the environment will stay efficiently manageable. The data must be saved unambiguously and structured in order to be easily accessed. This also means that the different logged processes need to be saved seperately.

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
