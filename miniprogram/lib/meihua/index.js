"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeiHuaPaiPan = void 0;
exports.createMeiHuaPaiPan = createMeiHuaPaiPan;
// @ts-ignore - lunar-javascript types are incomplete
const lunar_javascript_1 = require('../vendor/lunar');
const common_1 = require("../utils/common");
const dateTime_1 = require("../utils/dateTime");
const constants_1 = require("../constants");
const constants_2 = require("./constants");
const liuyaoMaps_1 = require("../liuyao/liuyaoMaps");
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
function formatKongWang(value) {
    return value ? value.join('、') : undefined;
}
function normalizeGuaNumber(value) {
    const mod = value % 8;
    return mod === 0 ? 8 : mod;
}
function normalizeDongYaoNumber(value) {
    const mod = value % 6;
    return mod === 0 ? 6 : mod;
}
function sumDigits(value) {
    return String(Math.abs(Math.trunc(value)))
        .split('')
        .reduce((total, digit) => total + Number(digit), 0);
}
function parseGuaMaValue(guaMa) {
    if (!guaMa) {
        return null;
    }
    const digits = String(Math.abs(Math.trunc(guaMa)));
    if (digits.length < 3) {
        return null;
    }
    const [shang, xia, dong] = digits
        .slice(0, 3)
        .split('')
        .map((digit) => Number(digit));
    if ([shang, xia, dong].some((digit) => Number.isNaN(digit))) {
        return null;
    }
    return {
        shangGuaNumber: normalizeGuaNumber(shang),
        xiaGuaNumber: normalizeGuaNumber(xia),
        dongYaoNumber: normalizeDongYaoNumber(dong),
    };
}
class MeiHuaPaiPan {
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        this.yearGanZhi = '';
        this.monthGanZhi = '';
        this.dayGanZhi = '';
        this.hourGanZhi = '';
        this.yearGan = '';
        this.monthGan = '';
        this.dayGan = '';
        this.hourGan = '';
        this.yearZhi = '';
        this.monthZhi = '';
        this.dayZhi = '';
        this.hourZhi = '';
        this.shangGuaNumber = 1;
        this.xiaGuaNumber = 1;
        this.dongYaoNumber = 1;
        this.guaMa = 111;
        this.settings = {
            name: (_a = settings.name) !== null && _a !== void 0 ? _a : '',
            occupy: (_b = settings.occupy) !== null && _b !== void 0 ? _b : '',
            sex: (_c = settings.sex) !== null && _c !== void 0 ? _c : 1,
            date: (_d = settings.date) !== null && _d !== void 0 ? _d : '2024-01-01 00:00:00',
            dateType: (_e = settings.dateType) !== null && _e !== void 0 ? _e : 0,
            leapMonthType: (_f = settings.leapMonthType) !== null && _f !== void 0 ? _f : 0,
            xuShiSuiType: (_g = settings.xuShiSuiType) !== null && _g !== void 0 ? _g : 0,
            jieQiType: (_h = settings.jieQiType) !== null && _h !== void 0 ? _h : 1,
            yearGanZhiType: (_j = settings.yearGanZhiType) !== null && _j !== void 0 ? _j : 2,
            monthGanZhiType: (_k = settings.monthGanZhiType) !== null && _k !== void 0 ? _k : 1,
            dayGanZhiType: (_l = settings.dayGanZhiType) !== null && _l !== void 0 ? _l : 0,
            guaMa: (_m = settings.guaMa) !== null && _m !== void 0 ? _m : 0,
            paiPanType: (_o = settings.paiPanType) !== null && _o !== void 0 ? _o : 0,
            shu: (_p = settings.shu) !== null && _p !== void 0 ? _p : 123,
            danShu: (_q = settings.danShu) !== null && _q !== void 0 ? _q : 12345,
            shuangShuOne: (_r = settings.shuangShuOne) !== null && _r !== void 0 ? _r : 12,
            shuangShuTwo: (_s = settings.shuangShuTwo) !== null && _s !== void 0 ? _s : 34,
            shangXiaGuaType: (_t = settings.shangXiaGuaType) !== null && _t !== void 0 ? _t : 0,
            dongYaoType: (_u = settings.dongYaoType) !== null && _u !== void 0 ? _u : 0,
        };
        this.initializeDate();
        this.initializeGanZhi();
        this.initializeJieQi();
        this.initializeNumbers();
    }
    getPaiPan() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const shangGuaName = (_a = liuyaoMaps_1.XIAN_TIAN_BA_GUA[this.shangGuaNumber]) !== null && _a !== void 0 ? _a : '';
        const xiaGuaName = (_b = liuyaoMaps_1.XIAN_TIAN_BA_GUA[this.xiaGuaNumber]) !== null && _b !== void 0 ? _b : '';
        const benGuaAs = this.getGuaAsByNumbers(this.shangGuaNumber, this.xiaGuaNumber);
        const { shangGuaNumber: bianShang, xiaGuaNumber: bianXia } = this.getBianGuaNumbers();
        const bianGuaAs = this.getGuaAsByNumbers(bianShang, bianXia);
        const [huGuaAs = '', cuoGuaAs = '', zongGuaAs = ''] = (_c = liuyaoMaps_1.HU_CUO_ZONG_FU[benGuaAs]) !== null && _c !== void 0 ? _c : ['', '', ''];
        const benGuaInfo = this.getGuaInfoByAs(benGuaAs);
        const bianGuaInfo = this.getGuaInfoByAs(bianGuaAs);
        const huGuaInfo = this.getGuaInfoByAs(huGuaAs);
        const cuoGuaInfo = this.getGuaInfoByAs(cuoGuaAs);
        const zongGuaInfo = this.getGuaInfoByAs(zongGuaAs);
        const shangGuaYong = this.dongYaoNumber > 3;
        const tiGua = shangGuaYong ? xiaGuaName : shangGuaName;
        const yongGua = shangGuaYong ? shangGuaName : xiaGuaName;
        const prevJieDate = this.prevJie.getSolar().toYmdHms();
        const nextJieDate = this.nextJie.getSolar().toYmdHms();
        const prevQiDate = this.prevQi.getSolar().toYmdHms();
        const nextQiDate = this.nextQi.getSolar().toYmdHms();
        const yueJiangData = this.getYueJiangData();
        return {
            solar: (0, common_1.formatDate)(this.solarDate),
            lunar: this.lunar.toString(),
            name: this.settings.name || undefined,
            occupy: this.settings.occupy || undefined,
            sex: this.settings.sex === 1 ? '男' : '女',
            age: calculateAge(this.solarDate, this.settings.xuShiSuiType),
            zao: this.settings.sex === 1 ? '乾造' : '坤造',
            xingQi: `周${this.lunar.getWeekInChinese()}`,
            jiJie: this.lunar.getSeason(),
            guaMa: this.guaMa,
            shangGua: this.formatTrigram(shangGuaName),
            xiaGua: this.formatTrigram(xiaGuaName),
            dongYao: this.dongYaoNumber,
            benGua: benGuaInfo.guaName,
            bianGua: bianGuaInfo.guaName,
            huGua: huGuaInfo.guaName,
            cuoGua: cuoGuaInfo.guaName,
            zongGua: zongGuaInfo.guaName,
            tiGua,
            yongGua,
            tiGuaWuXing: (_d = constants_2.BA_GUA_WU_XING[tiGua]) !== null && _d !== void 0 ? _d : '',
            yongGuaWuXing: (_e = constants_2.BA_GUA_WU_XING[yongGua]) !== null && _e !== void 0 ? _e : '',
            tiYongGuanXi: (_f = constants_2.YONG_TI_GUAN_XI[`${yongGua}${tiGua}`]) !== null && _f !== void 0 ? _f : '',
            benGuaWuXing: `上卦${(_g = constants_2.BA_GUA_WU_XING[shangGuaName]) !== null && _g !== void 0 ? _g : ''}，下卦${(_h = constants_2.BA_GUA_WU_XING[xiaGuaName]) !== null && _h !== void 0 ? _h : ''}`,
            benGuaFangWei: `上卦${(_j = constants_2.BA_GUA_FANG_WEI[shangGuaName]) !== null && _j !== void 0 ? _j : ''}，下卦${(_k = constants_2.BA_GUA_FANG_WEI[xiaGuaName]) !== null && _k !== void 0 ? _k : ''}`,
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
            yearGanWuXing: liuyaoMaps_1.TIAN_GAN_WU_XING[this.yearGan],
            monthGanWuXing: liuyaoMaps_1.TIAN_GAN_WU_XING[this.monthGan],
            dayGanWuXing: liuyaoMaps_1.TIAN_GAN_WU_XING[this.dayGan],
            hourGanWuXing: liuyaoMaps_1.TIAN_GAN_WU_XING[this.hourGan],
            yearZhiWuXing: liuyaoMaps_1.DI_ZHI_WU_XING[this.yearZhi],
            monthZhiWuXing: liuyaoMaps_1.DI_ZHI_WU_XING[this.monthZhi],
            dayZhiWuXing: liuyaoMaps_1.DI_ZHI_WU_XING[this.dayZhi],
            hourZhiWuXing: liuyaoMaps_1.DI_ZHI_WU_XING[this.hourZhi],
            yearNaYin: liuyaoMaps_1.NA_YIN[this.yearGanZhi],
            monthNaYin: liuyaoMaps_1.NA_YIN[this.monthGanZhi],
            dayNaYin: liuyaoMaps_1.NA_YIN[this.dayGanZhi],
            hourNaYin: liuyaoMaps_1.NA_YIN[this.hourGanZhi],
            yearKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.yearGanZhi]),
            monthKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.monthGanZhi]),
            dayKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.dayGanZhi]),
            hourKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.hourGanZhi]),
            prevJie: this.prevJie.toString(),
            prevJieDate,
            prevJieDay: diffParts(solarToDate(this.prevJie.getSolar()), this.solarDate).day,
            nextJie: this.nextJie.toString(),
            nextJieDate,
            nextJieDay: diffParts(this.solarDate, solarToDate(this.nextJie.getSolar())).day,
            prevQi: this.prevQi.toString(),
            prevQiDate,
            prevQiDay: diffParts(solarToDate(this.prevQi.getSolar()), this.solarDate).day,
            nextQi: this.nextQi.toString(),
            nextQiDate,
            nextQiDay: diffParts(this.solarDate, solarToDate(this.nextQi.getSolar())).day,
            chuShengJie: `${formatBirthMarker(this.prevJie.toString(), '后', solarToDate(this.prevJie.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextJie.toString(), '前', this.solarDate, solarToDate(this.nextJie.getSolar()))}`,
            chuShengQi: `${formatBirthMarker(this.prevQi.toString(), '后', solarToDate(this.prevQi.getSolar()), this.solarDate)}、${formatBirthMarker(this.nextQi.toString(), '前', this.solarDate, solarToDate(this.nextQi.getSolar()))}`,
            benGuaGuaCi: this.getGuaCi(benGuaInfo.guaName),
            bianGuaGuaCi: this.getGuaCi(bianGuaInfo.guaName),
            huGuaGuaCi: this.getGuaCi(huGuaInfo.guaName),
            cuoGuaGuaCi: this.getGuaCi(cuoGuaInfo.guaName),
            zongGuaGuaCi: this.getGuaCi(zongGuaInfo.guaName),
            benGuaLiuYao: this.getLiuYaoInfo(benGuaAs),
            bianGuaLiuYao: this.getLiuYaoInfo(bianGuaAs),
            huGuaLiuYao: this.getLiuYaoInfo(huGuaAs),
            cuoGuaLiuYao: this.getLiuYaoInfo(cuoGuaAs),
            zongGuaLiuYao: this.getLiuYaoInfo(zongGuaAs),
            benGuaShangGuaName: benGuaInfo.shangGuaName,
            benGuaXiaGuaName: benGuaInfo.xiaGuaName,
            benGuaShangGuaAs: benGuaInfo.shangGuaAs,
            benGuaXiaGuaAs: benGuaInfo.xiaGuaAs,
            bianGuaShangGuaName: bianGuaInfo.shangGuaName,
            bianGuaXiaGuaName: bianGuaInfo.xiaGuaName,
            bianGuaShangGuaAs: bianGuaInfo.shangGuaAs,
            bianGuaXiaGuaAs: bianGuaInfo.xiaGuaAs,
            huGuaShangGuaName: huGuaInfo.shangGuaName,
            huGuaXiaGuaName: huGuaInfo.xiaGuaName,
            huGuaShangGuaAs: huGuaInfo.shangGuaAs,
            huGuaXiaGuaAs: huGuaInfo.xiaGuaAs,
            cuoGuaShangGuaName: cuoGuaInfo.shangGuaName,
            cuoGuaXiaGuaName: cuoGuaInfo.xiaGuaName,
            cuoGuaShangGuaAs: cuoGuaInfo.shangGuaAs,
            cuoGuaXiaGuaAs: cuoGuaInfo.xiaGuaAs,
            zongGuaShangGuaName: zongGuaInfo.shangGuaName,
            zongGuaXiaGuaName: zongGuaInfo.xiaGuaName,
            zongGuaShangGuaAs: zongGuaInfo.shangGuaAs,
            zongGuaXiaGuaAs: zongGuaInfo.xiaGuaAs,
            shengXiao: this.getShengXiao(),
            xingZuo: `${this.solar.getXingZuo()}座`,
            yueXiang: this.lunar.getYueXiang(),
            yueJiang: yueJiangData[0],
            yueJiangShen: yueJiangData[1],
            wuBuYuShi: this.hourGanZhi === liuyaoMaps_1.WU_BU_YU_SHI[this.dayGan],
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
            this.lunar = lunar_javascript_1.Lunar.fromYmdHms(lunarParts.year, month, lunarParts.day, lunarParts.hour, lunarParts.minute, lunarParts.second);
            this.solar = this.lunar.getSolar();
            this.solarDate = solarToDate(this.solar);
            return;
        }
        const solarParts = (0, dateTime_1.parseSolarDateTimeString)(this.settings.date.trim());
        if (!solarParts) {
            throw new Error('日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
        }
        this.solarDate = (0, dateTime_1.solarPartsToDate)(solarParts);
        this.solar = lunar_javascript_1.Solar.fromDate(this.solarDate);
        this.lunar = this.solar.getLunar();
    }
    initializeGanZhi() {
        var _a, _b;
        this.yearGanZhi = this.getYearGanZhi();
        this.monthGanZhi = this.getMonthGanZhi();
        this.dayGanZhi = this.getDayGanZhiByRef(this.lunar);
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
    initializeNumbers() {
        const explicitGuaMa = parseGuaMaValue(this.settings.guaMa);
        const numbers = explicitGuaMa !== null && explicitGuaMa !== void 0 ? explicitGuaMa : this.generateNumbers();
        this.shangGuaNumber = numbers.shangGuaNumber;
        this.xiaGuaNumber = numbers.xiaGuaNumber;
        this.dongYaoNumber = numbers.dongYaoNumber;
        this.guaMa = this.shangGuaNumber * 100 + this.xiaGuaNumber * 10 + this.dongYaoNumber;
    }
    generateNumbers() {
        var _a, _b, _c, _d, _e, _f;
        if (this.settings.paiPanType === 1) {
            return {
                shangGuaNumber: Math.floor(Math.random() * 8) + 1,
                xiaGuaNumber: Math.floor(Math.random() * 8) + 1,
                dongYaoNumber: Math.floor(Math.random() * 6) + 1,
            };
        }
        if (this.settings.paiPanType === 2) {
            const number = String(this.settings.shu);
            const shang = Number((_a = number[0]) !== null && _a !== void 0 ? _a : '1');
            const xia = Number((_b = number[1]) !== null && _b !== void 0 ? _b : '2');
            const dong = Number((_c = number[2]) !== null && _c !== void 0 ? _c : '3');
            return {
                shangGuaNumber: normalizeGuaNumber(shang),
                xiaGuaNumber: normalizeGuaNumber(xia),
                dongYaoNumber: normalizeDongYaoNumber(dong),
            };
        }
        if (this.settings.paiPanType === 3) {
            const danShu = String(this.settings.danShu);
            const half = Math.floor(danShu.length / 2);
            const number1 = danShu.substring(0, half);
            const number2 = danShu.substring(half);
            const number1Count = number1 ? sumDigits(Number(number1)) : 0;
            const number2Count = number2 ? sumDigits(Number(number2)) : 0;
            return {
                shangGuaNumber: normalizeGuaNumber(number1Count),
                xiaGuaNumber: normalizeGuaNumber(number2Count),
                dongYaoNumber: normalizeDongYaoNumber(number1Count + number2Count),
            };
        }
        if (this.settings.paiPanType === 4) {
            let shuangShuOne = this.settings.shuangShuOne;
            let shuangShuTwo = this.settings.shuangShuTwo;
            if (this.settings.shangXiaGuaType === 0) {
                shuangShuOne = sumDigits(shuangShuOne);
                shuangShuTwo = sumDigits(shuangShuTwo);
            }
            let dongYaoBase = shuangShuOne + shuangShuTwo;
            if (this.settings.dongYaoType === 1) {
                dongYaoBase += (_d = liuyaoMaps_1.DI_ZHI_SHU[this.hourZhi]) !== null && _d !== void 0 ? _d : 1;
            }
            return {
                shangGuaNumber: normalizeGuaNumber(shuangShuOne),
                xiaGuaNumber: normalizeGuaNumber(shuangShuTwo),
                dongYaoNumber: normalizeDongYaoNumber(dongYaoBase),
            };
        }
        const yearNumber = (_e = liuyaoMaps_1.DI_ZHI_SHU[this.yearZhi]) !== null && _e !== void 0 ? _e : 1;
        const monthNumber = this.lunar.getMonth();
        const dayNumber = this.lunar.getDay();
        const hourNumber = (_f = liuyaoMaps_1.DI_ZHI_SHU[this.hourZhi]) !== null && _f !== void 0 ? _f : 1;
        return {
            shangGuaNumber: normalizeGuaNumber(yearNumber + monthNumber + dayNumber),
            xiaGuaNumber: normalizeGuaNumber(yearNumber + monthNumber + dayNumber + hourNumber),
            dongYaoNumber: normalizeDongYaoNumber(yearNumber + monthNumber + dayNumber + hourNumber),
        };
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
    getDayGanZhiByRef(lunarRef) {
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
        const data = liuyaoMaps_1.YUE_JIANG[key];
        if (!data) {
            throw new Error(`月将映射缺失: ${key}`);
        }
        return data;
    }
    getGuaAsByNumbers(shangGuaNumber, xiaGuaNumber) {
        var _a;
        return (_a = liuyaoMaps_1.LIU_SHI_SI_GUA_AS[`${shangGuaNumber},${xiaGuaNumber}`]) !== null && _a !== void 0 ? _a : '';
    }
    getBianGuaNumbers() {
        var _a, _b, _c, _d;
        if (this.dongYaoNumber <= 3) {
            return {
                shangGuaNumber: this.shangGuaNumber,
                xiaGuaNumber: (_b = (_a = constants_2.BIAN_GUA[this.xiaGuaNumber]) === null || _a === void 0 ? void 0 : _a[this.dongYaoNumber - 1]) !== null && _b !== void 0 ? _b : this.xiaGuaNumber,
            };
        }
        return {
            shangGuaNumber: (_d = (_c = constants_2.BIAN_GUA[this.shangGuaNumber]) === null || _c === void 0 ? void 0 : _c[this.dongYaoNumber - 4]) !== null && _d !== void 0 ? _d : this.shangGuaNumber,
            xiaGuaNumber: this.xiaGuaNumber,
        };
    }
    getGuaInfoByAs(guaAs) {
        var _a, _b, _c, _d, _e, _f, _g;
        const liuYaoAs = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_AS[guaAs];
        const info = liuYaoAs ? liuyaoMaps_1.GUA_NAME_AND_AS[liuYaoAs.join(',')] : undefined;
        return {
            shangGuaName: (_a = info === null || info === void 0 ? void 0 : info[0]) !== null && _a !== void 0 ? _a : '',
            shangGuaAs: (_b = info === null || info === void 0 ? void 0 : info[1]) !== null && _b !== void 0 ? _b : '',
            xiaGuaName: (_c = info === null || info === void 0 ? void 0 : info[2]) !== null && _c !== void 0 ? _c : '',
            xiaGuaAs: (_d = info === null || info === void 0 ? void 0 : info[3]) !== null && _d !== void 0 ? _d : '',
            guaName: (_f = (_e = info === null || info === void 0 ? void 0 : info[4]) !== null && _e !== void 0 ? _e : liuyaoMaps_1.LIU_SHI_SI_GUA[guaAs]) !== null && _f !== void 0 ? _f : '',
            guaAs: (_g = info === null || info === void 0 ? void 0 : info[5]) !== null && _g !== void 0 ? _g : guaAs,
        };
    }
    getGuaCi(guaName) {
        var _a, _b;
        return (_b = (_a = liuyaoMaps_1.LIU_SHI_SI_GUA_SHEN_CI[guaName]) === null || _a === void 0 ? void 0 : _a[2]) !== null && _b !== void 0 ? _b : '';
    }
    getLiuYaoInfo(guaAs) {
        var _a, _b, _c;
        return {
            yaoMing: [...((_a = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[guaAs]) !== null && _a !== void 0 ? _a : ['', '', '', '', '', ''])],
            yaoXiang: [...((_b = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_AS[guaAs]) !== null && _b !== void 0 ? _b : ['', '', '', '', '', ''])],
            yaoCi: [...((_c = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[guaAs]) !== null && _c !== void 0 ? _c : ['', '', '', '', '', ''])],
        };
    }
    formatTrigram(guaName) {
        var _a;
        return `${guaName}(${(_a = constants_1.BA_GUA_SYMBOL[guaName]) !== null && _a !== void 0 ? _a : ''})`;
    }
}
exports.MeiHuaPaiPan = MeiHuaPaiPan;
function createMeiHuaPaiPan(settings) {
    return new MeiHuaPaiPan(settings).getPaiPan();
}
