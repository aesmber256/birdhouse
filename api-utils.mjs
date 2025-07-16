/**
 * Groups games by date, sorts games within each group by id ascending,
 * and sorts the groups by date ascending.
 *
 * @param {Games[]} games - Array of Games objects.
 * @returns {[YYYYMMDD, Games[]][]} Array of tuples where the first element is date (YYYYMMDD),
 * and the second element is an array of games sorted by id.
 */
export function groupSortGamesByDate(games) {
    // Disclaimer: this was partly ai generated cause i AINT writing this out by hand
    /**@type {Map<number, Games[]>}*/
    const grouped = new Map();

    for (const game of games) {
        if (!grouped.has(game.date)) {
            grouped.set(game.date, []);
        }
        grouped.get(game.date).push(game);
    }

    // Sort each group's games by id ascending
    for (const gamesArray of grouped.values()) {
        gamesArray.sort((a, b) => a.game_number - b.game_number);
    }

    // Convert to array and sort by date ascending
    return Array.from(grouped.entries()).sort(([dateA], [dateB]) => dateA - dateB);
}

/**
 * Converts a yyyymmdd number into a JavaScript Date object.
 * @param {API.YYYYMMDD} value - Date in yyyymmdd format, e.g. 20250719
 * @returns {Date} JavaScript Date object representing that day
 */
export function ymdToDate(value) {
    const year = Math.floor(value / 10000);
    const month = Math.floor((value % 10000) / 100) - 1;
    const day = value % 100;
    return new Date(year, month, day);
}

/**
 * @param {number} value
 * @returns {boolean} 
 */
export function validYmd(value) {
    return !isNaN(ymdToDate(Number(value)).valueOf())
}

/**
 * Converts a JavaScript Date object into a yyyymmdd number.
 * @param {Date} date - JavaScript Date object
 * @returns {API.YYYYMMDD} Date formatted as yyyymmdd number, e.g. 20250719
 */
export function dateToYmd(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return year * 10000 + month * 100 + day;
}

/**
 * @param {API.HHMM} hhmm 
 * @returns {string}
 */
export function formatHHMM(hhmm) {
    const hh = (hhmm / 100) | 0;
    const mm = hhmm - hh * 100;
    return `${hh}:${String(mm).padStart(2, '0')}`;
}

/**
 * @param {API.HHMM} hhmm 
 * @returns {string}
 */
export function formatRawHHMM(hhmm) {
    return String(hhmm).padStart(4, '0');
}

/**
 * @param {API.SHHMM} hhmm 
 * @returns {string}
 */
export function formatSHHMM(shhmm) {
    return `${shhmm >= 0 ? '+' : ''}${formatHHMM(shhmm)}`
}

/**
 * @param {API.SHHMM} hhmm 
 * @returns {string}
 */
export function formatRawSHHMM(shhmm) {
    return `${shhmm >= 0 ? '+' : '-'}${formatRawHHMM(Math.abs(shhmm))}`
}