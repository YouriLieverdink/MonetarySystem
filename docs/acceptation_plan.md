# Acceptation plan

## 1. Introduction

### 1.1 Goal
During this project there will be worked on building an application for a monetary system, in this case a cryptocurrency. This system can be compared with other monetary systems like Bitcoin, Ethereum and other cryptocurrencies. A cryptocoin has several important requirements that it must meet in order for it to be used as a valid cryptocurrency. This acceptationplan is therefore set up to give a measurable basis for the testing and accepting of the delivered product. In this document the agreements regarding the testing and accepting of the delivered cryptocurrency. Also the responsibilities of all the involved parties are captured in this document.

### 1.2 Refrences

## 2. Responsibilities

## 3. Criteria

### 3.1 Performance
Performance is a very important aspect during the development of every software product. Despite a product with a low performance can work it is certainly not desirable. People do not want to be waiting for hours for pages to load during the use of applications like Instagram or Github. In the case of this project people do not want to wait for hours before transactions are validated and completed. Resulting from this problem there are several criteria set up concerning the performance to provide a measurable basis to which the application must fulfil.

### 3.2 Manageability

#### 3.2.1 Unit tests
There will be testcode written for manageability. The tests must take care of a check on every aspect of the product and ensure everything works as it should. These test must comply to the requirement that when expanded or change the tests are still usable.

#### 3.2.2 Documentation
All code must be documented. The documentation must be concise and clear for the reader. This implies that slang must be explained. This creates readable code for the reader ensuring more advanced manageability.

#### 3.2.3 Logging
For and in the system logging must be applied to capture events, errors and functionalities. In this way incidents will be traced and the environment will stay efficiently manageable. The data must be saved unambiguously and structured in order to be easily accessed. This also means that the different logged processes need to be saved seperately.

### 3.3 Reliability
A blockchain has to be available at all times to assure the data is not altered. A large part of the blockchain needs to be up to assure integerity. Because of this an update cannot be pushed. It is possible to gradually install updates. The versions will be saved with a vesion control service. So if theres an error in a version the other versions can be used.

The Reliability of the data itself will come with the size of the blockchain. A transaction is accepted when more than 50 percent agrees that the transaction is valid. When the blockchain has a reasenable size we can assume that the transaction is reliable.

**Owner**
The developers are responsible for the use of version control and testing the reliability of the code. The nodes in the blockchain will asure the reliability of the data. 

**easurement method**
This criteria will be measure by looking at the regularity of updating the version control. The code will be tested thoroughly. It is not acceptable to have devestating bugs in the code. The number of nodes will be monitored. 

**Planning**
During the coding phase the written code will be tested to assure the quality and the reliability. 

**Corrective actions**
When any bugs occur this can be fixed before deploying the code. By making sure the blockchain has a reasenable size we decrease the chance of someone with bad intensions having any wrong influence.

### 3.4 Security
The account numbers will be keys of 32 bits. A strong password contains letts, numbers, symbols and is atleast 16 characters. If a password is wrong 3 times logging in will be blocked for a certain amount of time to prefent brute-force attacks.

**Owner**
The developers are responsible for programming the security measures.

**easurement method**  
To measure the security the team will try to break in to their own system and try to find weaknesses.

**Planning**  
Veiligheid is zeer belangrijk en zal bij het implementeren uitgebreid met het team besproken worden. In de laatste sprint wordt de beveiliging getest. 

**Corrective actions**  
When a weak point in the security is found this has to be fixed as fast as possible. This is possible with different or more security measures.  

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

### 3.7 Documentation

#### 3.7.1 Inline
Inline documentation will be used in this project to make code more understandable. This criteria will be applied to code that is not understandable on its own. This will make sure that everyone understands how the application works.

**Owner** 
The current and future developers will be the owners of this criteria.

**Measurement method**
This criteria will be measured by manually run trough the code of other developers. When the code with or without inline documentation is understandable it satisfies this criteria.

**Planning**  
This criteria is being audited during the review of every pull-request. The written code will be watched by another developer, the reviewer. 

**Corrective actions**  
When a reviewer thinks the code is too unclear he will notify the developer in question to clearup the code with better inline documentation.

#### 3.7.2 Api 
A node in the network will be mediated by using the api. This api gives possibilities for the wallet application to cummunicate with the network. This api has to be documented well to prefent confusion. 

**Owner**
Current and future developers are owner of this criterion.

**Measurement method**
This criteria will be measure based on a documentation review. A developer will be assigned to control if the documentation matches the actual implementation of the api.

**Planning**  
Deze criteria wordt aan het eind van elke sprint uitgevoerd om zo de documentatie tijdens het project correct te houden.

**Corrective actions**
When certain documentation does not match the implementaion of the api it has to be established which of the two is wrong. After that this will be fixed so both the documentation and the api match. 

#### 3.7.3 Architectural
The architecture of the whole application has to be described. This means that there has to be a clear picture of the architecutre by using different diagrams like: Context diagram, Use case diagram and a class diagram.

**Owner**
Current and future developers are owner of this criterion.

**Measurement method**  
This criteria will be measured based on the clients understanding of the architecture.

**Planning**  
During every spinrtdemo the architecture of the current application will be discussed to control if the client has a good image of the applications architecture.

**Corrective actions** 
When the architecture of the application is not completely clear the decelopers will brainstorm about why it is unclear. This can be because of a diagram being too unclear or a illogical structure of the architecture itself. When the problem occurs there will be acted acordingly. 
