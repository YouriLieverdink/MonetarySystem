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
Een blockchain moet altijd beschikbaar zijn. Het is niet mogelijk om updates te pushen omdat een groot gedeelte van de blockchain omhoog moet blijven om betrouwbaarheid te garanderen. Er wordt wel gebruik gemaakt van versie beheer zodat alle versies beschikbaar zijn en er altijd een mogelijkheid is om daar naar terug te vallen als iets in de nieuwe versies verkeerd gaat. 

De betrouwbaarheid van de gegevens zelf zal komen met de grote van de blockchain. Een transactie is geaccepteerd als het door meer dan de helft van de blockchain goedgekeurt is. Als de blockchain groot genoeg is kunnen we er vanuit gaan dat een gevalideerde transactie betrouwbaar is.

**Eigenaar**
De developers zijn verantwoordelijk voor het gebruik van versie beheer en het testen van de betrouwbaarheid van de code. De nodes in de blockchain zorgen voor de betrouwbaarheid van de gegevens.

**Meetmethode**
Deze criteria zal worden gemeten door het bekijken van de regelmaat van updaten van het versiebeheer. De code zal uitgebreid worden getest. Er mogen geen bugs in de code zitten. Het aantal nodes kan worden bijgehouden. 

**Planning**
Tijdens het schrijven van de code worden er tests geschreven om de werking van de code te testen en betrouwbaarheid te garanderen. 

**Corrigerende acties**
Als er bugs zijn kan dit voor het uitrollen van de code worden verholpen. Door het vergroten van de blockchain kunnnen we de kans verkleinen dat iemand meer dan de helft van de nodes weet te verkreigen.

### 3.4 Beveiliging
De rekeningnummers worden sleutels van 32 bits. Een sterk wachtwoord bevat letters, cijfers en leestekens en is ten minste 16 tekens lang. Als een wachtwoord 3 verkeerd is ingevoerd kunnen we een ip blokkeren voor een bepaalde periode om zo brute-force aanvallen te voorkomen.

**Eigenaar**  
De developers zijn verantwoordelijk voor het inprogrammeren van beveiligings methoden. 

**Meetmethode**  
Om de veiligheid te meten is het mogelijk zelf de beveilig proberen te kraken en zwakheden te vinden.

**Planning**  
Veiligheid is zeer belangrijk en zal bij het implementeren uitgebreid met het team besproken worden. In de laatste sprint wordt de beveiliging getest. 

**Corrigerende acties**  
Wanneer een zwak punt in de beveiliging is gevonden moet dit zo snelmogelijk verholpen worden. Met andere of meer beveiligings maatregelen. 

### 3.5 Functionality
All funtionality will be assessed based on the Use Case Model when implementation is finished.

### 3.6 Usability
The setup and use of the node and wallet have to go as intuitively as possible which requires the least amount of explanation to the user. This means that a clean interface should be used and it should be clear what actions a user could and should perform in order to setup and operate a wallet and a node.
In addition, the apps on different platforms should resemble eachother so the apps don't seem unrelated.

**Owner**
Current and future developers are owner of this criterion.

**Measurement method**
This criterion is met if other team members think the apps feel intuitive and don't require much explanation.

**Planning**
During the review of a pull request the usability will be tested by at least one team member.

**Corrective actions**
In case the implementation requires too much explaination, the work will have to be re-done until it doesn't.

### 3.7 Documentatie

#### 3.7.1 Inline
Inline documentatie zal in dit project worden gebruikt om code te verduidelijken. Deze criteria zal worden toegepast op stukken code die niet zelfstandig te begrijpen zijn door een andere developer. Dit zal er uiteindelijk voor zorgen dat iedereen weet hoe de applicatie in elkaar zit.

**Eigenaar**  
Zowel de huidige als de toekomstige developers zijn eigenaar van deze criteria.

**Meetmethode**  
Deze criteria zal worden gemeten door het handmatig doorlopen van de code van andere developers. Wanneer de code, met of zonder inline documentatie, goed te begrijpen is voldoet deze criteria.

**Planning**  
Tijdens de review van elke pull-request zal deze criteria aan bod komen. De geschreven code wordt door een andere developer, de reviewer, bekeken. 

**Corrigerende acties**  
Wanneer een reviewer code onduidelijk vindt, zal deze dat aangeven bij de developer in kwestie om de code te veruidelijken met (betere) inline documentatie.

#### 3.7.2 Api  
Een node binnen het netwerk zal kunnen worden bemiddeld door het gebruik van een api. Deze api biedt mogelijkheden voor de wallet applicatie te communiceren met het netwerk. Deze api moet goed gedocumenteerd zijn om verwarringen te voorkomen.

**Eigenaar**  
Zowel de huidige als de toekomste developers zijn eigenaar van deze criteria.

**Meetmethode**  
Deze criteria zal worden gemeten op basis van een documentatie review. Eén developer zal worden aangewezen om te controleren of de documentatie overeenkomt met de daadwerkelijke implementatie van de api.

**Planning**  
Deze criteria wordt aan het eind van elke sprint uitgevoerd om zo de documentatie tijdens het project correct te houden.

**Corrigerende acties**  
Wanneer er bepaalde documentatie niet overeenkomt met de implementatie van de api moet eerst worden vastgesteld welke van de twee incorrect is. Vervolgens wordt deze dan aangepast zodat ze weer overeenkomen.

#### 3.7.3 Architectueel  
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
