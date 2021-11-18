# Software Architecture Document

## 1. Introduction  

### 1.1 Goal  
The goal of the project is creating an application for a monetary cryptocurrency system. This system can be compared to other cryptocurrency systems like Bitcoin. Ethereum and other cryptocurrency. Creating a new cryptocurrency must meet many requirements before it can be counted as a valid cryptocurrency. In order to tackle all the requirements, ensuring the goals and concerns of the stakeholders is met, complete and relevant, it is of great importance to get a clear overview of the architecture. Hence this document will focus on giving a clear overview of the architecture of the application for the monetary system (cryptocurrency). 

### 1.2 Scope  
The scope of the project is defined in this section. It is important to get a clear view of the scope of the project in order to get an idea of what is in the project and what is not, and what the product should accomplish and what not. While doing this, there must be taken into account that the scope will not get to large, which would make the project unfeasible, and neither too small, which would lead to an insufficient basis for tackling all the requirements. A wrong scope would lead to delays and unrealizable affairs. Therefore the scope is established in this section in order to define the boundaries and the size of the project.

### 1.2.1 Boundaries  
The assignment gives a few boundaries for the project. These are stated below:

- no Proof-of-Work algorithm;
- no large keys;
- a limited number of nodes;
- users don't have to stay anonymous;
- soft forks and backward compatibility is no requirement;
- messages are not in binary format;
- a virtual machine for the verifying of smart contracts is not necessary;

### 1.2.2 Size  
The final product needs to implement several features, which together make up the size of the product. These features are stated below:

#### 1.2.2.1 Wallet  
The application needs to implement a wallet, which is a web-client that uses services from a network-node. Every wallet, which is interacted with by the user, is connected to exactly one node. Every account number must be unique and users must be able to ask for one or more account numbers. Users do not have to be anonymous. A user must be able to transfer money, receive money and see a history of transactions.

#### 1.2.2.2 Transactions & Ledger  
Transactions need to have an unique ID and respresented in JSON-format. Transactions have to be authenticated and its integrity checked in order to optimize security. Missing transactions in a chain of transactions have to be detected and be able te requested. New coins should be able to be introduced in the system.

All the transactions have to be placed in the ledger. This ledger is accessible for every node and every node should be able to copy and save that copy of the ledger. The ledger also has to gurantee the integrity of transactions. The validation must be efficient, so validation will be based on proof-of-stake. Validated transaction are final and thus immutable. 

#### 1.2.2.3 P2P network and protocol  
All nodes in the system are peers, which means they are equal and decentralized. Every node is connected to other nodes via a gossip-protocol. When a node is started up there needs to be a root node to find the IP-addresses of several first nodes. A node after starting up will try and get a copy of the ledger. A node keeps a record of all transactions and account numbers that belong to the user of that node. Nodes can sign up and off, can send messages to each other and receive messages. 

### 1.3 Status  
We are currently in the planning phase of the project. We have set up a basic architecture of a single node which will be used to contruct the peer-to-peer network. The current implementation resolves a gossip-protocol based chatting system.  
This document will be updated throughout the implementation of the final product. It may be revised multiple times in order to stay up-to-date with changes in requirements and policies.

## 2. Requirements  
The three most important non-functional requirements are scalability, security and reliability. 
Scalability is a large part of the project, as the network must be able to support up to a number of 3.2 million nodes. More nodes also means more decentralization, which can build trust for its users. Another non-functional requirement is the security, which should go without saying. Network participants must not be able to perform actions they're not autorised to do. In addition to these two requirements there's reliability. The network should operate like expected and not in any way that could compromise users' funds or trust in the network in any way.

## 3. Architectural Views  

### 3.1 Context View  
![contextDiagram](https://user-images.githubusercontent.com/43604037/140753529-899f4d5a-1215-4f09-9973-55decbb3cae8.jpg)

In the context diagram is visible that the only external party for this system is the user. This is the characteristic of a blockchain. In the wallet application the user can find all transactions of the blockchain and their own amount of currency. It is also possible to control the node witht the wallet aplication. So make transactions on the blockchain. The scope of this project is making nodes that can communicate with eachother and a wallet application that makes control of the node more userfriendly. 

### 3.2 Functional View  
{{
Place a functional model here (e.g. a UML component diagram) and explain its content in the subsections below. A functional element is a well-defined part of the runtime system that has particular functional responsibilities and exposes interfaces that connect it to other functional elements.
Focus on the important functional elements in your architecture. In general you should not model the underlying infrastructure here unless it performs a functionally significant purpose (for example a message bus that links system elements and transforms data exchanged between them).
If your architecture is functionally complex you may choose to model it at a high level and then decompose some elements in further sub-models (functional decomposition).
}}
#### 3.2.1 Functional Elements  
{{
Define the responsibilities and interfaces offered and/or required by each functional element.  Alternatively, if you are using a modelling approach like UML you might choose to keep the main descriptions in the UML model repository and summarise the information here, referencing the model(s).
If you have used functional decomposition in the previous section, you can structure this section to align with your functional hierarchy.
}}
#### 3.2.2 Functional Scenario's  
{{
Use one or more interaction diagrams to explain how the functional elements interact, via their interfaces, in order to meet some of the key system functional scenarios.
}}
### 3.3 Information View  
{{
Define or reference any architecturally significant data structures for stored and transient data, such as overview data models or message schemas.
At this level you should keep the number of entities small – no more than 20 or so if possible. It is not necessary to be 100% normalised – for the sake of clarity it is acceptable to have some many-to-many relationships for example. Don’t try and illustrate every entity and relationship here or your readers will get lost in the detail.
It may also be useful to logically group entities together that are semantically related in some way – for example, all data related to customer name and address. This may help your readers to understand the data items and the relationships between them.
Here is an example data structure model which uses classic ERD notation. You can also use class diagrams here although that may be too granular a level of detail for an AD.  An alternative, should you wish to use UML, is to illustrate the information structure at the package, rather than the class, level.
}}
### 3.4 Development View  

#### 3.4.1 Module Structure  
The image shown below show a simple representation of the modules that the applications consist of.
![Module Structure](https://user-images.githubusercontent.com/45830064/141842914-c178e09c-6395-462c-a915-96aae40bbb07.jpg)

#### 3.4.2 Standards for Design, Code and Test  
Development will take place in a Test driven approach, in order to ensure code validity. The code written for this project should adhere as much as pssible to the SOLID principles, so the code becomes understandable, extensible and easier to test. 
The SOLID principles are as follows:
- Single responsibility principle, meaning that classes or methods should not fulfill multiple roles.
- Open-closed principle, which means that an implementation should be extendable, while not breaking existing functionality or tests
- Liskov substitution principle. Simply put, this principle means that subclasses should work correctly where objects of a parent are required.
- Interface segregation principle. In short, interfaces should only contain the bare minimum it needs to serve its purpose.
- Dependency inversion principle, which means that interfaces should be used where mocks could be used instead of actual implementations, often for testing purposes.
