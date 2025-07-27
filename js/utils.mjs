//@ts-check
import { BirdhouseAPI } from "./api.mjs";

/**
 * Formats an ErrorEvent into a stack-trace-style string.
 * @param {ErrorEvent} errorEvent - The error event to format.
 * @returns {string} A formatted error message.
 */
function formatErrorEvent(errorEvent) {
    const {
        message,
        filename,
        lineno,
        colno,
        error
    } = errorEvent;

    let output = '';

    // Main error line
    output += `${message}\n`;
    output += `    at ${filename}:${lineno}:${colno}\n`;

    // If there's an actual Error object, use its stack
    if (error && error.stack) {
        // Remove the first line if it's just the message (already printed)
        const stackLines = error.stack.split('\n');
        if (stackLines.length > 1 && stackLines[0].includes(message)) {
            output += stackLines.slice(1).join('\n');
        } else {
            output += error.stack;
        }
    }

    return output;
}

export class ExitError extends Error {
    constructor() {
        super()
    }
}

/**
 * @param {Date} date 
 * @returns {string}
 */
export function formatDayDate(date) {
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
}

/**
 * Converts HHMM time and SHHMM offset to absolute UTC minutes.
 * @param {number} time - Time in HHMM format (e.g., 1345 for 1:45 PM).
 * @param {number} tz - Signed offset in HHMM format (e.g., -0300).
 * @returns {number} UTC-adjusted time in minutes.
 */
export function toUtcMinutes(time, tz) {
	const localMinutes = Math.floor(time / 100) * 60 + (time % 100);
	const offsetMinutes = Math.floor(Math.abs(tz) / 100) * 60 + (Math.abs(tz) % 100);
	const signedOffset = tz < 0 ? -offsetMinutes : offsetMinutes;
	return localMinutes - signedOffset;
}

/**
 * 
 * @param env {Window}
 */
export function attachErrorAlerts(env) {
    env.addEventListener("error", x => {
        if (x.error instanceof ExitError) return;
        alert(`An error occured, tell the dev!\n\n${formatErrorEvent(x)}`);
    });
    
    env.addEventListener("unhandledrejection", x => {
        alert(`An error (unhandledrejection) occured, tell the dev!\n\n${x.reason?.stack || x.reason}`);
    });
}

/**
 * @param {HTMLElement} el
 * @param {string} htmlClass
 * @returns {HTMLElement}
 */
export function getByClass(el, htmlClass) {
    //@ts-ignore
    return el.getElementsByClassName(htmlClass)[0];
}

/**
 * @param {HTMLTemplateElement} template
 * @returns {HTMLElement}
 */
export function cloneTemplate(template) {
    //@ts-ignore
    return template.content.children[0].cloneNode(true);
}

/**
 * Extended mapping of HTML tag names to their corresponding element types.
 * Falls back to `HTMLElement` for unknown tag names.
 * 
 * @typedef {HTMLElementTagNameMap & { "": HTMLElement }} HTMLElementTagNameMapEx
 */

/**
 * Gets a single element by its ID.
 * @template {keyof HTMLElementTagNameMapEx} K
 * @param {string} id The element ID to look for.
 * @param {K} [tagName] The expected HTML tag name.
 * @returns {HTMLElementTagNameMapEx[K]}
 * @throws {TypeError} If the element with the given ID does not exist.
 * @throws {TypeError} If the element's tag does not match {@link tagName}.
 */
export function getById(id, tagName) {
    const el = document.getElementById(id);
    if (el === null) {
        throw new TypeError(`Element #${id} was not found`);
    }
    if (tagName && el.tagName !== tagName.toUpperCase()) {
        throw new TypeError(`Element #${id} is not '${tagName}'`);
    }

    //@ts-ignore
    return el;
}

/**
 * @param {any} error 
 */
export function isAbort(error) {
    return error instanceof DOMException && error.name === "AbortError";
}

export class DebounceSignal {
    /** @type {AbortControllerEx | undefined} */ _controller;

    /**
     * @returns {AbortControllerEx}
     */
    next() {
        this._controller?.abort();
        return this._controller = new AbortControllerEx();
    }
}

export class AbortControllerEx extends AbortController {
    /**
     * @throws An {@link AbortError} If signal is aborted
     */
    throwIfAborted() {
        if (this.signal.aborted) {
            throw new AbortError();
        }
    }
}

export class AbortError extends DOMException {
    constructor() {
        super("Aborted", "AbortError");
    }
}

export class Mutex {
    constructor() {
        this._locked = false;
        
        /**@type {Set<function>}*/
        this._waiters = new Set();
    }
    
    /**
     * 
     * @param {AbortSignal} [signal]
     * @returns {Promise<void>}
     */
    acquire(signal) {
        if (signal?.aborted) {
            return Promise.reject(new AbortError());
        }

        if (!this._locked) {
            this._locked = true;
            return Promise.resolve();
        }
        
        return new Promise((ok, err) => {
            if (signal?.aborted) {
                return Promise.reject(new AbortError());
            }
            signal?.addEventListener("abort", () => { this._waiters.delete(ok); err(new AbortError()); });
            this._waiters.add(ok);
        });
    }

    release() {
        const [next] = this._waiters;
        if (next !== undefined) {
            this._waiters.delete(next);
            next();
        } 
        else {
            this._locked = false;
        }
    }

    get isAcquired() {
        return this._locked;
    }
}

export class ResponseError extends Error {
    /**
     * @param {string} message 
     * @param {Response} response 
     */
    constructor(message, response) {
        super(message);
        this.name = "ResponseError";
        this.response = response;
    }
}

export function noop() {}

/**
 * @template T
 * @param {() => T} fn
 * @param {number} amount 
 * @returns {Promise<T>} 
 */
export function delayed(fn, amount) {
    return new Promise(r => {
        setTimeout(() => r(fn()), amount);
    });
}

export const 
    /**@type {readonly string[]}*/ circleSpinner = ["◐", "◓", "◑", "◒"],
    /**@type {readonly string[]}*/ dotSpinner = [".\u00A0\u00A0", "..\u00A0", "...", "\u00A0..", "\u00A0\u00A0.", "\u00A0\u00A0\u00A0"];

/**
 * 
 * @param {HTMLElement} element 
 * @param {number} interval
 * @param {readonly string[]} [throbberParts]
 * @returns {() => void}
 */
export function throbber(element, interval, throbberParts) {
    // I love casting
    let s = /**@type {() => void}*/ (/**@type {unknown}*/ (undefined));

    new Promise((_s, _f) => {
        const state = { ctr: 0, parts: throbberParts || dotSpinner};
        element.textContent = state.parts[0];
        const id = setInterval((/**@type {{ctr: number, parts: readonly string[]}}*/ state) => {
            state.ctr = (state.ctr + 1) % (state.parts.length);
            element.textContent = state.parts[state.ctr];
        }, interval, state);
        s = () => {
            element.textContent = "";
            clearInterval(id);
            _s(null);
        }
    });

    return s;
}
/**
 * @param  {...(HTMLInputElement | HTMLTextAreaElement)} inputs 
 * @returns {boolean}
 */
export function reportValidity(...inputs) {
    let valid = true;
    for (const input of inputs) {
        valid &&= input.reportValidity();
    }
    return valid;
}