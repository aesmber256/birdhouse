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

const dateFormatter = Intl.DateTimeFormat(navigator.languages, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: undefined,
});

/**
* @param {Date} date 
* @returns {string}
*/
export function formatDate(date) {
    return dateFormatter.format(date);
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

export const API_KEY_ID = "birdhouse_api_token";
export const IS_STAFF_ID = "birdhouse_is_staff";

/**
* @returns {boolean}
*/
export function isStaff() {
    return sessionStorage.getItem(IS_STAFF_ID) !== null;
}

/**
* @param {boolean} state 
*/
export function setStaff(state) {
    if (state) {
        sessionStorage.setItem(IS_STAFF_ID, "true");
    }
    else {
        sessionStorage.removeItem(IS_STAFF_ID);
    }
}

/**
* @param {BirdhouseAPI} api
* @param {HTMLElement} [buttonElement]
* @returns {Promise<boolean>}
*/
export async function setupStaffAuth(api, buttonElement) {
    if (!await api.ping()) {
        location.assign("./maintenance.html");
    }
    
    const loginBtn = buttonElement ?? document.getElementById("header--staff-btn");
    if (!loginBtn) {
        throw new SyntaxError("No login button found");
    }
    
    const key = sessionStorage.getItem(API_KEY_ID);
    const staff = isStaff() && await api.tryAuth(key ?? undefined);
    
    if (staff) {
        document.body.setAttribute("data-is-staff", "");
    }
    else {
        document.body.removeAttribute("data-is-staff");
    }
    
    loginBtn.addEventListener("click", async () => {
        if (staff) {
            setStaff(false);
            location.reload();
            return;
        }
        
        const key = sessionStorage.getItem(API_KEY_ID);
        if (!key || !await api.tryAuth(key)) {
            sessionStorage.removeItem(API_KEY_ID)
            let result = prompt("Enter passcode");
            if (result === null) {
                return;
            }
            
            if (! await api.tryAuth(result.trim())) {
                alert("Failed to authenticate");
                return;
            }        
            
            sessionStorage.setItem(API_KEY_ID, result);
        }
        
        setStaff(true);
        location.reload();
    });
    
    return staff;
}

/**
 * @param {BirdhouseAPI} api  
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
export async function tryLogin(api, key) {
    if (!key || !await api.tryAuth(key)) {
        sessionStorage.removeItem(API_KEY_ID);        
        if (!await api.tryAuth(key)) {
            alert("Failed to authenticate");
            return false;
        }        
        
        sessionStorage.setItem(API_KEY_ID, key);
    }
    
    setStaff(true);
    return true;
}

export function revealDOM() {
    document.getElementById("preload-spinner")?.remove();
    document.body.dataset.fullyloaded = "";
}

/**
* 
* @param {Date} date 
* @returns {string}
*/
export function dateToDatetimeLocal(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // adjust to local time
    return local.toISOString().slice(0, 16); // trim to "YYYY-MM-DDTHH:MM"
}

/**
* @param {string} hostname
* @returns 
*/
export function isLocalhost(hostname) {
    return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' // IPv6 localhost
    );
}