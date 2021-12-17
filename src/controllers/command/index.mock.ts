import { CommandController } from './';
import { Address } from '../../types/address';
import { State } from '../../types/state';
import { Transaction } from '../../types/transaction';

const mock_addresses: Address[] = [{
    publicKey: 'public_key1',
    privateKey: 'private_key1',
    isDefault: true
}]

const mock_transactions: Transaction[] = [{
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

const mock_states: State[] = [{
    publicKey: 'public_key1',
    amount: 5,
    date: new Date()
}]

export const commandControllerMock: CommandController = {
    addresses: {
        getAll: (): Address[] => mock_addresses,
        create: (): Address => mock_addresses[0],
        import: (privateKey: string): boolean => true,
        remove: (publicKey: string): boolean => true,
    },

    transactions: {
        getAll: (publicKey: string): Transaction[] => mock_transactions,
        create: (publicKeySender: string, publicKeyReceiver: string, amount: number): boolean => true,
    },

    balances: {
        getAll: (): State[] => mock_states,
        get: (publicKey: string): State => mock_states[0],
    },

    mirror: {
        set: (value: boolean): boolean => true,
    },
}