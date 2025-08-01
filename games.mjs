//@ts-check
import {
    attachErrorAlerts,
    cloneTemplate,
    setupStaffAuth,
    getByClass,
    toUtcMinutes,
    revealDOM
} from "./utils.mjs";
attachErrorAlerts(window);

import {
    BirdhouseAPI,
} from "./api.mjs";
import { formatHHMM, formatSHHMM } from "./api-utils.mjs";

const query = new URLSearchParams(location.search);
const date = Number(query.get("date") ?? NaN);
if (isNaN(date)) {
    throw new Error("invalid or no date query param");
}

const api = new BirdhouseAPI();
const isStaff = await setupStaffAuth(api);

/**@type {HTMLElement}*/
//@ts-ignore
const gamesList = document.getElementById("games");

/**@type {HTMLTemplateElement}*/
//@ts-ignore
const gameTemplate = document.getElementById("template-game");

const games = (await api.getGames(date, date)).sort((a, b) => toUtcMinutes(a.time, a.tz) - toUtcMinutes(b.time, b.tz));

if (games.length === 0) {
    if (!query.has("navback")) {
        alert("No games on this date found");
    }
    location.replace("./index.html");
}

console.log(games);
for (let i = games.length - 1; i >= 0; i--) {
    const game = games[i];
    const el = cloneTemplate(gameTemplate);
    el.dataset.id = String(game.id);
    el.dataset.num = String(i + 1);
    if (game.hidden) {
        el.dataset.hidden = ''
    }

    getByClass(el, "game--number--value").textContent = String(i + 1);
    getByClass(el, "game--time--value").textContent = formatHHMM(game.time);
    getByClass(el, "game--tz--value").textContent = `UTC${formatSHHMM(game.tz)}`;
    //@ts-ignore
    getByClass(el, "game--link").href = game.script_link;
    getByClass(el, "game--link--label").textContent = game.script_name
    getByClass(el, "game--st--value").textContent = game.storyteller;

    gamesList.prepend(el);
}

gamesList.addEventListener("click", ev => {
    if (!(ev.target instanceof HTMLElement) || !ev.target.classList.contains("game--btn")) return;
    const dataset = ev.target.parentElement?.parentElement?.dataset;
    location.assign(`./game-view.html?gameid=${dataset?.id}&gamenumber=${dataset?.num}`);
});


//@ts-ignore
document.getElementById("new-game-btn").addEventListener("click", async x => {
    if (!isStaff) return;
    await api.newGame(BirdhouseAPI.createDefaultGame());
    location.reload();
});

revealDOM();