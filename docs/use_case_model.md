# 1 - Use cases

| Use case 1         |                                                                                                      |
|--------------------|------------------------------------------------------------------------------------------------------|
| Name               | Wallet setup                                                                                         |
| Summary            | User needs to be able to create a wallet (obtain public address and private keys)                    |
| Result             | User has a wallet (public address for receiving funds and private keys for authorizing transactions) |
| Base scenario      | 1. User requests new wallet<br>2. App provides user with generated private key and a public key      |
| Alternate scenario | 1. User requests new wallet<br>2. App provides user with generated private key and a public key      |


| Use case 2    |                                                                |
|---------------|----------------------------------------------------------------|
| Name          | View balance                                                   |
| Summary       | User needs to be able to view wallet balance                   |
| Result        | User sees wallet balance                                       |
| Base scenario | 1. User requests wallet balance<br>2. App shows wallet balance |

| Use case 3    |                                                                                      |
|---------------|--------------------------------------------------------------------------------------|
| Name          | View past transactions                                                               |
| Summary       | User needs to be able to view all past transactions in which the wallet was involved |
| Result        | User sees all relevant transactions                                                  |
| Base scenario | 1. User requests transactions<br>2. App shows relevant transactions                  |

| Use case 4    |                                                                                                           |
|---------------|-----------------------------------------------------------------------------------------------------------|
| Name          | Running a node                                                                                            |
| Summary       | Users need to be able to run a node that has a copy of the ledger and validates transactions              |
| Result        | Transactions get validated/rejected and the node operator gets rewarded with new coins                  |
| Base scenario | 1. User runs node and validates transactions<br>2. User gets receives rewards for validating transactions |

| Use case 5     |                                                                                                                  |
|----------------|------------------------------------------------------------------------------------------------------------------|
| Name           | Send/receive coins to/from other users                                                                           |
| Summary        | Users need to be able to send coins to another wallet and receive coins from other wallets                       |
| Result         | Coins move from Wallet A to Wallet B                                                                             |
| Base scenario  | 1. Wallet A sends coins to Wallet B<br>2. Transaction gets validated<br>3. Wallet B receives coins from Wallet A |
| Error scenario | 1. Wallet A sends coins to Wallet B<br>2. Transaction gets rejected<br>3. Wallet B doesn't receive coins         |


# 2 - Use case diagram
| ![usecasemodel3](https://user-images.githubusercontent.com/43604037/136422367-8e00fcb2-cf47-41c7-9f3b-d535aad6d75d.PNG) | 
|:--:| 
| *Figuur 1 - Use case diagram van de titrium blockchain* |
