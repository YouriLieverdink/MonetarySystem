import { ConsensusService } from '.';
import { Event, Transaction, Node} from '../../types';
import { createHash } from 'crypto';

describe('ConsensusService', () => {

    let consensus: ConsensusService;
    let events: Event[];
    let nodes: Node[];

    beforeEach(() => {
        consensus = new ConsensusService();
        events = [];
        nodes = [];

        nodes = [
            { host: '123.123.123.123', name: 'hostMock' },
            { host: '123.123.123.123', name: 'hostMock' },
            { host: '123.123.123.123', name: 'hostMock' },
            { host: '123.123.123.123', name: 'hostMock' }
        ];

        const transaction: Transaction = {
            node: nodes[0],
            from: '11AA',
            to: '22BB',
            amount: 2
        };

        //3 join events
        const event0: Event = { type: 'join', signature: 'signatureA', selfParent: '', otherParent: '', date: new Date(2022, 1, 1, 1, 1, 1), data: transaction, consensusReached: false, creator: 'A' };
        const event1: Event = { type: 'join', signature: 'signatureB', selfParent: '', otherParent: '', date: new Date(2022, 1, 1, 1, 1, 2), data: transaction, consensusReached: false, creator: 'B' };
        const event2: Event = { type: 'join', signature: 'signatureC', selfParent: '', otherParent: '', date: new Date(2022, 1, 1, 1, 1, 3), data: transaction, consensusReached: false, creator: 'C' };
        //A sends to B, B creates new event
        const event3: Event = { type: 'transaction', signature: 'signatureB', selfParent: String(createHash('sha256').update(JSON.stringify(event1)).digest('hex')), otherParent: String(createHash('sha256').update(JSON.stringify(event0)).digest('hex')), date: new Date(2022, 1, 1, 1, 1, 4), data: transaction, consensusReached: false, creator: 'B' };
        //B sends to A, A creates new event
        const event4: Event = { type: 'transaction', signature: 'signature', selfParent: String(createHash('sha256').update(JSON.stringify(event0)).digest('hex')), otherParent: String(createHash('sha256').update(JSON.stringify(event3)).digest('hex')), date: new Date(2022, 1, 1, 1, 1, 5), data: transaction, consensusReached: false, creator: 'A' };
        //A sends to C, C creates new event
        const event5: Event = { type: 'transaction', signature: 'signature', selfParent: String(createHash('sha256').update(JSON.stringify(event2)).digest('hex')), otherParent: String(createHash('sha256').update(JSON.stringify(event4)).digest('hex')), date: new Date(2022, 1, 1, 1, 1, 6), data: transaction, consensusReached: false, creator: 'C' };
        events.push(event0);
        events.push(event1);
        events.push(event2);
        events.push(event3);
        events.push(event4);
        events.push(event5);
    });

    describe('see', () => {
        it('should check if event x can see event y', async () => {
            expect(consensus.core.see(events[3], events[5], events)).toBeFalsy();
            expect(consensus.core.see(events[5], events[3], events)).toBeTruthy();
        });
    });

    describe('ancestor', () => {
        it('should check if event y is an ancester of x', async () => {
            expect(consensus.core.ancestor(events[3], events[5], events)).toBeFalsy();
            expect(consensus.core.ancestor(events[5], events[3], events)).toBeTruthy();
        });
    });

    describe('selfAncestor', () => {
        it('should check if event y is an selfAncester of x', async () => {
            expect(consensus.core.selfAncestor(events[2], events[5], events)).toBeFalsy();
            expect(consensus.core.selfAncestor(events[3], events[5], events)).toBeFalsy();
            expect(consensus.core.selfAncestor(events[5], events[2], events)).toBeTruthy();
        });
    });

    describe('getParent',   () => {
        it('should return the parent of the event', async () => {
            expect(consensus.core.getParent(events[5], events, true)).toEqual(events[4]);
            expect(consensus.core.getParent(events[5], events, false)).toEqual(events[2]);
        });
    });

    describe('superMajority',   () => {
        it('should return if the number give is equal or more than the super majority', async () => {
            expect(consensus.core.superMajority(4, 3)).toBeTruthy();
            expect(consensus.core.superMajority(4, 2)).toBeFalsy();
        });
    });

    describe('canStronglySee',   () => {
        it('should return if the number give is equal or more than the super majority', async () => {
            expect(consensus.core.canStronglySee(events, events[5], events[3], 3)).toBeTruthy();
            expect(consensus.core.canStronglySee(events, events[5], events[4], 3)).toBeFalsy();
        });
    });
});