import {cEvent} from "./consensus";
import {Storage} from "./storage";
import {Setting} from "../types/setting";

export class Digester<T> {

    /**
     * Class constructor.
     *
     * @param storage the interface for storage
     */
    constructor(private storage: Storage) {

    }

    /**
     * Digests all the events that have reached consensus
     *
     * @param events All events that are not yet processed and have reached consensus
     *
     */
    public async digest(events: cEvent<T>[]): Promise<void> {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (this.validate(event)) {
                this.updateState(event);
            }

            if (await this.mirrorIsActive()) {
                this.mirror(event);
            }
        }
    }

    /**
     * Checks if a transaction from a consensus event can be made
     *
     * @param events All events
     * @returns boolean if the transaction is possible
     *
     */
    public validate(events: cEvent<T>): boolean {
        return true
    }

    /**
     * updates the state depending on a validated transaction
     *
     * @param events All events
     *
     */
    public updateState(events: cEvent<T>): void {
        //update state
    }

    /**
     * checks if the mirror setting is active
     *
     * @returns whether the mirror setting is active
     *
     */
    public async mirrorIsActive(): Promise<boolean> {
        const setting = await this.storage.settings.get('mirror')
        return (setting.value === 'true');
    }

    /**
     * Makes sure all the events go in the database
     *
     * @param event
     *
     */
    public mirror(event: cEvent<T>): void {
        //put event in database
    }


}