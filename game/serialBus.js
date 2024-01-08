class SerialBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Listens to an event and executes the callback when called
     * @param {string} type The event type to listen to
     * @param {function} callback The callback for the event
     */
    on(type, callback) {
        let arr = this.events.get(type);
        if(arr == null) this.events.set(type, arr = []);
        arr.push(callback);
    }

    /**
     * Removes a registered callback from the type by comparing its pointer
     * @param {string} type The event type to remove from
     * @param {function} callback The same callback that was registered
     * @returns Whether or not the callback was successfully removed
     */
    off(type, callback) {
        const callbacks = this.events.get(type) ?? [];
        for(let i in callbacks) {
            if(callbacks[i] == callback) {
                callbacks.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Propagates an event to registered callbacks under the specified type
     * @param {string} type The event type to broadcast
     * @param  {...any} params The parameters to pass to the event
     */
    emit(type, ...params) {
        for(let callback of this.events.get(type) ?? []) {
            callback(...params);
        }
    }

    /**
     * Listens to an event and immediately removes the callback when it is called
     * @param {string} type The event type to listen to
     * @param {function} callback The callback for the event
     */
    onOnce(type, callback) {
        const middleware = (...params) => {
            callback(...params);
            this.off(type, middleware);
        }
        this.on(type, middleware);
    }

    /**
     * Waits until an event is called
     * @param {string} type The event type to listen to
     * @returns A promise that resolves when the event is called once
     */
    onOnceSync(type) {
        return new Promise((res, rej) => this.onOnce(type, res));
    }

    /**
     * Appends the registered events from this bus to another bus and homogenizes references
     * @param {SerialBus} other The bus to merge with
     */
    merge(other) {
        for(const [type, callbacks] of this.events) {
            const otherCallbacks = other.events.get(type) ?? []
            for(const callback of callbacks) {
                otherCallbacks.push(callback);
            }
        }
        this.events = other.events;
    }
}

export default SerialBus;