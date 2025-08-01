//@ts-check
import {
    attachErrorAlerts,
    formatDate,
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
const games = await api.getGames(Math.trunc(Date.now() / 1000) - 1, 253370761200 /* Year 9999 1 1 0000 */);
const cols = [
    document.getElementById("col1"),
    document.getElementById("col2"),
    document.getElementById("col3"),
    document.getElementById("col4"),
];
const entryTemplate = document.getElementById("template-entry");
for (const {time, category, id, hidden} of games) {
    /**@type {HTMLElement}*/
    //@ts-ignore
    const entry = entryTemplate.content.children[0].cloneNode(true);
    entry.textContent = formatDate(new Date(time * 1000));
    
    entry.dataset.gameid = String(id);
    if (hidden) {
        entry.dataset.hidden = '';
        entry.textContent += '*'
    }
    
    if (category >= cols.length || category < 0) {
        console.log("Invalid category", id, category);
        continue;
    }

    cols[category]?.append(entry);
}

//@ts-ignore
document.getElementById("main-content").addEventListener("click", async x => {
    if (!(x.target instanceof HTMLElement) || x.target.tagName !== "AVIARY-ENTRY") return;
    location.assign(`./game-view.html?gameid=${x.target.dataset.gameid}`);
});

//@ts-ignore
document.getElementById("new-game-btn").addEventListener("click", async x => {
    if (!isStaff) return;
    const gameId = await api.newGame(BirdhouseAPI.createDefaultGame());
    location.assign(`./game-view.html?gameid=${gameId}`)
});

revealDOM();