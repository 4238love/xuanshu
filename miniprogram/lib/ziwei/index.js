"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZiWeiPaiPan = void 0;
exports.createZiWeiPaiPan = createZiWeiPaiPan;
// @ts-ignore - lunar-javascript 类型定义不完整
const lunar_javascript_1 = require('../vendor/lunar');
const common_1 = require("../utils/common");
const dateTime_1 = require("../utils/dateTime");
const ZW = __importStar(require("./constants"));
const PALACE_ZHI_ORDER = [...ZW.SHI_ER_GONG_DI_ZHI];
function createEmptyPalaceList() {
    return new Array(12).fill('');
}
function wrapGongWei(value) {
    let current = value;
    while (current > 12)
        current -= 12;
    while (current < 1)
        current += 12;
    return current;
}
function appendStar(value, star) {
    return value ? `${value}_${star}` : star;
}
function splitStars(value) {
    if (!value) {
        return [];
    }
    return value.split('_').filter(Boolean);
}
function uniqueStrings(items) {
    return [...new Set(items.filter(Boolean))];
}
function solarToDate(solar) {
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond());
}
function diffParts(start, end) {
    let diff = Math.abs(end.getTime() - start.getTime());
    const day = Math.floor(diff / (24 * 60 * 60 * 1000));
    diff -= day * 24 * 60 * 60 * 1000;
    const hour = Math.floor(diff / (60 * 60 * 1000));
    diff -= hour * 60 * 60 * 1000;
    const minute = Math.floor(diff / (60 * 1000));
    diff -= minute * 60 * 1000;
    const second = Math.floor(diff / 1000);
    return { day, hour, minute, second };
}
function formatBirthMarker(name, relation, start, end) {
    const { day, hour, minute, second } = diffParts(start, end);
    return `${name}${relation}${day}天${hour}小时${minute}分${second}秒`;
}
function calculateAge(date, xuShiSuiType) {
    if (xuShiSuiType === 1) {
        return (0, common_1.getRealAge)(date);
    }
    const now = new Date();
    const realAge = (0, common_1.getRealAge)(date, now);
    const passedBirthday = now.getMonth() > date.getMonth() ||
        (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
    return realAge + (passedBirthday ? 1 : 0);
}
function findStarGongWei(zhuXing, xingMing) {
    for (let i = 0; i < zhuXing.length; i++) {
        const stars = splitStars(zhuXing[i]);
        if (stars.includes(xingMing)) {
            return i + 1;
        }
    }
    return 0;
}
function addZhuXing(source, target, index, mark = '') {
    const stars = splitStars(source[index]);
    for (const star of stars) {
        target.push(`${mark}${star}`);
    }
}
function getMarkPrefix(value) {
    const [prefix] = value.split('_', 1);
    const parsed = Number(prefix);
    return Number.isNaN(parsed) ? 0 : parsed;
}
class ZiWeiPaiPan {
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        this.yearGan = '';
        this.monthGan = '';
        this.dayGan = '';
        this.hourGan = '';
        this.yearZhi = '';
        this.monthZhi = '';
        this.dayZhi = '';
        this.hourZhi = '';
        this.yearGanZhi = '';
        this.monthGanZhi = '';
        this.dayGanZhi = '';
        this.hourGanZhi = '';
        this.mingGongGongWei = 0;
        this.shenGongGongWei = 0;
        this.wuXingJu = '';
        this.shiErGongZhuXing = [];
        this.shiErGongZhuXingMark = [];
        this.settings = {
            name: (_a = settings.name) !== null && _a !== void 0 ? _a : '',
            occupy: (_b = settings.occupy) !== null && _b !== void 0 ? _b : '',
            sex: (_c = settings.sex) !== null && _c !== void 0 ? _c : 1,
            date: (_d = settings.date) !== null && _d !== void 0 ? _d : '2024-01-01 00:00:00',
            dateType: (_e = settings.dateType) !== null && _e !== void 0 ? _e : 0,
            birthHour: settings.birthHour,
            leapMonthType: (_f = settings.leapMonthType) !== null && _f !== void 0 ? _f : 0,
            xuShiSuiType: (_g = settings.xuShiSuiType) !== null && _g !== void 0 ? _g : 0,
            jieQiType: (_h = settings.jieQiType) !== null && _h !== void 0 ? _h : 1,
            wuXingJuType: (_j = settings.wuXingJuType) !== null && _j !== void 0 ? _j : 0,
            yearGanZhiType: (_k = settings.yearGanZhiType) !== null && _k !== void 0 ? _k : 2,
            monthGanZhiType: (_l = settings.monthGanZhiType) !== null && _l !== void 0 ? _l : 1,
            dayGanZhiType: (_m = settings.dayGanZhiType) !== null && _m !== void 0 ? _m : 0,
        };
        this.initializeDate();
        this.initializeGanZhi();
        this.initializeJieQi();
    }
    getEffectiveHour(hour) {
        if (this.settings.birthHour === undefined) {
            return hour;
        }
        if (Number.isNaN(this.settings.birthHour)
            || !Number.isInteger(this.settings.birthHour)
            || this.settings.birthHour < 0
            || this.settings.birthHour > 23) {
            throw new Error('birthHour 必须是 0 到 23 之间的整数');
        }
        return this.settings.birthHour;
    }
    getPaiPan() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const yueJiangData = this.getYueJiangData();
        const shiErGongDiZhi = this.getShiErGongDiZhi();
        const shiErGongTianGan = this.getShiErGongTianGan();
        const shiErMingGong = this.getShiErMingGong();
        const shiErShenGong = this.getShiErShenGong();
        const ziWeiXingGongWei = this.getZiWeiXingGongWei();
        const tianFuXingGongWei = this.getTianFuXingGongWei();
        const ziWeiXingGongDiZhi = this.getZiWeiXingGongDiZhi();
        const tianFuXingGongDiZhi = this.getTianFuXingGongDiZhi();
        const ziWeiXingXiZhuXing = this.getZiWeiXingXiZhuXing();
        const tianFuXingXiZhuXing = this.getTianFuXingXiZhuXing();
        const shiZhiZhuXing = this.getShiZhiZhuXing();
        const yueZhiZhuXing = this.getYueZhiZhuXing();
        const nianGanZhuXing = this.getNianGanZhuXing();
        const nianZhiZhuXing = this.getNianZhiZhuXing();
        const dayZhuXing = this.getDayZhuXing();
        const shiErZhangSheng = this.getShiErZhangSheng();
        const jieLuKongWang = this.getJieLuKongWang();
        const xunZhongKongWang = this.getXunZhongKongWang();
        const tianShangTianShiXing = this.getTianShangTianShiXing();
        const daXian = this.getDaXian();
        const xiaoXian = this.getXiaoXian();
        const shiErGongBoShi = this.getShiErGongBoShi();
        const liuNianSuiQianZhuXing = this.getLiuNianSuiQianZhuXing();
        const liuNianJiangQianZhuXing = this.getLiuNianJiangQianZhuXing();
        const shiErGongZhuXing = this.getShiErGongZhuXing(false);
        const shiErGongZhuXingMark = this.getShiErGongZhuXing(true);
        const shiErGongZhuXingGuanXi = this.getShiErGongZhuXingGuanXi();
        const shiErGongSiHuaXing = this.getShiErGongSiHuaXing();
        const shiErGongSiHuaXingGuanXi = this.getShiErGongSiHuaXingGuanXi();
        const gongWei = this.buildGongWei({
            shiErGongDiZhi,
            shiErGongTianGan,
            shiErMingGong,
            shiErShenGong,
            shiErGongZhuXing,
            shiErGongZhuXingMark,
            shiErGongZhuXingGuanXi,
            shiErGongSiHuaXing,
            shiErGongSiHuaXingGuanXi,
            shiErZhangSheng,
            shiErGongBoShi,
            liuNianSuiQianZhuXing,
            liuNianJiangQianZhuXing,
        });
        const huaLu = (_b = (_a = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '';
        const huaQuan = (_d = (_c = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : '';
        const huaKe = (_f = (_e = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _e === void 0 ? void 0 : _e[2]) !== null && _f !== void 0 ? _f : '';
        const huaJi = (_h = (_g = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _g === void 0 ? void 0 : _g[3]) !== null && _h !== void 0 ? _h : '';
        const prevJieDate = this.prevJie.getSolar().toYmdHms();
        const nextJieDate = this.nextJie.getSolar().toYmdHms();
        const prevQiDate = this.prevQi.getSolar().toYmdHms();
        const nextQiDate = this.nextQi.getSolar().toYmdHms();
        return {
            solar: (0, common_1.formatDate)(this.solarDate),
            lunar: this.lunar.toString(),
            name: this.settings.name || undefined,
            occupy: this.settings.occupy || undefined,
            sex: this.getSex(),
            age: calculateAge(this.solarDate, this.settings.xuShiSuiType),
            zao: this.settings.sex === 1 ? '乾造' : '坤造',
            xingQi: `星期${this.lunar.getWeekInChinese()}`,
            jiJie: this.lunar.getSeason(),
            shengXiao: this.getShengXiao(),
            xingZuo: `${this.solar.getXingZuo()}座`,
            yueXiang: this.lunar.getYueXiang(),
            yueJiang: yueJiangData[0],
            yueJiangShen: yueJiangData[1],
            wuBuYuShi: this.hourGanZhi === ZW.WU_BU_YU_SHI[this.dayGan],
            yearGan: this.yearGan,
            monthGan: this.monthGan,
            dayGan: this.dayGan,
            hourGan: this.hourGan,
            yearZhi: this.yearZhi,
            monthZhi: this.monthZhi,
            dayZhi: this.dayZhi,
            hourZhi: this.hourZhi,
            yearGanZhi: this.yearGanZhi,
            monthGanZhi: this.monthGanZhi,
            dayGanZhi: this.dayGanZhi,
            hourGanZhi: this.hourGanZhi,
            yearGanWuXing: ZW.TIAN_GAN_WU_XING[this.yearGan],
            monthGanWuXing: ZW.TIAN_GAN_WU_XING[this.monthGan],
            dayGanWuXing: ZW.TIAN_GAN_WU_XING[this.dayGan],
            hourGanWuXing: ZW.TIAN_GAN_WU_XING[this.hourGan],
            yearZhiWuXing: ZW.DI_ZHI_WU_XING[this.yearZhi],
            monthZhiWuXing: ZW.DI_ZHI_WU_XING[this.monthZhi],
            dayZhiWuXing: ZW.DI_ZHI_WU_XING[this.dayZhi],
            hourZhiWuXing: ZW.DI_ZHI_WU_XING[this.hourZhi],
            yearGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.yearGan]}${ZW.DI_ZHI_WU_XING[this.yearZhi]}`,
            monthGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.monthGan]}${ZW.DI_ZHI_WU_XING[this.monthZhi]}`,
            dayGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.dayGan]}${ZW.DI_ZHI_WU_XING[this.dayZhi]}`,
            hourGanZhiWuXing: `${ZW.TIAN_GAN_WU_XING[this.hourGan]}${ZW.DI_ZHI_WU_XING[this.hourZhi]}`,
            yearGanZhiNaYin: ZW.NA_YIN[this.yearGanZhi],
            monthGanZhiNaYin: ZW.NA_YIN[this.monthGanZhi],
            dayGanZhiNaYin: ZW.NA_YIN[this.dayGanZhi],
            hourGanZhiNaYin: ZW.NA_YIN[this.hourGanZhi],
            yearGanZhiKongWang: ZW.KONG_WANG[this.yearGanZhi],
            monthGanZhiKongWang: ZW.KONG_WANG[this.monthGanZhi],
            dayGanZhiKongWang: ZW.KONG_WANG[this.dayGanZhi],
            hourGanZhiKongWang: ZW.KONG_WANG[this.hourGanZhi],
            prevJie: this.prevJie.toString(),
            prevJieDate,
            prevJieDay: diffParts(solarToDate(this.prevJie.getSolar()), this.solarDate).day,
            nextJie: this.nextJie.toString(),
            nextJieDate,
            nextJieDay: diffParts(this.solarDate, solarToDate(this.nextJie.getSolar())).day,
            chuShengJie: `${formatBirthMarker(this.prevJie.toString(), '后', solarToDate(this.prevJie.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextJie.toString(), '前', this.solarDate, solarToDate(this.nextJie.getSolar()))}`,
            prevQi: this.prevQi.toString(),
            prevQiDate,
            prevQiDay: diffParts(solarToDate(this.prevQi.getSolar()), this.solarDate).day,
            nextQi: this.nextQi.toString(),
            nextQiDate,
            nextQiDay: diffParts(this.solarDate, solarToDate(this.nextQi.getSolar())).day,
            chuShengQi: `${formatBirthMarker(this.prevQi.toString(), '后', solarToDate(this.prevQi.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextQi.toString(), '前', this.solarDate, solarToDate(this.nextQi.getSolar()))}`,
            wuXingJu: this.getWuXingJu(),
            mingGong: this.getMingGongDiZhi(),
            shenGong: this.getShenGongDiZhi(),
            mingGongGongWei: this.getMingGongGongWei(),
            shenGongGongWei: this.getShenGongGongWei(),
            ziWeiXingGongWei,
            tianFuXingGongWei,
            ziWeiXingGongDiZhi,
            tianFuXingGongDiZhi,
            shiErGongDiZhi,
            shiErGongTianGan,
            shiErMingGong,
            shiErShenGong,
            ziWeiXingXiZhuXing,
            tianFuXingXiZhuXing,
            shiZhiZhuXing,
            yueZhiZhuXing,
            nianGanZhuXing,
            nianZhiZhuXing,
            dayZhuXing,
            shiErZhangSheng,
            jieLuKongWang,
            xunZhongKongWang,
            tianShangTianShiXing,
            shiErGongBoShi,
            liuNianSuiQianZhuXing,
            liuNianJiangQianZhuXing,
            shiErGongZhuXing,
            shiErGongZhuXingMark,
            shiErGongZhuXingGuanXi,
            gongWei,
            huaLu,
            huaQuan,
            huaKe,
            huaJi,
            shiErGongSiHuaXing,
            shiErGongSiHuaXingGuanXi,
            huaLuJieDu: this.getHuaLuXingGongWeiJieDu(),
            huaQuanJieDu: this.getHuaQuanXingGongWeiJieDu(),
            huaKeJieDu: this.getHuaKeXingGongWeiJieDu(),
            huaJiJieDu: this.getHuaJiXingGongWeiJieDu(),
            daXian,
            xiaoXian,
            mingZhu: this.getMingZhu(),
            shenZhu: this.getShenZhu(),
            ziDou: this.getZiDou(),
            liuDou: this.getLiuDou(),
        };
    }
    initializeDate() {
        if (this.settings.dateType === 1) {
            const lunarParts = (0, dateTime_1.parseLunarDateTimeString)(this.settings.date.trim());
            if (!lunarParts) {
                throw new Error('农历日期格式无效，请使用 L:yyyy-M-d HH:mm:ss 或 yyyy-M-d HH:mm:ss');
            }
            const month = this.settings.leapMonthType === 1 || lunarParts.isLeap
                ? -Math.abs(lunarParts.month)
                : Math.abs(lunarParts.month);
            this.lunar = lunar_javascript_1.Lunar.fromYmdHms(lunarParts.year, month, lunarParts.day, this.getEffectiveHour(lunarParts.hour), lunarParts.minute, lunarParts.second);
            this.solar = this.lunar.getSolar();
            this.solarDate = solarToDate(this.solar);
            return;
        }
        const solarParts = (0, dateTime_1.parseSolarDateTimeString)(this.settings.date.trim());
        if (!solarParts) {
            throw new Error('日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
        }
        this.solarDate = (0, dateTime_1.solarPartsToDate)({
            ...solarParts,
            hour: this.getEffectiveHour(solarParts.hour),
        });
        this.solar = lunar_javascript_1.Solar.fromDate(this.solarDate);
        this.lunar = this.solar.getLunar();
    }
    initializeGanZhi() {
        var _a, _b;
        this.yearGanZhi = this.getYearGanZhi();
        this.monthGanZhi = this.getMonthGanZhi();
        this.dayGanZhi = this.getDayGanZhi();
        this.eightChar = this.lunar.getEightChar();
        (_b = (_a = this.eightChar).setSect) === null || _b === void 0 ? void 0 : _b.call(_a, this.settings.dayGanZhiType + 1);
        this.hourGanZhi = this.eightChar.getTime();
        this.yearGan = this.yearGanZhi.substring(0, 1);
        this.monthGan = this.monthGanZhi.substring(0, 1);
        this.dayGan = this.dayGanZhi.substring(0, 1);
        this.hourGan = this.hourGanZhi.substring(0, 1);
        this.yearZhi = this.yearGanZhi.substring(1, 2);
        this.monthZhi = this.monthGanZhi.substring(1, 2);
        this.dayZhi = this.dayGanZhi.substring(1, 2);
        this.hourZhi = this.hourGanZhi.substring(1, 2);
    }
    initializeJieQi() {
        const byDay = this.settings.jieQiType === 0;
        const lunarRef = this.lunar;
        this.prevJie = lunarRef.getPrevJie(byDay);
        this.nextJie = lunarRef.getNextJie(byDay);
        this.prevQi = lunarRef.getPrevQi(byDay);
        this.nextQi = lunarRef.getNextQi(byDay);
    }
    getSex() {
        return this.settings.sex === 1 ? '男' : '女';
    }
    getNanNvYinYang() {
        return `${ZW.TIAN_GAN_YIN_YANG[this.yearGan]}${this.getSex()}`;
    }
    getYearGanZhi() {
        const lunarRef = this.lunar;
        if (this.settings.yearGanZhiType === 0) {
            return lunarRef.getYearInGanZhi();
        }
        if (this.settings.yearGanZhiType === 1) {
            return lunarRef.getYearInGanZhiByLiChun();
        }
        return lunarRef.getYearInGanZhiExact();
    }
    getMonthGanZhi() {
        const lunarRef = this.lunar;
        return this.settings.monthGanZhiType === 0
            ? lunarRef.getMonthInGanZhi()
            : lunarRef.getMonthInGanZhiExact();
    }
    getDayGanZhi() {
        const lunarRef = this.lunar;
        return this.settings.dayGanZhiType === 0
            ? lunarRef.getDayInGanZhiExact()
            : lunarRef.getDayInGanZhiExact2();
    }
    getShengXiao() {
        const lunarRef = this.lunar;
        if (this.settings.yearGanZhiType === 0) {
            return lunarRef.getYearShengXiao();
        }
        if (this.settings.yearGanZhiType === 1) {
            return lunarRef.getYearShengXiaoByLiChun();
        }
        return lunarRef.getYearShengXiaoExact();
    }
    getYueJiangData() {
        const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
        const data = ZW.YUE_JIANG[key];
        if (!data) {
            throw new Error(`月将映射缺失: ${key}`);
        }
        return data;
    }
    getShiErGongDiZhi() {
        return [...PALACE_ZHI_ORDER];
    }
    getShiErGongTianGan() {
        return this.getShiErGongDiZhi().map((zhi) => { var _a; return (_a = ZW.SHI_ER_GONG_TIAN_GAN[`${this.yearGan}${zhi}`]) !== null && _a !== void 0 ? _a : ''; });
    }
    getMingGongGongWei() {
        if (this.mingGongGongWei) {
            return this.mingGongGongWei;
        }
        let gongWei = this.lunar.getMonth() > 0 ? this.lunar.getMonth() : -this.lunar.getMonth() + 1;
        for (let i = 0; i < ZW.DI_ZHI.length; i++) {
            if (ZW.DI_ZHI[i] !== this.hourZhi) {
                gongWei -= 1;
                if (gongWei === 0) {
                    gongWei = 12;
                }
            }
            else {
                break;
            }
        }
        this.mingGongGongWei = gongWei;
        return gongWei;
    }
    getShenGongGongWei() {
        if (this.shenGongGongWei) {
            return this.shenGongGongWei;
        }
        let gongWei = this.lunar.getMonth() > 0 ? this.lunar.getMonth() : -this.lunar.getMonth() + 1;
        for (let i = 0; i < ZW.DI_ZHI.length; i++) {
            if (ZW.DI_ZHI[i] !== this.hourZhi) {
                gongWei += 1;
                if (gongWei === 13) {
                    gongWei = 1;
                }
            }
            else {
                break;
            }
        }
        this.shenGongGongWei = gongWei;
        return gongWei;
    }
    getMingGongDiZhi() {
        return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getMingGongGongWei()];
    }
    getShenGongDiZhi() {
        return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getShenGongGongWei()];
    }
    getShiErMingGong() {
        const mingGongGongWei = this.getMingGongGongWei();
        const shiErMingGong = createEmptyPalaceList();
        shiErMingGong[mingGongGongWei - 1] = '命宫';
        let index = 0;
        for (let i = mingGongGongWei - 2; index < ZW.SHI_ER_GONG.length; i--) {
            if (i < 0) {
                i = 11;
            }
            shiErMingGong[i] = ZW.SHI_ER_GONG[index];
            index += 1;
        }
        return shiErMingGong;
    }
    getShiErShenGong() {
        const shiErShenGong = createEmptyPalaceList();
        shiErShenGong[this.getShenGongGongWei() - 1] = '身宫';
        return shiErShenGong;
    }
    getWuXingJu() {
        var _a, _b;
        if (this.wuXingJu) {
            return this.wuXingJu;
        }
        const mingGongIndex = this.getMingGongGongWei() - 1;
        const shiErGongDiZhi = this.getShiErGongDiZhi();
        if (this.settings.wuXingJuType === 0) {
            this.wuXingJu = (_a = ZW.WU_XING_JU_1[`${this.yearGan}${shiErGongDiZhi[mingGongIndex]}`]) !== null && _a !== void 0 ? _a : '';
        }
        else {
            const shiErGongTianGan = this.getShiErGongTianGan();
            this.wuXingJu = (_b = ZW.WU_XING_JU_2[`${shiErGongTianGan[mingGongIndex]}${shiErGongDiZhi[mingGongIndex]}`]) !== null && _b !== void 0 ? _b : '';
        }
        return this.wuXingJu;
    }
    getZiWeiXingGongWei() {
        const lunarDay = Math.abs(this.lunar.getDay());
        return ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.ZI_WEI_XING_GONG_WEI[`${lunarDay}${this.getWuXingJu()}`]];
    }
    getTianFuXingGongWei() {
        return ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.TIAN_FU_ZI_WEI[this.getZiWeiXingGongDiZhi()]];
    }
    getZiWeiXingGongDiZhi() {
        return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getZiWeiXingGongWei()];
    }
    getTianFuXingGongDiZhi() {
        return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[this.getTianFuXingGongWei()];
    }
    getZiWeiXingXiZhuXing() {
        var _a;
        return [...((_a = ZW.ZI_WEI_XING_XING_XI_ZHU_XING[this.getZiWeiXingGongDiZhi()]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getTianFuXingXiZhuXing() {
        var _a;
        return [...((_a = ZW.TIAN_FU_XING_XING_XI_ZHU_XING[this.getTianFuXingGongDiZhi()]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getShiZhiZhuXing() {
        var _a;
        return [...((_a = ZW.SHI_ZHI_ZHU_XING[`${this.hourZhi}${this.yearZhi}`]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getYueZhiZhuXing() {
        var _a;
        return [...((_a = ZW.YUE_ZHI_ZHU_XING[this.monthZhi]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getNianGanZhuXing() {
        var _a;
        return [...((_a = ZW.NIAN_GAN_ZHU_XING[this.yearGan]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getNianZhiZhuXing() {
        var _a;
        const nianZhiZhuXing = [...((_a = ZW.NIAN_ZHI_ZHU_XING[this.yearZhi]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
        const tianCaiXingGongName = ZW.NIAN_ZHI_TIAN_CAI_XING_GONG_WEI[this.yearZhi];
        const shiErMingGong = this.getShiErMingGong();
        for (let i = 0; i < shiErMingGong.length; i++) {
            if (shiErMingGong[i] === tianCaiXingGongName) {
                nianZhiZhuXing[i] = appendStar(nianZhiZhuXing[i], '天才');
                break;
            }
        }
        for (let i = 0; i < ZW.DI_ZHI.length; i++) {
            if (this.yearZhi === ZW.DI_ZHI[i]) {
                const gongWei = wrapGongWei(this.getShenGongGongWei() + i);
                nianZhiZhuXing[gongWei - 1] = appendStar(nianZhiZhuXing[gongWei - 1], '天寿');
                break;
            }
        }
        return nianZhiZhuXing;
    }
    getDayZhuXing() {
        const days = this.lunar.getDay() - 1;
        const dayZhuXing = createEmptyPalaceList();
        const zuoFuXingGongWei = findStarGongWei(this.getYueZhiZhuXing(), '左辅');
        const sanTaiXingGongWei = wrapGongWei(zuoFuXingGongWei + days);
        dayZhuXing[sanTaiXingGongWei - 1] = '三台';
        const youBiXingGongWei = findStarGongWei(this.getYueZhiZhuXing(), '右弼');
        let baZuoXingGongWei = youBiXingGongWei - days;
        while (baZuoXingGongWei < 0) {
            baZuoXingGongWei += 12;
        }
        baZuoXingGongWei = baZuoXingGongWei === 0 ? 1 : baZuoXingGongWei;
        dayZhuXing[baZuoXingGongWei - 1] = '八座';
        const wenChangXingGongWei = findStarGongWei(this.getShiZhiZhuXing(), '文昌');
        let enGuangXingGongWei = wrapGongWei(wenChangXingGongWei + days);
        enGuangXingGongWei = enGuangXingGongWei - 1 === 0 ? 12 : enGuangXingGongWei - 1;
        dayZhuXing[enGuangXingGongWei - 1] = '恩光';
        const wenQuXingGongWei = findStarGongWei(this.getShiZhiZhuXing(), '文曲');
        let tianGuiXingGongWei = wrapGongWei(wenQuXingGongWei + days);
        tianGuiXingGongWei = tianGuiXingGongWei - 1 === 0 ? 12 : tianGuiXingGongWei - 1;
        dayZhuXing[tianGuiXingGongWei - 1] = '天贵';
        return dayZhuXing;
    }
    getShiErZhangSheng() {
        var _a;
        let yinYang = this.getNanNvYinYang();
        if (yinYang === '阳女') {
            yinYang = '阴男';
        }
        else if (yinYang === '阴女') {
            yinYang = '阳男';
        }
        return [...((_a = ZW.SHI_ER_ZHANG_SHENG[`${yinYang}${this.getWuXingJu()}`]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getJieLuKongWang() {
        const jieLuKongWang = createEmptyPalaceList();
        const luoGong = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[ZW.JIE_LU_KONG_WANG[this.yearGan]];
        jieLuKongWang[luoGong - 1] = '截路';
        return jieLuKongWang;
    }
    getXunZhongKongWang() {
        var _a;
        const xunZhongKongWang = createEmptyPalaceList();
        const kongWang = (_a = ZW.XUN_ZHONG_KONG_WANG[`${this.yearGan}${this.yearZhi}`]) !== null && _a !== void 0 ? _a : [];
        if (kongWang[0]) {
            xunZhongKongWang[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[kongWang[0]] - 1] = '旬空';
        }
        if (kongWang[1]) {
            xunZhongKongWang[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[kongWang[1]] - 1] = '副旬';
        }
        return xunZhongKongWang;
    }
    getTianShangTianShiXing() {
        var _a;
        const stars = createEmptyPalaceList();
        const gongWei = (_a = ZW.TIAN_SHANG_TIAN_SHI_XING_GONG_WEI[this.getMingGongDiZhi()]) !== null && _a !== void 0 ? _a : [];
        if (gongWei[0]) {
            stars[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[gongWei[0]] - 1] = '天伤';
        }
        if (gongWei[1]) {
            stars[ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[gongWei[1]] - 1] = '天使';
        }
        return stars;
    }
    getDaXian() {
        var _a, _b;
        let yinYang = this.getNanNvYinYang();
        if (yinYang === '阳女') {
            yinYang = '阴男';
        }
        else if (yinYang === '阴女') {
            yinYang = '阳男';
        }
        const daXian = createEmptyPalaceList();
        const base = (_a = ZW.DA_XIAN[`${yinYang}${this.getWuXingJu()}`]) !== null && _a !== void 0 ? _a : createEmptyPalaceList();
        let index = this.getMingGongGongWei() - 1;
        for (let i = 0; i < 12; i++) {
            daXian[index] = (_b = base[i]) !== null && _b !== void 0 ? _b : '';
            index += 1;
            if (index > 11) {
                index = 0;
            }
        }
        return daXian;
    }
    getXiaoXian() {
        var _a;
        return [...((_a = ZW.XIAO_XIAN[`${this.yearZhi}${this.getSex()}`]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getShiErGongBoShi() {
        var _a, _b;
        const shiErGongBoShi = createEmptyPalaceList();
        const sequence = [...ZW.SHI_ER_GONG_BO_SHI_SHUN];
        let gongWei = findStarGongWei(this.getNianGanZhuXing(), '禄存') - 1;
        const yinYang = this.getNanNvYinYang();
        if (gongWei < 0) {
            gongWei = 0;
        }
        if (yinYang === '阳男' || yinYang === '阴女') {
            for (let i = 0; i < 12; i++) {
                shiErGongBoShi[gongWei] = (_a = sequence[i]) !== null && _a !== void 0 ? _a : '';
                gongWei += 1;
                if (gongWei > 11) {
                    gongWei = 0;
                }
            }
        }
        else {
            for (let i = 0; i < 12; i++) {
                shiErGongBoShi[gongWei] = (_b = sequence[i]) !== null && _b !== void 0 ? _b : '';
                gongWei -= 1;
                if (gongWei < 0) {
                    gongWei = 11;
                }
            }
        }
        return shiErGongBoShi;
    }
    getLiuNianSuiQianZhuXing() {
        var _a;
        return [...((_a = ZW.LIU_NIAN_SUI_QIAN_ZHU_XING[this.yearZhi]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getLiuNianJiangQianZhuXing() {
        var _a;
        return [...((_a = ZW.LIU_NIAN_JIANG_QIAN_ZHU_XING[this.yearZhi]) !== null && _a !== void 0 ? _a : createEmptyPalaceList())];
    }
    getShiErGongZhuXing(isMark) {
        if (this.shiErGongZhuXing.length && this.shiErGongZhuXingMark.length) {
            return isMark ? this.shiErGongZhuXingMark : this.shiErGongZhuXing;
        }
        const shiErGongZhuXing = [];
        const shiErGongZhuXingMark = [];
        const ziWeiXingXiZhuXing = this.getZiWeiXingXiZhuXing();
        const tianFuXingXiZhuXing = this.getTianFuXingXiZhuXing();
        const shiZhiZhuXing = this.getShiZhiZhuXing();
        const yueZhiZhuXing = this.getYueZhiZhuXing();
        const nianGanZhuXing = this.getNianGanZhuXing();
        const nianZhiZhuXing = this.getNianZhiZhuXing();
        const dayZhuXing = this.getDayZhuXing();
        const tianShangTianShiXing = this.getTianShangTianShiXing();
        const jieLuKongWang = this.getJieLuKongWang();
        const xunZhongKongWang = this.getXunZhongKongWang();
        for (let i = 0; i < 12; i++) {
            const oneGongZhuXing = [];
            const oneGongZhuXingMark = [];
            if (ziWeiXingXiZhuXing[i]) {
                oneGongZhuXing.push(ziWeiXingXiZhuXing[i]);
                oneGongZhuXingMark.push(`1_${ziWeiXingXiZhuXing[i]}`);
            }
            if (tianFuXingXiZhuXing[i]) {
                oneGongZhuXing.push(tianFuXingXiZhuXing[i]);
                oneGongZhuXingMark.push(`2_${tianFuXingXiZhuXing[i]}`);
            }
            addZhuXing(shiZhiZhuXing, oneGongZhuXing, i);
            addZhuXing(shiZhiZhuXing, oneGongZhuXingMark, i, '3_');
            addZhuXing(yueZhiZhuXing, oneGongZhuXing, i);
            addZhuXing(yueZhiZhuXing, oneGongZhuXingMark, i, '4_');
            addZhuXing(nianGanZhuXing, oneGongZhuXing, i);
            addZhuXing(nianGanZhuXing, oneGongZhuXingMark, i, '5_');
            addZhuXing(nianZhiZhuXing, oneGongZhuXing, i);
            addZhuXing(nianZhiZhuXing, oneGongZhuXingMark, i, '6_');
            if (dayZhuXing[i]) {
                oneGongZhuXing.push(dayZhuXing[i]);
                oneGongZhuXingMark.push(`7_${dayZhuXing[i]}`);
            }
            if (tianShangTianShiXing[i]) {
                oneGongZhuXing.push(tianShangTianShiXing[i]);
                oneGongZhuXingMark.push(`8_${tianShangTianShiXing[i]}`);
            }
            if (jieLuKongWang[i]) {
                oneGongZhuXing.push(jieLuKongWang[i]);
                oneGongZhuXingMark.push(`9_${jieLuKongWang[i]}`);
            }
            if (xunZhongKongWang[i]) {
                oneGongZhuXing.push(xunZhongKongWang[i]);
                oneGongZhuXingMark.push(`10_${xunZhongKongWang[i]}`);
            }
            shiErGongZhuXing.push(oneGongZhuXing);
            shiErGongZhuXingMark.push(oneGongZhuXingMark);
        }
        this.shiErGongZhuXing = shiErGongZhuXing;
        this.shiErGongZhuXingMark = shiErGongZhuXingMark;
        return isMark ? shiErGongZhuXingMark : shiErGongZhuXing;
    }
    getShiErGongZhuXingGuanXi() {
        const zhuXingGuanXiMap = ZW.ZHU_XING_GUAN_XI;
        return this.getShiErGongZhuXing(false).map((oneGongXing, palaceIndex) => oneGongXing.map((item) => { var _a; return ((_a = zhuXingGuanXiMap[item]) === null || _a === void 0 ? void 0 : _a[palaceIndex]) || '~'; }));
    }
    getHuaLuXingGongWei() {
        var _a;
        const target = (_a = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _a === void 0 ? void 0 : _a[0];
        return this.findSiHuaGongWei(target);
    }
    getHuaQuanXingGongWei() {
        var _a;
        const target = (_a = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _a === void 0 ? void 0 : _a[1];
        return this.findSiHuaGongWei(target);
    }
    getHuaKeXingGongWei() {
        var _a;
        const target = (_a = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _a === void 0 ? void 0 : _a[2];
        return this.findSiHuaGongWei(target);
    }
    getHuaJiXingGongWei() {
        var _a;
        const target = (_a = ZW.SI_HUA_GONG_WEI[this.yearGan]) === null || _a === void 0 ? void 0 : _a[3];
        return this.findSiHuaGongWei(target);
    }
    findSiHuaGongWei(target) {
        if (!target) {
            return 1;
        }
        const shiErGongZhuXing = this.getShiErGongZhuXing(false);
        for (let i = 0; i < shiErGongZhuXing.length; i++) {
            if (shiErGongZhuXing[i].includes(target)) {
                return i + 1;
            }
        }
        return 1;
    }
    getHuaLuXingGongWeiJieDu() {
        var _a;
        const huaLuLuoGong = this.getShiErMingGong()[this.getHuaLuXingGongWei() - 1];
        return `化禄星落${huaLuLuoGong}宫，${(_a = ZW.SI_HUA_XING_SHI_ER_GONG[`禄${huaLuLuoGong}`]) !== null && _a !== void 0 ? _a : ''}`;
    }
    getHuaQuanXingGongWeiJieDu() {
        var _a;
        const huaQuanLuoGong = this.getShiErMingGong()[this.getHuaQuanXingGongWei() - 1];
        return `化权星落${huaQuanLuoGong}宫，${(_a = ZW.SI_HUA_XING_SHI_ER_GONG[`权${huaQuanLuoGong}`]) !== null && _a !== void 0 ? _a : ''}`;
    }
    getHuaKeXingGongWeiJieDu() {
        var _a;
        const huaKeLuoGong = this.getShiErMingGong()[this.getHuaKeXingGongWei() - 1];
        return `化科星落${huaKeLuoGong}宫，${(_a = ZW.SI_HUA_XING_SHI_ER_GONG[`科${huaKeLuoGong}`]) !== null && _a !== void 0 ? _a : ''}`;
    }
    getHuaJiXingGongWeiJieDu() {
        var _a;
        const huaJiLuoGong = this.getShiErMingGong()[this.getHuaJiXingGongWei() - 1];
        return `化忌星落${huaJiLuoGong}宫，${(_a = ZW.SI_HUA_XING_SHI_ER_GONG[`忌${huaJiLuoGong}`]) !== null && _a !== void 0 ? _a : ''}`;
    }
    getShiErGongSiHuaXing() {
        var _a;
        const siHuaList = (_a = ZW.SI_HUA_GONG_WEI[this.yearGan]) !== null && _a !== void 0 ? _a : [];
        return this.getShiErGongZhuXing(false).map((oneZhuXing) => {
            const oneSiHuaXing = [];
            for (const item of oneZhuXing) {
                if (item === siHuaList[0])
                    oneSiHuaXing.push('禄');
                if (item === siHuaList[1])
                    oneSiHuaXing.push('权');
                if (item === siHuaList[2])
                    oneSiHuaXing.push('科');
                if (item === siHuaList[3])
                    oneSiHuaXing.push('忌');
            }
            return oneSiHuaXing;
        });
    }
    getShiErGongSiHuaXingGuanXi() {
        return this.getShiErGongSiHuaXing().map((oneSiHuaXing, palaceIndex) => oneSiHuaXing.map((item) => { var _a; return ((_a = ZW.ZHU_XING_GUAN_XI[item]) === null || _a === void 0 ? void 0 : _a[palaceIndex]) || '~'; }));
    }
    getMingZhu() {
        var _a;
        return (_a = ZW.MING_ZHU[this.getMingGongDiZhi()]) !== null && _a !== void 0 ? _a : '';
    }
    getShenZhu() {
        var _a;
        return (_a = ZW.SHEN_ZHU[this.yearZhi]) !== null && _a !== void 0 ? _a : '';
    }
    getZiDou() {
        var _a;
        return (_a = ZW.ZI_DOU[`${this.monthZhi}${this.hourZhi}`]) !== null && _a !== void 0 ? _a : '';
    }
    getLiuDou() {
        let ziDouGongWei = ZW.SHI_ER_GONG_DI_ZHI_GONG_WEI[this.getZiDou()];
        for (let i = 0; i < ZW.DI_ZHI.length; i++) {
            if (ZW.DI_ZHI[i] !== this.yearZhi) {
                ziDouGongWei += 1;
                if (ziDouGongWei > 12) {
                    ziDouGongWei = 1;
                }
            }
            else {
                break;
            }
        }
        return ZW.GONG_WEI_SHI_ER_GONG_DI_ZHI[ziDouGongWei];
    }
    buildGongWei(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const gongWei = {};
        for (let i = 0; i < 12; i++) {
            const diZhi = data.shiErGongDiZhi[i];
            const allStars = (_a = data.shiErGongZhuXing[i]) !== null && _a !== void 0 ? _a : [];
            const allMarks = (_b = data.shiErGongZhuXingMark[i]) !== null && _b !== void 0 ? _b : [];
            const allRelations = (_c = data.shiErGongZhuXingGuanXi[i]) !== null && _c !== void 0 ? _c : [];
            const zhuXing = [];
            const zhuXingGuanXi = [];
            const auxStars = [];
            const minorStars = [];
            for (let index = 0; index < allMarks.length; index++) {
                const mark = allMarks[index];
                const star = mark.replace(/^\d+_/, '');
                const relation = (_d = allRelations[index]) !== null && _d !== void 0 ? _d : '~';
                const prefix = getMarkPrefix(mark);
                if (prefix <= 2) {
                    zhuXing.push(star);
                    zhuXingGuanXi.push(relation);
                }
                else if (prefix <= 7) {
                    auxStars.push(star);
                }
                else {
                    minorStars.push(star);
                }
            }
            gongWei[diZhi] = {
                name: (_e = data.shiErMingGong[i]) !== null && _e !== void 0 ? _e : '',
                tianGan: (_f = data.shiErGongTianGan[i]) !== null && _f !== void 0 ? _f : '',
                diZhi,
                isMingGong: ((_g = data.shiErMingGong[i]) !== null && _g !== void 0 ? _g : '') === '命宫',
                isShenGong: ((_h = data.shiErShenGong[i]) !== null && _h !== void 0 ? _h : '') === '身宫',
                zhuXing,
                zhuXingGuanXi,
                auxStars: uniqueStrings(auxStars),
                minorStars: uniqueStrings(minorStars),
                siHua: (_j = data.shiErGongSiHuaXing[i]) !== null && _j !== void 0 ? _j : [],
                siHuaGuanXi: (_k = data.shiErGongSiHuaXingGuanXi[i]) !== null && _k !== void 0 ? _k : [],
                allStars,
                allStarMarks: allMarks,
                allStarRelations: allRelations,
                zhangSheng: (_l = data.shiErZhangSheng[i]) !== null && _l !== void 0 ? _l : '',
                boShi: (_m = data.shiErGongBoShi[i]) !== null && _m !== void 0 ? _m : '',
                liuNianSuiQian: (_o = data.liuNianSuiQianZhuXing[i]) !== null && _o !== void 0 ? _o : '',
                liuNianJiangQian: (_p = data.liuNianJiangQianZhuXing[i]) !== null && _p !== void 0 ? _p : '',
            };
        }
        return gongWei;
    }
}
exports.ZiWeiPaiPan = ZiWeiPaiPan;
function createZiWeiPaiPan(settings) {
    const paiPan = new ZiWeiPaiPan(settings);
    return paiPan.getPaiPan();
}
