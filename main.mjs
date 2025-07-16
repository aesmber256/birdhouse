//@ts-check
import {
    attachErrorAlerts,
    formatDate,
    setupStaffAuth
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
    DEBUG as API_DEBUG_URL
} from "./api.mjs";

import * as utils from "./api-utils.mjs";

const api = new BirdhouseAPI();
const isStaff = await setupStaffAuth(api);


// Populate boxes
const dates = await api.getDates(utils.dateToYmd(new Date()), 99991231);
const cols = [
    document.getElementById("col1"),
    document.getElementById("col2"),
    document.getElementById("col3")
];
const entryTemplate = document.getElementById("template-entry");
for (const {date, hidden} of dates) {
    const actualDate = utils.ymdToDate(date);
    /**@type {HTMLElement}*/
    //@ts-ignore
    const entry = entryTemplate.content.children[0].cloneNode(true);
    entry.textContent = formatDate(actualDate);
    
    entry.dataset.ymd = String(date);
    if (hidden) {
        entry.dataset.hidden = '';
        entry.textContent += '*'
    }

    //@ts-ignore
    cols[actualDate.getDay() - 4].append(entry);
}

//@ts-ignore
document.getElementById("main-content").addEventListener("click", async x => {
    if (!(x.target instanceof HTMLElement) || x.target.tagName !== "AVIARY-ENTRY") return;
    location.assign(`./games.html?date=${x.target.dataset.ymd}`);
});

//@ts-ignore
document.getElementById("new-game-btn").addEventListener("click", async x => {
    if (!isStaff) return;
    const result = prompt("Enter in the date in the YYYYMMDD format.\n\nExample: 31. 7. 2025 => 2025 07 31 => 20250731");
    if (result === null) return;

    const ymd = Number(result.trim());
    if (!utils.validYmd(ymd)) {
        alert("Invalid date");
        return;
    }

    await api.newGame(BirdhouseAPI.createDefaultGame(ymd));
    location.assign(`./games.html?date=${ymd}`)
});