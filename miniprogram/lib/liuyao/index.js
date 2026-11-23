"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiuYaoPaiPan = void 0;
exports.createLiuYaoPaiPan = createLiuYaoPaiPan;
// @ts-ignore - lunar-javascript types are incomplete
const lunar_javascript_1 = require('../vendor/lunar');
const shenShaConfig_1 = require("../config/shenShaConfig");
const common_1 = require("../utils/common");
const dateTime_1 = require("../utils/dateTime");
const liuyaoMaps_1 = require("./liuyaoMaps");
const shensha_1 = require("./shensha");
const YIN_YAO = '--';
const YANG_YAO = (_a = Object.values(liuyaoMaps_1.XIAN_TIAN_BA_GUA_YAO)
    .flat()
    .find((value) => value !== YIN_YAO)) !== null && _a !== void 0 ? _a : '—';
const YAO_NUMBER_TO_MANUAL_CODE = {
    6: 3,
    7: 0,
    8: 1,
    9: 2,
};
const TIAN_GAN_SET = new Set(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']);
const DI_ZHI_SET = new Set(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']);
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
    return `${name}${relation}${day}天${hour}小时${minute}分钟${second}秒`;
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
function normalizeManualYaoShu(values) {
    const next = [...(values !== null && values !== void 0 ? values : [])].slice(0, 6);
    while (next.length < 6) {
        next.push(0);
    }
    return next.map((value) => (value >= 0 && value <= 3 ? value : 0));
}
function uniquePush(target, value) {
    if (value && !target.includes(value)) {
        target.push(value);
    }
}
function resolveYaoTupleByNumber(yaoNumber) {
    var _a, _b;
    const manualCode = (_a = YAO_NUMBER_TO_MANUAL_CODE[yaoNumber]) !== null && _a !== void 0 ? _a : 0;
    return (_b = liuyaoMaps_1.MANUAL_RANDOM_YAO[manualCode]) !== null && _b !== void 0 ? _b : [YANG_YAO, '', '少阳'];
}
function matchesShenShaTarget(target, pillarGan, pillarZhi, pillarGanZhi) {
    if (!target) {
        return false;
    }
    if (target === pillarGanZhi) {
        return true;
    }
    const chars = Array.from(target);
    if (chars.length === 2 && TIAN_GAN_SET.has(chars[0]) && DI_ZHI_SET.has(chars[1])) {
        return pillarGanZhi === target;
    }
    return target.includes(pillarGan) || target.includes(pillarZhi);
}
class LiuYaoPaiPan {
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
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
        this.yaoShu = [];
        this.liuYaoAs = [];
        this.liuYaoAsMark = [];
        this.liuYaoAsMarkName = [];
        this.bianGuaLiuYaoAs = [];
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
            paiPanType: (_m = settings.paiPanType) !== null && _m !== void 0 ? _m : 1,
            yaoShu: (_o = settings.yaoShu) !== null && _o !== void 0 ? _o : [],
            manualYaoShu: normalizeManualYaoShu(settings.manualYaoShu),
            shenShaConfig: (_p = settings.shenShaConfig) !== null && _p !== void 0 ? _p : {},
        };
        this.initializeDate();
        this.initializeGanZhi();
        this.initializeJieQi();
        this.initializeLiuYaoData();
    }
    getPaiPan() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
        const benGuaAs = this.getGuaAs(this.liuYaoAs);
        const bianGuaAs = this.getGuaAs(this.bianGuaLiuYaoAs);
        const [huGuaAs = '', cuoGuaAs = '', zongGuaAs = '', fuGuaAs = ''] = (_a = liuyaoMaps_1.HU_CUO_ZONG_FU[benGuaAs]) !== null && _a !== void 0 ? _a : ['', '', '', ''];
        const benGuaName = (_b = liuyaoMaps_1.LIU_SHI_SI_GUA[benGuaAs]) !== null && _b !== void 0 ? _b : '';
        const bianGuaName = (_c = liuyaoMaps_1.LIU_SHI_SI_GUA[bianGuaAs]) !== null && _c !== void 0 ? _c : '';
        const huGuaName = (_d = liuyaoMaps_1.LIU_SHI_SI_GUA[huGuaAs]) !== null && _d !== void 0 ? _d : '';
        const cuoGuaName = (_e = liuyaoMaps_1.LIU_SHI_SI_GUA[cuoGuaAs]) !== null && _e !== void 0 ? _e : '';
        const zongGuaName = (_f = liuyaoMaps_1.LIU_SHI_SI_GUA[zongGuaAs]) !== null && _f !== void 0 ? _f : '';
        const fuGuaName = (_g = liuyaoMaps_1.LIU_SHI_SI_GUA[fuGuaAs]) !== null && _g !== void 0 ? _g : '';
        const [shangGuaName = '', shangGuaSymbol = '', xiaGuaName = '', xiaGuaSymbol = ''] = (_h = liuyaoMaps_1.GUA_NAME_AND_AS[this.liuYaoAs.join(',')]) !== null && _h !== void 0 ? _h : ['', '', '', '', '', ''];
        const benGuaShenCi = (_j = liuyaoMaps_1.LIU_SHI_SI_GUA_SHEN_CI[benGuaName]) !== null && _j !== void 0 ? _j : ['', '', ''];
        const bianGuaShenCi = (_k = liuyaoMaps_1.LIU_SHI_SI_GUA_SHEN_CI[bianGuaName]) !== null && _k !== void 0 ? _k : ['', '', ''];
        const huGuaShenCi = (_l = liuyaoMaps_1.LIU_SHI_SI_GUA_SHEN_CI[huGuaName]) !== null && _l !== void 0 ? _l : ['', '', ''];
        const cuoGuaShenCi = (_m = liuyaoMaps_1.LIU_SHI_SI_GUA_SHEN_CI[cuoGuaName]) !== null && _m !== void 0 ? _m : ['', '', ''];
        const zongGuaShenCi = (_o = liuyaoMaps_1.LIU_SHI_SI_GUA_SHEN_CI[zongGuaName]) !== null && _o !== void 0 ? _o : ['', '', ''];
        const fuGuaShenCi = (_p = liuyaoMaps_1.LIU_SHI_SI_GUA_SHEN_CI[fuGuaName]) !== null && _p !== void 0 ? _p : ['', '', ''];
        const benGuaLiuQin = (_q = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[benGuaAs]) !== null && _q !== void 0 ? _q : ['', '', '', '', '', ''];
        const bianGuaLiuQin = (_r = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[bianGuaAs]) !== null && _r !== void 0 ? _r : ['', '', '', '', '', ''];
        const liuQinQueShi = (_s = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_QIN_QUE_SHI[benGuaName]) !== null && _s !== void 0 ? _s : null;
        const fuShen = this.calculateFuShen(fuGuaAs, liuQinQueShi);
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
            ageLabel: this.settings.xuShiSuiType === 1 ? '周岁' : '虚岁',
            xuSui: calculateAge(this.solarDate, 0),
            shiSui: calculateAge(this.solarDate, 1),
            zao: this.settings.sex === 1 ? '乾造' : '坤造',
            xingQi: `星期${this.lunar.getWeekInChinese()}`,
            jiJie: this.lunar.getSeason(),
            shengXiao: this.getShengXiao(),
            xingZuo: `${this.solar.getXingZuo()}座`,
            yueXiang: this.lunar.getYueXiang(),
            yueJiang: yueJiangData[0],
            yueJiangShen: yueJiangData[1],
            wuBuYuShi: this.hourGanZhi === liuyaoMaps_1.WU_BU_YU_SHI[this.dayGan],
            kongWang: liuyaoMaps_1.KONG_WANG[this.dayGanZhi] ? [...liuyaoMaps_1.KONG_WANG[this.dayGanZhi]] : undefined,
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
            yearGanZhiWuXing: `${liuyaoMaps_1.TIAN_GAN_WU_XING[this.yearGan]}${liuyaoMaps_1.DI_ZHI_WU_XING[this.yearZhi]}`,
            monthGanZhiWuXing: `${liuyaoMaps_1.TIAN_GAN_WU_XING[this.monthGan]}${liuyaoMaps_1.DI_ZHI_WU_XING[this.monthZhi]}`,
            dayGanZhiWuXing: `${liuyaoMaps_1.TIAN_GAN_WU_XING[this.dayGan]}${liuyaoMaps_1.DI_ZHI_WU_XING[this.dayZhi]}`,
            hourGanZhiWuXing: `${liuyaoMaps_1.TIAN_GAN_WU_XING[this.hourGan]}${liuyaoMaps_1.DI_ZHI_WU_XING[this.hourZhi]}`,
            yearGanZhiNaYin: liuyaoMaps_1.NA_YIN[this.yearGanZhi],
            monthGanZhiNaYin: liuyaoMaps_1.NA_YIN[this.monthGanZhi],
            dayGanZhiNaYin: liuyaoMaps_1.NA_YIN[this.dayGanZhi],
            hourGanZhiNaYin: liuyaoMaps_1.NA_YIN[this.hourGanZhi],
            yearGanZhiKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.yearGanZhi]),
            monthGanZhiKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.monthGanZhi]),
            dayGanZhiKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.dayGanZhi]),
            hourGanZhiKongWang: formatKongWang(liuyaoMaps_1.KONG_WANG[this.hourGanZhi]),
            shangGua: `${shangGuaName}(${shangGuaSymbol})`,
            xiaGua: `${xiaGuaName}(${xiaGuaSymbol})`,
            benGua: benGuaName,
            benGuaAs,
            bianGua: bianGuaName,
            bianGuaAs,
            huGua: huGuaName,
            huGuaAs,
            cuoGua: cuoGuaName,
            cuoGuaAs,
            zongGua: zongGuaName,
            zongGuaAs,
            fuGua: fuGuaName,
            fuGuaAs,
            benGuaType: benGuaShenCi[0],
            benGuaShen: benGuaShenCi[1],
            bianGuaType: bianGuaShenCi[0],
            bianGuaShen: bianGuaShenCi[1],
            benGuaCi: benGuaShenCi[2],
            bianGuaCi: bianGuaShenCi[2],
            huGuaCi: huGuaShenCi[2],
            cuoGuaCi: cuoGuaShenCi[2],
            zongGuaCi: zongGuaShenCi[2],
            fuGuaCi: fuGuaShenCi[2],
            liuYao: {
                benGua: {
                    yaoMing: (_t = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[benGuaAs]) !== null && _t !== void 0 ? _t : ['', '', '', '', '', ''],
                    yaoAs: [...this.liuYaoAs],
                    yaoAsMark: [...this.liuYaoAsMark],
                    yaoAsMarkName: [...this.liuYaoAsMarkName],
                    shiYing: (_u = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_SHI_YING[benGuaAs]) !== null && _u !== void 0 ? _u : ['', '', '', '', '', ''],
                    liuQin: benGuaLiuQin,
                    ganZhi: (_v = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI[benGuaAs]) !== null && _v !== void 0 ? _v : ['', '', '', '', '', ''],
                    wuXing: (_w = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_WU_XING[benGuaAs]) !== null && _w !== void 0 ? _w : ['', '', '', '', '', ''],
                    naYin: (_x = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_NA_YIN[benGuaAs]) !== null && _x !== void 0 ? _x : ['', '', '', '', '', ''],
                    liuShen: (_y = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN[this.dayGan]) !== null && _y !== void 0 ? _y : ['', '', '', '', '', ''],
                    yaoCi: (_z = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[benGuaAs]) !== null && _z !== void 0 ? _z : ['', '', '', '', '', ''],
                    fuShen,
                },
                bianGua: {
                    yaoMing: (_0 = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_YAO_MING[bianGuaAs]) !== null && _0 !== void 0 ? _0 : ['', '', '', '', '', ''],
                    yaoAs: [...this.bianGuaLiuYaoAs],
                    shiYing: (_1 = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_SHI_YING[bianGuaAs]) !== null && _1 !== void 0 ? _1 : ['', '', '', '', '', ''],
                    liuQin: bianGuaLiuQin,
                    ganZhi: (_2 = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_GAN_ZHI[bianGuaAs]) !== null && _2 !== void 0 ? _2 : ['', '', '', '', '', ''],
                    wuXing: (_3 = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_WU_XING[bianGuaAs]) !== null && _3 !== void 0 ? _3 : ['', '', '', '', '', ''],
                    naYin: (_4 = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_NA_YIN[bianGuaAs]) !== null && _4 !== void 0 ? _4 : ['', '', '', '', '', ''],
                    liuShen: (_5 = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_LIU_SHEN[this.dayGan]) !== null && _5 !== void 0 ? _5 : ['', '', '', '', '', ''],
                    yaoCi: (_6 = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_YAO_CI[bianGuaAs]) !== null && _6 !== void 0 ? _6 : ['', '', '', '', '', ''],
                },
            },
            liuQinQueShi,
            ganZhi: {
                year: this.yearGanZhi,
                month: this.monthGanZhi,
                day: this.dayGanZhi,
                hour: this.hourGanZhi,
            },
            jieQi: {
                prevJie: this.prevJie.toString(),
                nextJie: this.nextJie.toString(),
                prevQi: this.prevQi.toString(),
                nextQi: this.nextQi.toString(),
                prevJieDate,
                prevJieDay: diffParts(solarToDate(this.prevJie.getSolar()), this.solarDate).day,
                nextJieDate,
                nextJieDay: diffParts(this.solarDate, solarToDate(this.nextJie.getSolar())).day,
                prevQiDate,
                prevQiDay: diffParts(solarToDate(this.prevQi.getSolar()), this.solarDate).day,
                nextQiDate,
                nextQiDay: diffParts(this.solarDate, solarToDate(this.nextQi.getSolar())).day,
                chuShengJie: `${formatBirthMarker(this.prevJie.toString(), '后', solarToDate(this.prevJie.getSolar()), this.solarDate)}。${formatBirthMarker(this.nextJie.toString(), '前', this.solarDate, solarToDate(this.nextJie.getSolar()))}`,
                chuShengQi: `${formatBirthMarker(this.prevQi.toString(), '后', solarToDate(this.prevQi.getSolar()), this.solarDate)}。${formatBirthMarker(this.nextQi.toString(), '前', this.solarDate, solarToDate(this.nextQi.getSolar()))}`,
            },
            shenSha: this.calculateShenSha(),
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
    initializeLiuYaoData() {
        if (this.settings.paiPanType === 0) {
            this.initializeDateModeYaoData();
        }
        else if (this.settings.paiPanType === 2) {
            this.initializeManualModeYaoData();
        }
        else {
            this.initializeAutoModeYaoData();
        }
        this.bianGuaLiuYaoAs = this.liuYaoAs.map((yaoAs, index) => (this.liuYaoAsMark[index] ? (yaoAs === YIN_YAO ? YANG_YAO : YIN_YAO) : yaoAs));
    }
    initializeDateModeYaoData() {
        var _a, _b, _c, _d;
        const yearNumber = (_a = liuyaoMaps_1.DI_ZHI_SHU[this.yearZhi]) !== null && _a !== void 0 ? _a : 1;
        const monthNumber = this.lunar.getMonth();
        const dayNumber = this.lunar.getDay();
        const hourNumber = (_b = liuyaoMaps_1.DI_ZHI_SHU[this.hourZhi]) !== null && _b !== void 0 ? _b : 1;
        let shangGuaNumber = (yearNumber + monthNumber + dayNumber) % 8;
        let xiaGuaNumber = (yearNumber + monthNumber + dayNumber + hourNumber) % 8;
        let dongYaoNumber = (yearNumber + monthNumber + dayNumber + hourNumber) % 6;
        shangGuaNumber = shangGuaNumber === 0 ? 8 : shangGuaNumber;
        xiaGuaNumber = xiaGuaNumber === 0 ? 8 : xiaGuaNumber;
        dongYaoNumber = dongYaoNumber === 0 ? 6 : dongYaoNumber;
        const shangGuaName = liuyaoMaps_1.XIAN_TIAN_BA_GUA[shangGuaNumber];
        const xiaGuaName = liuyaoMaps_1.XIAN_TIAN_BA_GUA[xiaGuaNumber];
        const shangGuaYao = (_c = liuyaoMaps_1.XIAN_TIAN_BA_GUA_YAO[shangGuaName]) !== null && _c !== void 0 ? _c : [YANG_YAO, YANG_YAO, YANG_YAO];
        const xiaGuaYao = (_d = liuyaoMaps_1.XIAN_TIAN_BA_GUA_YAO[xiaGuaName]) !== null && _d !== void 0 ? _d : [YANG_YAO, YANG_YAO, YANG_YAO];
        const combined = [...xiaGuaYao, ...shangGuaYao];
        this.yaoShu = combined.map((yaoAs, index) => {
            const isMoving = index + 1 === dongYaoNumber;
            if (yaoAs === YIN_YAO) {
                return isMoving ? 6 : 8;
            }
            return isMoving ? 9 : 7;
        });
        this.applyYaoShu(this.yaoShu);
    }
    initializeManualModeYaoData() {
        this.yaoShu = this.settings.manualYaoShu.map((value) => {
            if (value === 1)
                return 8;
            if (value === 2)
                return 9;
            if (value === 3)
                return 6;
            return 7;
        });
        this.applyYaoShu(this.yaoShu);
    }
    initializeAutoModeYaoData() {
        const yaoShu = this.settings.yaoShu.length === 6
            ? this.settings.yaoShu.map((value) => (value >= 6 && value <= 9 ? value : 7))
            : (0, common_1.generateYaoShu)();
        this.yaoShu = yaoShu;
        this.applyYaoShu(this.yaoShu);
    }
    applyYaoShu(yaoShu) {
        this.liuYaoAs = [];
        this.liuYaoAsMark = [];
        this.liuYaoAsMarkName = [];
        yaoShu.forEach((value) => {
            const [yaoAs, mark, markName] = resolveYaoTupleByNumber(value);
            this.liuYaoAs.push(yaoAs);
            this.liuYaoAsMark.push(mark);
            this.liuYaoAsMarkName.push(markName);
        });
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
    getGuaAs(liuYaoAs) {
        const guaInfo = liuyaoMaps_1.GUA_NAME_AND_AS[liuYaoAs.join(',')];
        return guaInfo ? guaInfo[5] : '';
    }
    getYueJiangData() {
        const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
        const data = liuyaoMaps_1.YUE_JIANG[key];
        if (!data) {
            throw new Error(`月将映射缺失: ${key}`);
        }
        return data;
    }
    calculateFuShen(fuGuaAs, liuQinQueShi) {
        var _a;
        const result = ['', '', '', '', '', ''];
        if (!fuGuaAs || !(liuQinQueShi === null || liuQinQueShi === void 0 ? void 0 : liuQinQueShi.length)) {
            return result;
        }
        const fuGuaLiuQin = (_a = liuyaoMaps_1.LIU_SHI_SI_GUA_LIU_YAO_LIU_QIN[fuGuaAs]) !== null && _a !== void 0 ? _a : ['', '', '', '', '', ''];
        fuGuaLiuQin.forEach((liuQin, index) => {
            if (liuQinQueShi.includes(liuQin)) {
                result[index] = liuQin;
            }
        });
        return result;
    }
    calculateShenSha() {
        const pillars = {
            year: { gan: this.yearGan, zhi: this.yearZhi, ganZhi: this.yearGanZhi },
            month: { gan: this.monthGan, zhi: this.monthZhi, ganZhi: this.monthGanZhi },
            day: { gan: this.dayGan, zhi: this.dayZhi, ganZhi: this.dayGanZhi },
            hour: { gan: this.hourGan, zhi: this.hourZhi, ganZhi: this.hourGanZhi },
        };
        const result = {
            year: [],
            month: [],
            day: [],
            hour: [],
        };
        const applyTarget = (name, target) => {
            Object.entries(pillars).forEach(([key, pillar]) => {
                if (matchesShenShaTarget(target, pillar.gan, pillar.zhi, pillar.ganZhi)) {
                    uniquePush(result[key], name);
                }
            });
        };
        applyTarget('太极贵人', shensha_1.TAI_JI_GUI_REN[this.yearGan]);
        applyTarget('太极贵人', shensha_1.TAI_JI_GUI_REN[this.dayGan]);
        applyTarget('天乙贵人', shensha_1.TIAN_YI_GUI_REN[this.dayGan]);
        applyTarget('福星贵人', shensha_1.FU_XING_GUI_REN[this.dayGan]);
        applyTarget('文昌贵人', shensha_1.WEN_CHANG_GUI_REN[this.dayGan]);
        applyTarget('天厨贵人', shensha_1.TIAN_CHU_GUI_REN[this.dayGan]);
        applyTarget('月德贵人', shensha_1.YUE_DE_GUI_REN[this.monthZhi]);
        applyTarget('天德贵人', shensha_1.TIAN_DE_GUI_REN[this.monthZhi]);
        applyTarget('唐符国印', shensha_1.TANG_FU_GUO_YIN[this.yearZhi]);
        applyTarget('天元禄', shensha_1.LU_MA[this.dayGan]);
        applyTarget('华盖', shensha_1.HUA_GAI[this.yearZhi]);
        applyTarget('华盖', shensha_1.HUA_GAI[this.dayZhi]);
        applyTarget('驿马', shensha_1.YI_MA[this.dayZhi]);
        applyTarget('天马', shensha_1.TIAN_MA[this.dayZhi]);
        applyTarget('禄马', shensha_1.LU_MA[this.dayGan]);
        applyTarget('劫煞', shensha_1.JIE_SHA[this.dayZhi]);
        applyTarget('将星', shensha_1.JIANG_XING[this.yearZhi]);
        applyTarget('将星', shensha_1.JIANG_XING[this.dayZhi]);
        applyTarget('咸池', shensha_1.XIAN_CHI[this.dayZhi]);
        applyTarget('天喜', shensha_1.TIAN_XI[this.monthZhi]);
        applyTarget('灾煞', shensha_1.ZAI_SHA[this.dayZhi]);
        applyTarget('天医', shensha_1.TIAN_YI[this.monthZhi]);
        applyTarget('谋星', shensha_1.MOU_XING[this.dayZhi]);
        applyTarget('皇恩', shensha_1.HUANG_EN[this.monthZhi]);
        applyTarget('阳刃', shensha_1.YANG_REN[this.dayGan]);
        applyTarget('飞刃', shensha_1.FEI_REN[this.dayGan]);
        applyTarget('天人', shensha_1.TIAN_REN[this.dayGan]);
        if (this.settings.shenShaConfig) {
            result.year = (0, shenShaConfig_1.filterShenSha)(result.year, this.settings.shenShaConfig, shenShaConfig_1.LIUYAO_SHENSHA_NAME_MAP);
            result.month = (0, shenShaConfig_1.filterShenSha)(result.month, this.settings.shenShaConfig, shenShaConfig_1.LIUYAO_SHENSHA_NAME_MAP);
            result.day = (0, shenShaConfig_1.filterShenSha)(result.day, this.settings.shenShaConfig, shenShaConfig_1.LIUYAO_SHENSHA_NAME_MAP);
            result.hour = (0, shenShaConfig_1.filterShenSha)(result.hour, this.settings.shenShaConfig, shenShaConfig_1.LIUYAO_SHENSHA_NAME_MAP);
        }
        return result;
    }
}
exports.LiuYaoPaiPan = LiuYaoPaiPan;
function createLiuYaoPaiPan(settings) {
    const paiPan = new LiuYaoPaiPan(settings);
    return paiPan.getPaiPan();
}
