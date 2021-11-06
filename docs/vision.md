# Vision

## 1. Introduction  
This purpose of this vision document is to describe the shared understanding between the client and the development team on the assignment.

## 2. Position  

### 2.1 Business context  
A popular implementation of a monetary system without a central authority is Bitcoin which was published by Satoshi Nakamoto. To ensure the integrity of the blockchain, a Proof-of-Work (PoW) algorithm is used. This implementation has proven to be highly secure when at least half of the network has good intentions. However, the execution of this PoW algorithm uses many resources. 

The purpose of this project is to observe and resolve the problems which occur when a monetary systems lacks a central authority. Besides these problems, a solution must be seeked as to how a monetary system can be developed without the use of excessive resources.

### 2.2 Problems  
As aforementioned, Bitcoin uses a PoW algorithm to secure the integrity of the blockchain. This is a cryptographic algorithm which ensures that every block added to the chain must be processed for an average of ten minutes. During these ten minutes, every node who choses to do so, attempts to solve the crypotgraphic problem with costs enormous amounts of resources. A study in September 2021 calculated to whole blockchain industry contributes to 0.5% of the global power usage. This is roughly the same as seven times the power usage of Google. So, Bitcoin contributes immensly to the global warming problems we are facing as a humanity.

### 2.3 Scope  
The implementation of a monetary systems will look a lot like the popular coin Bitcoin which also uses a blockchain. However, there is only large difference, our implementation will not use a PoW algorithm to secure the integrity of the chain. In addition to the lack of a PoW algorithm, other important differneces are:
* The size of the public and private keys can be 8 bits instead of the 8 bytes used in Bitcoin.
* The blockchain must only be able to handle 32 nodes within the network. However, it must be able to scale to 3.2 million if required.
* Users are not required to be kept anonymous.
* The transactions stored on the blockchain are not required to be in binary format which allows for an easier development process. 

### 2.4 Risks  
{{ What are the risks? }}

## 3. Stakeholders  

| Role             | Representative   | Involvement                                                                                         |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| Client           | Jacob de Boer    | The final product is being developed for the client. He delivered the project and the requirements. |
| Lecturer         | Jan Baljé        | Guides the development team during the semester.                                                    |
| Product owner    | Youri Lieverdink | Responsible for the final product and has contact with the stakeholders.                            |
| Scrum master     | Bart van Poele   | Ensures the scrum practices are followed and executed correctly.                                    |
| Development team | Youi Lieverdink  | The development team works on the product. This includes the product owner and the scrum master.    |  |
| Traders          | -                | Purchase the coins and trade with others.                                                           |

## 4. Perspective  

### 4.1 Tecnical context  
{{ Describe the technical context using a context diagram }}

### 4.2 Proof of concept  
{{ What are we going to demonstrate with our proof of concept? }}

### 4.3 Acceptation  
{{ When is the project complete? }}

### 4.4 Global schedule  
{{ Roadmap }}