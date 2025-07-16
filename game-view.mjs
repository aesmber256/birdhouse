//@ts-check
import {
    attachErrorAlerts,
    cloneTemplate,
    setupStaffAuth,
    getByClass,
    formatDate
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
    DEBUG as API_DEBUG_URL
} from "./api.mjs";
import { formatHHMM, formatRawHHMM, formatRawSHHMM, formatSHHMM, ymdToDate } from "./api-utils.mjs";


const query = new URLSearchParams(location.search);
const gameId = Number(query.get("gameid") ?? NaN);
if (isNaN(gameId)) {
    throw new Error("no or invalid gameid query param");
}

const queryGameNumber = Number(query.get("gamenumber") ?? NaN);
if (isNaN(queryGameNumber)) {
    throw new Error("no or invalid gamenumber query param");
}

const api = new BirdhouseAPI();
const isStaff = await setupStaffAuth(api);

const game = await api.getGame(gameId);

/**@type {HTMLSpanElement} */
//@ts-ignore
const gameNumber = document.getElementById("game-number");

/**@type {HTMLSpanElement} */
//@ts-ignore
const gameDate = document.getElementById("game-date");

/**@type {HTMLInputElement} */
//@ts-ignore
const timeInput = document.getElementById("game-time-value--input");

/**@type {HTMLSpanElement} */
//@ts-ignore
const timeLabel = document.getElementById("game-time-value--label");

/**@type {HTMLInputElement} */
//@ts-ignore
const tzInput = document.getElementById("game-tz-value--input");

/**@type {HTMLSpanElement} */
//@ts-ignore
const tzLabel = document.getElementById("game-tz-value--label");

/**@type {HTMLInputElement} */
//@ts-ignore
const scriptInput = document.getElementById("game-script-value--input-name");

/**@type {HTMLInputElement} */
//@ts-ignore
const linkInput = document.getElementById("game-script-value--input-link");

/**@type {HTMLAnchorElement} */
//@ts-ignore
const scriptLabel = document.getElementById("game-script-value--link");

/**@type {HTMLInputElement} */
//@ts-ignore
const stInput = document.getElementById("game-storyteller-value--input");

/**@type {HTMLSpanElement} */
//@ts-ignore
const stLabel = document.getElementById("game-storyteller-value--label");

/**@type {HTMLInputElement} */
//@ts-ignore
const hiddenInput = document.getElementById("game-hidden-value--input");

/**@type {HTMLSpanElement} */
//@ts-ignore
const Label = document.getElementById("game--value--label");

/**@type {HTMLInputElement} */
//@ts-ignore
const nameInput = document.getElementById("signup-name--input");

/**@type {HTMLTextAreaElement} */
//@ts-ignore
const notesInput = document.getElementById("signup-notes--area");

gameNumber.textContent = String(queryGameNumber);
gameDate.textContent = formatDate(ymdToDate(game.date));

timeInput.value = formatRawHHMM(game.time);
timeLabel.textContent = formatHHMM(game.time);

tzInput.value = formatRawSHHMM(game.tz);
tzLabel.textContent = formatSHHMM(game.tz);

scriptInput.value = scriptLabel.textContent = game.script_name;
linkInput.value = scriptLabel.href = game.script_link;
stInput.value = stLabel.textContent = game.storyteller;
hiddenInput.checked = game.hidden;

//@ts-ignore
document.getElementById("signup-notes--area").style.width = `${document.getElementById("signup-notes-container").clientWidth}px`;

//@ts-ignore
document.getElementById("signup-btn")?.addEventListener("click", async x => {
    //@ts-ignore
    if (!document.getElementById("signup-name--input").reportValidity())
        return;

    if (nameInput.value.length > nameInput.maxLength) {
        alert(`Max ${nameInput.maxLength} characters in name`);
        return;
    }

    if (notesInput.value.length > notesInput.maxLength) {
        alert(`Max ${notesInput.maxLength} characters in notes`);
        return;
    }
    
    await api.signup(gameId, nameInput.value, notesInput.value);
    alert("Signup successful");
    location.reload();
});

//@ts-ignore
document.getElementById("staff-view--signups-btn")?.addEventListener("click", async x => {
    if (!isStaff) return;
    location.assign(`./signups.html?gameid=${game.id}`);
});

//@ts-ignore
document.getElementById("staff-view--update-btn")?.addEventListener("click", async x => {
    if (!isStaff) return;
    if (!(timeInput.reportValidity() 
        && tzInput.reportValidity()
        && scriptInput.reportValidity()
        && linkInput.reportValidity()
        && stInput.reportValidity()
        && hiddenInput.reportValidity()))
        return;
    await api.editGame({
        time: Number(timeInput.value),
        tz: Number(tzInput.value),
        script_name: scriptInput.value,
        script_link: linkInput.value,
        storyteller: stInput.value,
        hidden: hiddenInput.checked,

        id: game.id,
        date: game.date,
    });
    alert("Updated successfully");
    location.reload();
});

//@ts-ignore
document.getElementById("staff-view--delete-btn")?.addEventListener("click", async x => {
    if (!isStaff) return;
    if (!confirm("Are you sure you want delete this game?")) return;
    await api.deleteGame(gameId);
    location.replace(`./games.html?date=${game.date}&navback=1`);
});