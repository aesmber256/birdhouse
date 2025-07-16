//@ts-check
import {
    attachErrorAlerts,
    ExitError,
    formatDate,
    setupStaffAuth
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
    DEBUG as API_DEBUG_URL
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

const signups = await api.getSignups(gameId);
for (const signup of signups) {
    const row = table.insertRow();
    row.insertCell().textContent = signup.name;
    row.insertCell().textContent = signup.notes;
}