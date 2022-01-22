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
     * Getter for the items.
     */
    public get items(): T[] {
        return [...this._items];
    }

    /**
     * Returns the size of the collection.
     */
    public get size(): number {
        return this._items.length;
    }

    /**
     * Adds an item to the collection. Note: duplicates are not added.
     * 
     * @param item The item to add.
     */
    public add(item: T): void {
        // Don't add when the item already exists.
        const exists = this._items.some((i) => _.isEqual(item, i));
        if (exists) return;

        this._items.push(item);
    }

    /**
     * Removes an item from the collection.
     * 
     * @param item The item to remove.
     */
    public remove(item: T): void {
        const index = this._items.indexOf(item);
        if (index !== -1) {
            this._items.splice(index, 1);
        }
    }

    /**
     * Gets a random item from the collection.
     */
    public random(): T {
        if (this.size === 0) return null;
        return _.sample(this._items);
    }
}