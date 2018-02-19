/**
 * Util functions
 * Which can be composed and reused in other function
 */
export const has = (prop) => (coll) => (coll && typeof coll === 'object') ?
    coll.hasOwnProperty(prop) :
    false;
export const len = (coll) => Array.isArray(coll) ? coll.length : 0;


/**
 * Helper functions
 * EmitterHelper can be used together with Emitter class.
 * The idea of this helper function is to compose different util functions
 * to handle business logic function
 */
export class EmitterHelper {
    /**
     * Check event name should be string type
     * @param name
     * @returns {*|boolean}
     */
    static checkEventName(name) {
        return name ? typeof name === 'string' : false;
    }

    /**
     * Check Fn should be a function
     * @param fn
     * @returns {*|boolean}
     */
    static checkFn(fn) {
        return fn ? typeof fn === "function" : false;
    }

    /**
     * Check contains event in the subscribers
     * @param eventName
     * @param coll
     * @returns {*}
     */
    static hasEvent(eventName, coll) {
        return has(eventName)(coll);
    }

    /**
     * Count how many listeners one event has
     * @param eventName
     * @param coll
     * @returns {number}
     */
    static count(eventName, coll) {
        return this.hasEvent(eventName, coll) ?
            len(coll[eventName].listeners) :
            0;
    }
}

/**
 * Main class Emitter
 */
class Emitter {
    constructor() {
        this._subscribers = {};
    }

    /**
     * Register event
     * @param eventName: string
     * @param fn: Function
     * @param once: boolean
     * @returns {count: number}
     */
    on(eventName, fn, once = false) {
        if (!EmitterHelper.checkEventName(eventName)) {
            throw new TypeError(`on(eventName, fn), ${eventName} should be string type`);
        }
        if (!EmitterHelper.checkFn(fn)) {
            throw new TypeError(`on(eventName, fn), ${fn} should be a function`);
        }
        // Get selected event
        const {[eventName]: event = {listeners: []}} = this._subscribers;
        this._subscribers = {
            ...this._subscribers,
            [eventName]: {
                ...event,
                once,
                listeners: [...event.listeners, fn]
            }
        };
        return EmitterHelper.count(eventName, this._subscribers);
    }

    /**
     * Register the event and once trigger once
     * @param eventName: string
     * @param fn: Function
     * @returns {count: number}
     */
    once(eventName, fn) {
        return this.on(eventName, fn, true);
    }

    /**
     * Trigger one event
     * @param eventName: string
     * @param args
     * @returns {boolean}
     */
    trigger(eventName, ...args) {
        if (!EmitterHelper.checkEventName(eventName)) {
            throw new TypeError(`trigger(eventName, ...args), ${eventName} should be string type`);
        }
        const {[eventName]: event = {listeners: [], once: false}} = this._subscribers;
        if (len(event.listeners)) {
            event.listeners.forEach((fn) => fn(...args));
            if (event.once) {
                this.unsubscribeWholeEvent(eventName)
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Unsubscribe one function from the event listener
     * @param eventName: string,
     * @param fn: Function
     * @returns {number}
     */
    unsubscribeOneEvent(eventName, fn) {
        if (!EmitterHelper.checkEventName(eventName)) {
            throw new TypeError(`off(eventName, [fn]), ${eventName} should be string type`);
        }
        if (!EmitterHelper.checkFn(fn)) {
            throw new TypeError(`off(eventName, fn), ${fn} should be a function`);
        }
        const {[eventName]: event = {listeners: []}} = this._subscribers;
        if(EmitterHelper.hasEvent(eventName, this._subscribers)) {
            this._subscribers = {
                ...this._subscribers,
                [eventName]: {
                    ...event,
                    listeners: event.listeners.filter(e => e !== fn)
                }
            };
        }
        return EmitterHelper.count(eventName, this._subscribers);
    }

    /**
     * Unsubscribe the whole event
     * @params:
     *  eventName: string,
     *
     * @return:
     *  number
     */
    unsubscribeWholeEvent(eventName) {
        if (!EmitterHelper.checkEventName(eventName)) {
            throw new TypeError(`off(eventName, [fn]), ${eventName} should be string type`);
        }
        const {[eventName]: event, ...rest} = this._subscribers;
        this._subscribers = {...rest};
        return EmitterHelper.count(eventName, this._subscribers);
    }
}

/**
 * Singleton
 */
const _Emitter = new Emitter();

/**
 * Unsubscribe an event name and all its subscribed functions or unsubscribe an event name and the function provided only
 */
export function off(eventName) {
    if (arguments.length === 1) {
        return _Emitter.unsubscribeWholeEvent(eventName);
    } else {
        return _Emitter.unsubscribeOneEvent(eventName, arguments[1]);
    }
}

/**
 * Subscribe a function to be called every time the event name is triggered
 */
export function on(eventName, fn) {
    return _Emitter.on(eventName, fn);
}

/**
 * Subscribe a function to be called only once for when the event name is triggered
 */
export function once(eventName, fn) {
    return _Emitter.once(eventName, fn)
}

/**
 * Trigger an event name with optional arguments
 */
export function trigger(eventName, ...args) {
    return _Emitter.trigger(eventName, ...args);
}