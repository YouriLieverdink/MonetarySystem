import { Digester } from './digester';
import {cEvent} from "./consensus";

describe('Consensus', () => {
    let events: cEvent<never>[];

    beforeAll(() => {
        //create test events
        events = [];
    });

    describe('digest', () => {

        it('validates transactions', () => {
            //TODO
        });

        it('updates states in database', () => {
            //TODO
        });

        it('if mirror node put all events in database', () => {
            //TODO
        });
    });
});