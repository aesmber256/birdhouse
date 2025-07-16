//@ts-check

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
 * 
 * @param {API.YYYYMMDD} ymd 
 * @param {API.HHMM} time 
 * @param {API.SHHMM} tz 
 */
export function ymdTimeTzToDate(ymd, time, tz) {// Parse date components
    const year = Math.floor(ymd / 10000);
    const month = Math.floor((ymd % 10000) / 100) - 1; // JS months 0-based
    const day = ymd % 100;
  
    // Parse time components
    const hour = Math.floor(time / 100);
    const minute = time % 100;
  
    // Parse timezone offset
    const offsetSign = Math.sign(tz);
    const absOffset = Math.abs(tz);
    const offsetHours = Math.floor(absOffset / 100);
    const offsetMinutes = absOffset % 100;
    const totalOffsetMinutes = offsetSign * (offsetHours * 60 + offsetMinutes);
  
    // Create Date in UTC by subtracting offset (convert local time to UTC)
    // So add offset in minutes to local time to get UTC time
    const utcTimestamp = Date.UTC(year, month, day, hour, minute) - totalOffsetMinutes * 60 * 1000;
  
    return new Date(utcTimestamp);
}

/**
 * @param {API.SHHMM} shhmm 
 * @returns {string}
 */
export function formatSHHMM(shhmm) {
    return `${shhmm >= 0 ? '+' : ''}${formatHHMM(shhmm)}`
}

/**
 * @param {API.SHHMM} shhmm 
 * @returns {string}
 */
export function formatRawSHHMM(shhmm) {
    return `${shhmm >= 0 ? '+' : '-'}${formatRawHHMM(Math.abs(shhmm))}`
}