"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSolarDateTimeString = parseSolarDateTimeString;
exports.parseLunarDateTimeString = parseLunarDateTimeString;
exports.formatSolarDateTime = formatSolarDateTime;
exports.formatLunarDateTime = formatLunarDateTime;
exports.solarPartsToDate = solarPartsToDate;
exports.getLunarMonthValue = getLunarMonthValue;
exports.lunarPartsToSolarParts = lunarPartsToSolarParts;
exports.solarPartsToLunarParts = solarPartsToLunarParts;
exports.normalizeDateValue = normalizeDateValue;
exports.convertDateValue = convertDateValue;
const lunar_javascript_1 = require('../vendor/lunar');
function toNumber(value, fallback = 0) {
    if (value === undefined || value === '') {
        return fallback;
    }
    return Number(value);
}
function parseSolarDateTimeString(value) {
    const normalized = value.trim();
    const match = normalized.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/);
    if (!match) {
        return null;
    }
    return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hour: toNumber(match[4]),
        minute: toNumber(match[5]),
        second: toNumber(match[6]),
    };
}
function parseLunarDateTimeString(value) {
    const normalized = value.trim();
    const match = normalized.match(/^(?:L:)?(\d{1,4})[-/](\d{1,2})[-/](\d{1,2})(?:[-\s](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?(-R)?$/);
    if (!match) {
        return null;
    }
    return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hour: toNumber(match[4]),
        minute: toNumber(match[5]),
        second: toNumber(match[6]),
        isLeap: Boolean(match[7]),
    };
}
function formatSolarDateTime(parts) {
    return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')} ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}`;
}
function formatLunarDateTime(parts) {
    const suffix = parts.isLeap ? '-R' : '';
    return `L:${parts.year}-${parts.month}-${parts.day} ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}${suffix}`;
}
function solarPartsToDate(parts) {
    const date = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    if (Number.isNaN(date.getTime()) ||
        date.getFullYear() !== parts.year ||
        date.getMonth() !== parts.month - 1 ||
        date.getDate() !== parts.day ||
        date.getHours() !== parts.hour ||
        date.getMinutes() !== parts.minute ||
        date.getSeconds() !== parts.second) {
        throw new Error('日期时间无效');
    }
    return date;
}
function getLunarMonthValue(parts) {
    return parts.isLeap ? -Math.abs(parts.month) : parts.month;
}
function ensureValidLunarParts(parts) {
    const lunar = lunar_javascript_1.Lunar.fromYmdHms(parts.year, getLunarMonthValue(parts), parts.day, parts.hour, parts.minute, parts.second);
    if (lunar.getYear() !== parts.year ||
        Math.abs(lunar.getMonth()) !== Math.abs(parts.month) ||
        (lunar.getMonth() < 0) !== parts.isLeap ||
        lunar.getDay() !== parts.day) {
        throw new Error('农历日期无效');
    }
    return lunar;
}
function lunarPartsToSolarParts(parts) {
    const lunar = ensureValidLunarParts(parts);
    const solar = lunar.getSolar();
    return {
        year: solar.getYear(),
        month: solar.getMonth(),
        day: solar.getDay(),
        hour: solar.getHour(),
        minute: solar.getMinute(),
        second: solar.getSecond(),
    };
}
function solarPartsToLunarParts(parts) {
    const solar = lunar_javascript_1.Solar.fromDate(solarPartsToDate(parts));
    const lunar = solar.getLunar();
    const month = lunar.getMonth();
    return {
        year: lunar.getYear(),
        month: Math.abs(month),
        day: lunar.getDay(),
        hour: solar.getHour(),
        minute: solar.getMinute(),
        second: solar.getSecond(),
        isLeap: month < 0,
    };
}
function normalizeDateValue(value, dateType) {
    if (dateType === 0) {
        const parts = parseSolarDateTimeString(value);
        if (!parts) {
            throw new Error('日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
        }
        solarPartsToDate(parts);
        return formatSolarDateTime(parts);
    }
    const parts = parseLunarDateTimeString(value);
    if (!parts) {
        throw new Error('农历日期格式无效，请使用 L:yyyy-M-d HH:mm:ss 或 yyyy-M-d HH:mm:ss');
    }
    ensureValidLunarParts(parts);
    return formatLunarDateTime({
        ...parts,
        month: Math.abs(parts.month),
    });
}
function convertDateValue(value, fromType, toType) {
    if (fromType === toType) {
        return normalizeDateValue(value, fromType);
    }
    if (fromType === 0) {
        const solarParts = parseSolarDateTimeString(value);
        if (!solarParts) {
            throw new Error('公历日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
        }
        return formatLunarDateTime(solarPartsToLunarParts(solarParts));
    }
    const lunarParts = parseLunarDateTimeString(value);
    if (!lunarParts) {
        throw new Error('农历日期格式无效，请使用 L:yyyy-M-d HH:mm:ss 或 yyyy-M-d HH:mm:ss');
    }
    return formatSolarDateTime(lunarPartsToSolarParts(lunarParts));
}
