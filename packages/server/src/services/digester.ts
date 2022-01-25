import {cEvent} from "./consensus";

export class Digester<T> {

    /**
     * Digests all the events that have reached consensus
     *
     * @param events All events that are not yet processed and have reached consensus
     *
     */
    public digest(events: cEvent<T>[]): void {

    }

    /**
     * Checks if a transaction from a consensus event can be made
     *
     * @param events All events
     *
     */
    private validate(events: cEvent<T>[]): void {

    }

    /**
     * updates the state depending on a validated transaction
     *
     * @param events All events
     *
     */
    private updateState(events: cEvent<T>[]): void {

    }

    /**
     * Makes sure all the events go in the database
     *
     * @param events All events
     *
     */
    private mirror(events: cEvent<T>[]): void {

    }



}