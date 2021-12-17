import { CommandController } from './';
import { Address } from '../../types/address';
import { State } from '../../types/state';
import { Transaction } from '../../types/transaction';

const mockAddresses: Address[] = [{
    publicKey: 'public_key1',
    privateKey: 'private_key1',
    isDefault: true
}]

const mockTransactions: Transaction[] = [{
    amount: 10,
    from: 'public_key_sender1',
    to: 'public_key_receiver2',
    node: {
        host: 'ip:port',
        name: 'node1'
    }
}, {
    amount: 5,
    from: 'public_key_sender1',
    to: 'public_key_receiver3',
    node: {
        host: 'ip:port',
        name: 'node1'
    }
}]

const mockStates: State[] = [{
    publicKey: 'public_key1',
    amount: 5,
    date: new Date()
}]

export const commandControllerMock: CommandController = {
    addresses: {
        getAll: (): Address[] => mockAddresses,
        create: (): Address => mockAddresses[0],
        import: (_privateKey: string): boolean => true,
        remove: (_publicKey: string): boolean => true,
    },

    transactions: {
        getAll: (_publicKey: string): Transaction[] => mockTransactions,
        create: (_publicKeySender: string, _publicKeyReceiver: string, _amount: number): boolean => true,
    },

    balances: {
        getAll: (): State[] => mockStates,
        get: (_publicKey: string): State => mockStates[0],
    },

    mirror: {
        set: (_value: boolean): boolean => true,
    },
}