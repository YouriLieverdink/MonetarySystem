import { ConsensusService } from '.';
import { Event, Transaction, Node } from '../../types';
import { createHash } from 'crypto';

describe('ConsensusService', () => {

    let consensus: ConsensusService;
    let events: Event[];

    beforeEach(() => {
        consensus = new ConsensusService();
        events = [];

        const node: Node = {
            host: '1.1.1.1.1',
            name: 'Jasper Sikkema',
        };

        const transaction: Transaction = {
            node: node,
            from: '11AA',
            to: '22BB',
            amount: 2,
        };

        //3 join events
        const event1: Event = { type: 'join', signature: 'signatureA', selfParent: '', otherParent: '', date: new Date(2022, 1, 1, 1, 1, 1), data: transaction, consensusReached: false };
        const event2: Event = { type: 'join', signature: 'signatureB', selfParent: '', otherParent: '', date: new Date(2022, 1, 1, 1, 1, 2), data: transaction, consensusReached: false };
        const event3: Event = { type: 'join', signature: 'signatureC', selfParent: '', otherParent: '', date: new Date(2022, 1, 1, 1, 1, 3), data: transaction, consensusReached: false };
        //A sends to B, B creates new event
        const event4: Event = { type: 'transaction', signature: 'signatureB', selfParent: String(createHash('sha256').update(JSON.stringify(event2)).digest('hex')), otherParent: String(createHash('sha256').update(JSON.stringify(event1)).digest('hex')), date: new Date(2022, 1, 1, 1, 1, 4), data: transaction, consensusReached: false };
        //B sends to A, A creates new event
        const event5: Event = { type: 'transaction', signature: 'signature', selfParent: String(createHash('sha256').update(JSON.stringify(event1)).digest('hex')), otherParent: String(createHash('sha256').update(JSON.stringify(event4)).digest('hex')), date: new Date(2022, 1, 1, 1, 1, 5), data: transaction, consensusReached: false };
        //A sends to C, C creates new event
        const event6: Event = { type: 'transaction', signature: 'signature', selfParent: String(createHash('sha256').update(JSON.stringify(event3)).digest('hex')), otherParent: String(createHash('sha256').update(JSON.stringify(event5)).digest('hex')), date: new Date(2022, 1, 1, 1, 1, 6), data: transaction, consensusReached: false };
        events.push(event1);
        events.push(event2);
        events.push(event3);
        events.push(event4);
        events.push(event5);
        events.push(event6);
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

    describe('getParent', () => {
        it('should return the parent of the event', async () => {
            expect(consensus.core.getParent(events[5], events, true)).toEqual(events[4]);
            expect(consensus.core.getParent(events[5], events, false)).toEqual(events[2]);
        });
    });
});