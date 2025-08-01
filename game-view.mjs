//@ts-check
import {
    attachErrorAlerts,
    setupStaffAuth,
    formatDate,
    revealDOM,
    dateToDatetimeLocal
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
} from "./api.mjs";
import { formatHHMM, formatRawHHMM, formatRawSHHMM, formatSHHMM, ymdTimeTzToDate, ymdToDate } from "./api-utils.mjs";


const query = new URLSearchParams(location.search);
const gameId = Number(query.get("gameid") ?? NaN);
if (isNaN(gameId)) {
    throw new Error("no or invalid gameid query param");
}

const api = new BirdhouseAPI();
const isStaff = await setupStaffAuth(api);

const game = await api.getGame(gameId);


/**@type {HTMLInputElement} */
//@ts-ignore
const timeInput = document.getElementById("game-time-value--input");

/**@type {HTMLSpanElement} */
//@ts-ignore
const timeLabel = document.getElementById("game-time-value--label");

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

/**@type {HTMLSpanElement} */
//@ts-ignore
const categoryLabel = document.getElementById("game-cat-value--label");

/**@type {HTMLSelectElement} */
//@ts-ignore
const categoryInput = document.getElementById("game-cat-value--select");

/**@type {HTMLInputElement} */
//@ts-ignore
const hiddenInput = document.getElementById("game-hidden-value--input");

/**@type {HTMLInputElement} */
//@ts-ignore
const nameInput = document.getElementById("signup-name--input");

/**@type {HTMLTextAreaElement} */
//@ts-ignore
const notesInput = document.getElementById("signup-notes--area");

const date = new Date(game.time * 1000);

timeLabel.textContent = formatDate(date);
timeInput.value = dateToDatetimeLocal(date);

scriptInput.value = scriptLabel.textContent = game.script_name;
linkInput.value = scriptLabel.href = game.script_link;
stInput.value = stLabel.textContent = game.storyteller;
categoryInput.value = String(game.category);
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
        && categoryInput.reportValidity()
        && scriptInput.reportValidity()
        && linkInput.reportValidity()
        && stInput.reportValidity()
        && hiddenInput.reportValidity()))
        return;
    await api.editGame({
        time: Math.trunc(Date.parse(timeInput.value) / 1000),
        script_name: scriptInput.value,
        script_link: linkInput.value,
        storyteller: stInput.value,
        hidden: hiddenInput.checked,
        category: Number(categoryInput.value),

        id: game.id,
    });
    alert("Updated successfully");
    location.reload();
});

//@ts-ignore
document.getElementById("staff-view--delete-btn")?.addEventListener("click", async x => {
    if (!isStaff) return;
    if (!confirm("Are you sure you want delete this game?")) return;
    await api.deleteGame(gameId);
    location.replace(`./index.html`);
});

revealDOM();