# Software Architecture Document

## 1. Introduction  

### 1.1 Purpose and scope  
{{
Explain the purpose and scope of the document.
Primarily this is to document the architecture for the stakeholders, to ensure that it meets their goals and concerns and that the proposed architecture is correct, complete and fit for purpose.
While you should avoid presenting a lot of material available elsewhere, it may also be useful to do some or all of the following in the AD:
-	summarise the project context, goals and objectives
-	confirm scope and exclusions
-	present an overview of goals and drivers, requirements etc
-	record important decisions made and their rationale
-	present alternatives considered and their reasons for rejection
-	bring together other important information not captured elsewhere
}}

### 1.2 Status  
{{
Explain the current status of the architecture and of this architectural description.
Is it still in progress?  Being implemented?  In production? You may also want to describe future plans for the document (eg will be reissued as Definitive after comments received by stakeholders).
}}

## 2. Requirements
The three most important non-functional requirements are scalability, security and reliability. 
Scalability is a large part of the project, as the network must be able to support up to a number of 3.2 million nodes. More nodes also means more decentralization, which can build trust for its users. Another non-functional requirement is the security, which should go without saying. Network participants must not be able to perform actions they're not autorised to do. In addition to these two requirements there's reliability. The network should operate like expected and not in any way that could compromise users' funds or trust in the network in any way.


## 3. Architectonisch  

### 3.1 Context  
![contextDiagram](https://user-images.githubusercontent.com/43604037/140753529-899f4d5a-1215-4f09-9973-55decbb3cae8.jpg)

In the context diagram is visible that the only external party for this system is the user. This is the characteristic of a blockchain. In the wallet application the user can find all transactions of the blockchain and their own amount of currency. It is also possible to control the node witht the wallet aplication. So make transactions on the blockchain. The scope of this project is making nodes that can communicate with eachother and a wallet application that makes control of the node more userfriendly. 

### 3.2 Functioneel  
{{
Place a functional model here (e.g. a UML component diagram) and explain its content in the subsections below. A functional element is a well-defined part of the runtime system that has particular functional responsibilities and exposes interfaces that connect it to other functional elements.
Focus on the important functional elements in your architecture. In general you should not model the underlying infrastructure here unless it performs a functionally significant purpose (for example a message bus that links system elements and transforms data exchanged between them).
If your architecture is functionally complex you may choose to model it at a high level and then decompose some elements in further sub-models (functional decomposition).
}}
#### 3.2.1 Elementen
{{
Define the responsibilities and interfaces offered and/or required by each functional element.  Alternatively, if you are using a modelling approach like UML you might choose to keep the main descriptions in the UML model repository and summarise the information here, referencing the model(s).
If you have used functional decomposition in the previous section, you can structure this section to align with your functional hierarchy.
}}
#### 3.2.2 Scenario's
{{
Use one or more interaction diagrams to explain how the functional elements interact, via their interfaces, in order to meet some of the key system functional scenarios.
}}
### 3.3 Informatie  
{{
Define or reference any architecturally significant data structures for stored and transient data, such as overview data models or message schemas.
At this level you should keep the number of entities small – no more than 20 or so if possible. It is not necessary to be 100% normalised – for the sake of clarity it is acceptable to have some many-to-many relationships for example. Don’t try and illustrate every entity and relationship here or your readers will get lost in the detail.
It may also be useful to logically group entities together that are semantically related in some way – for example, all data related to customer name and address. This may help your readers to understand the data items and the relationships between them.
Here is an example data structure model which uses classic ERD notation. You can also use class diagrams here although that may be too granular a level of detail for an AD.  An alternative, should you wish to use UML, is to illustrate the information structure at the package, rather than the class, level.
}}
### 3.4 Development  

#### 3.4.1 Structuur  
{{
Use a model that defines the code modules that will be created and the dependencies between them.  A UML package diagram is often an effective way to achieve this.
}}

#### 3.4.2 Standaarden  
{{
Define any standards that must be followed for design, code and unit testing, probably by reference to an external document.

Hier kan tdd mooi worden beschreven voor het gebruik binnen het project.
}}


