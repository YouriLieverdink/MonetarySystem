# Vision

## 1. Introduction
This document will provide the vision for this project, along with a description of the end product and its purpose. In addition, this document contains an overview of the stakeholders and their involvement.

## 2. Positionering

### 2.1 Context
{{wat is de (business) context van de opdracht?
(vaak kostenbesparing door verbetering van een proces (efficiënter, goedkoper, minder
fouten), het kan ook gaan om de ‘marktkans’ van een nieuw product of dienst)}}

### 2.1.1 Technische context
{{wat is de technische technische context (graag een contextdiagram)?}}

### 2.2 Scope
{{is de scope van het project helder?}}

### 2.3 Probleemstelling
{{wat is het probleem, wat zijn de oorzaken van het probleem, voor wie is het een probleem?}}

{{waarom wil de opdrachtgever dit project?}}

### 2.4 Risico's
{{wat zijn de risico's?}}

## 3. Belanghebbenden
Een belanghebbende (stakeholder) is iemand die invloed ondervint of zelf invloed kan heeft op een organisatie.
belanghebbenden van de Cryptomunt opdracht zijn:

|Belanghebbenderol   |   Vertegenwoordiger   |  Betrokkenheid   |
|     ---            |        ---            |       ---        |
| Opdrachtgever      | Jacob de Boer         | Het uiteindelijke programma wordt geschreven voor de opdrachtgever. De opdrachtgever levert het project en de randvoorwaarden. |
| Leraar             | Jan Baljé             | Begeleid de projectgroep. |
| Productowner       | Youri Lieverdink      | Verantwoordelijk voor het eindproduct. Heeft contact met belanghebbenden. |
| Scrummaster        | Bart van Poele        | Zorgt dat het team zich houd aan de scrumregels. |
| Teamgenoten        | Youi Lieverdink       | De teamgenoten werken aan het project. In dit project werken de Productowner en de scrummaster ook mee.|
| Node-operators     |                       | De nodes in de blockchain die transacties uit kunnen voeren. |
| Handelaars         |                       | Kunnen de cryptocurrency kopen er in handelen. |

## 4. Perspective
This product is supposed to fit in the existing ecosystem of electronic devices like desktops, laptops and smartphones, in order to be accessible at any time and place which would be expected of any currency.

### 4.1 Proof of Concept
The purpose of the Proof of Concept is to prove to the stakeholders that the project is feasable. It will first be tested with a small number of nodes before development can be taken further to a growing number of nodes.

### 4.2 Acceptance
If all the defined functionality works reliably and the apps meets all requirements, this project will be considered to be a success

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
