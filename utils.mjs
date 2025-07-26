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

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * @param {Date} date 
 * @returns {string}
 */
export function formatDayDate(date) {
    return `${monthNames[date.getMonth()]} ${date.getDate()}. ${date.getFullYear()}`;
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
 * @returns {Promise<boolean>}
 */
export async function setupStaffAuth(api) {
    const loginBtn = document.getElementById("header--staff-btn");
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

export function revealDOM() {
    document.getElementById("preload-spinner")?.remove();
    document.body.dataset.fullyloaded = "";
}