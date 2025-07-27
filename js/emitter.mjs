/**
 * @template T
 * @callback EmitterCallback
 * @param {T} data
 * @returns {void}
 */

/**
 * Lightweight event callback system. Alternative to {@link EventTarget}
 * @template T
 */

export class Emitter {
    constructor() {
        /**@type {Set<EmitterCallback<T>>}*/ this._callbacks = new Set();
    }

    /**
     * Attaches a new {@link EmitterCallback} to the emitter.
     *
     * Note: *Only unique callbacks are registered, duplicate callbacks are not added*
     * @param {EmitterCallback<T>} callback Callback which to register
     * @returns {boolean} Whether or not the registration succeeded (i.e. unique callback)
     */
    on(callback) {
        if (this._callbacks.has(callback))
            return false;
        this._callbacks.add(callback);
        return true;
    }

    /**
     * Detaches an {@link EmitterCallback} from the emitter.
     * @param {EmitterCallback<T>} callback Callback which to detach
     * @returns {boolean} Whether or not the {@link callback} was detached (i.e. it was attached before)
     */
    detach(callback) {
        return this._callbacks.delete(callback);
    }

    /**
     * Removes all attached {@link EmitterCallback}s
     */
    clear() {
        this._callbacks.clear();
    }

    /**
     * Calls all attached {@link EmitterCallback}s with specified {@link data}
     * @param {T} data Value which to provide to callbacks
     * @returns {number} The number of {@link EmitterCallback}s called
     */
    emit(data) {
        let ctr = 0;
        for (const callback of this._callbacks) {
            callback(data);
            ctr++;
        }
        return ctr;
    }
}
