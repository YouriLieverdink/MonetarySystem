# Vision

## 1. Introduction
This document will provide the vision for this project, along with a description of the end product and its purpose. In addition, this document contains an overview of the stakeholders and their involvement.

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
<img width="644" alt="Screenshot 2021-11-18 at 10 22 24" src="https://user-images.githubusercontent.com/89806453/142391169-d4cf42e0-6bc1-4b8b-8a22-b5ebedca19fd.png">

### 4.2 Proof of Concept
The purpose of the Proof of Concept is to prove to the stakeholders that the project is feasable. It will first be tested with a small number of nodes before development can be taken further to a growing number of nodes.

### 4.3 Acceptance
If all the defined functionality works reliably and the apps meets all requirements, this project will be considered to be a success

### 4.4 Global schedule  
![Product RoadMap-3](https://user-images.githubusercontent.com/89806453/142391091-d5ceb127-30fe-4bb4-a398-7bd15686575f.png)

### 5. Product features
This chapter provides the most important product features.

Unlike bitcoin, this crypto currency will not use the Proof-of-Work algorithm but Proof-of-Stake. This is a less resource-consuming way of validating transactions and securing the network. Besides, the network needs to scalable up to a number of 3.2 million nodes, which would consume a lot of energy if it were to use the Proof-of-Work algorithm. 
In order to create a wallet the user will need to set up a node. Each node needs to keep up the ledger, the history of all transactions, in order to stay up to date and be able to validate transactions. The ledger is publicly visible to anyone plugged into the network. This way other nodes can see if their ledgers match that of others and if there are bad actors.

## 6. Other requirements

### 6.1 Non-Functional Requirements

- Use of 32 bit keys.
- Every user can have one or more account numbers.
- Every account hash is unique.
- Authentication and integerity of transactions have to be guaranteed.
- Validating needs to be efficient. (Transaction validation uses the Proof-of-Stake algorithm)
- Transactions that are not verified get deleted from the network.
- Validated transactions are immutable.
- Scaling possible up to 3.2 million nodes.
- Scaling possible up to 64.000 transactions.
- Atleast 32 network nodes.

### 6.2 Conditions
- No proof of work.
- Ssers don’t have to be anonymous.
- Every transaction has to be unique.
- Transacations and messages have to be in JSON.
- Only transfer money that is owned.
- Only transfer money once.
- Messages with the best-effort principle.

### 6.3 Documentation requirements
The documentation needs to be handed in and is the reponsibility of the development team. The documents make sure all decisions about the project are clear. 
* Acceptance plan
* Context model
* SAD  
* Use case model
* Vision
* Architectural document that explains:
  * User interface 
  * Network node
  * Network functions
  * Network protocol
* Risk document
  * Scalability 
  * Availlability 
  * Security
