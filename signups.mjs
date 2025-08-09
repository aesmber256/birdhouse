//@ts-check
import {
    attachErrorAlerts,
    ExitError,
    revealDOM,
    setupStaffAuth
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
} from "./api.mjs";

const api = new BirdhouseAPI();
const isStaff = await setupStaffAuth(api);

if (!isStaff) {
    stop();
    history.back();
    throw new ExitError();
}

const query = new URLSearchParams(location.search);
const gameId = Number(query.get("gameid") ?? NaN);
if (isNaN(gameId)) {
    throw new Error("no or invalid gameid query param");
}

/**@type {HTMLTableSectionElement}*/
//@ts-ignore
const table = document.getElementById("table");
/**@type {HTMLInputElement}*/
//@ts-ignore
const filter = document.getElementById("filter-input");

/**@type {HTMLElement[]} */
const cells = [];

/**@type {string[]} */
const names = [];

const signups = (await api.getSignups(gameId)).sort((a,b) => a.added_timestamp - b.added_timestamp);
for (const signup of signups) {
    const row = table.insertRow();
    row.dataset.id = String(signup.id);

    const date = row.insertCell();
    const name = row.insertCell();
    const notes = row.insertCell();
    const main = row.insertCell();
    const sub = row.insertCell();
    const remove = row.insertCell();
    
    date.textContent = getFormattedDateTime(new Date(signup.added_timestamp));
    name.textContent = signup.name;
    notes.textContent = signup.notes;

    const mainBox = document.createElement("input");
    mainBox.dataset.type = "main";
    mainBox.type = "checkbox";
    mainBox.checked = signup.main_state;

    const subBox = document.createElement("input");
    subBox.dataset.type = "sub";
    subBox.type = "checkbox";
    subBox.checked = signup.sub_state;

    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";

    main.append(mainBox);
    sub.append(subBox);
    remove.append(removeBtn);

    cells.push(row);
    names.push(signup.name.toLowerCase())
}

table.addEventListener("change", async ev => {
    if (!(ev.target instanceof HTMLInputElement) || typeof ev.target.dataset.type !== "string") return;
    switch (ev.target.dataset.type) {
        case "main":
            await api.setSignupMainState(Number(ev.target.parentElement?.parentElement?.dataset?.id), ev.target.checked);
            break;

        case "sub":
            await api.setSignupSubState(Number(ev.target.parentElement?.parentElement?.dataset?.id), ev.target.checked);
            break;
    
        default:
            break;
    }
});

table.addEventListener("click", async ev => {
    if (!(ev.target instanceof HTMLButtonElement)) return;
    const row = ev.target.parentElement?.parentElement;
    const id = Number(row?.dataset?.id);
    await api.deleteSignup(id);
    row?.remove();
})

let timer;
filter.addEventListener("keyup", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        const value = filter.value.toLowerCase();
        if (value.length > 0) {
            for (let i = 0; i < cells.length; i++) {
                const element = cells[i];
                if (names[i].includes(value)) {
                    element.classList.remove("hidden");
                }
                else {
                    element.classList.add("hidden");
                }
            }
        }
        else {
            for (let i = 0; i < cells.length; i++) {
                const element = cells[i];
                element.classList.remove("hidden");
            }
        }
    }, 200);
});

/**
 * @param {Date} date 
 * @returns {string} 
 */
function getFormattedDateTime(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');

    const offsetMinutes = date.getTimezoneOffset();
    const absOffset = Math.abs(offsetMinutes);
    const offsetSign = offsetMinutes > 0 ? '-' : '+';
    const offsetHrs = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const offsetMins = String(absOffset % 60).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec} ${offsetSign}${offsetHrs}:${offsetMins}`;
}

revealDOM();