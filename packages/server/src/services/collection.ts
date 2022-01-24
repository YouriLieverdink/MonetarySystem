import _ from 'lodash';

export class Collection<T> {
    /**
     * The items in collection.
     */
    private _items: T[];

    /**
     * Class constructor.
     */
    constructor() {
        this._items = [];
    }

    /**
     * Gets the internal items.
     */
    public get items(): T[] {
        return [...this._items];
    }

    /**
     * Adds the item(s) to the collection.
     * 
     * @param items The item(s) to add.
     */
    public add(...items: T[]): void {
        items.forEach((item) => {
            const exists = this._items.some((i) => _.isEqual(item, i));
            if (exists) return;

            this._items.push(item);
        });
    }

    /**
     * Removes the item(s) from the collection.
     * 
     * @param items The item(s) to remove.
     */
    public remove(...items: T[]): void {
        items.forEach((item) => {
            _.remove(this._items, (i) => _.isEqual(item, i));
        });
    }

    /**
     * Returns a random item from the collection.
     */
    public random(): T | null {
        if (this._items.length === 0) return null;
        return _.sample(this._items);
    }

    /**
     * Removes the first item of the collection.
     */
    public shift(): T | null {
        if (this._items.length === 0) return null;
        return this._items.shift();
    }
}