//@ts-check
import {
    attachErrorAlerts,
    formatDayDate,
    revealDOM,
    setupStaffAuth
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
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
    entry.textContent = formatDayDate(actualDate);
    
    entry.dataset.ymd = String(date);
    if (hidden) {
        entry.dataset.hidden = '';
        entry.textContent += '*'
    }

    const index = actualDate.getDate() - 4;
    cols[index]?.append(entry);
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

revealDOM();