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
exports.QiMenPaiPan = void 0;
exports.createQiMenPaiPan = createQiMenPaiPan;
// @ts-ignore - lunar-javascript 类型定义不完整
const lunar_javascript_1 = require('../vendor/lunar');
const common_1 = require("../utils/common");
const dateTime_1 = require("../utils/dateTime");
const liuyaoMaps_1 = require("../liuyao/liuyaoMaps");
const QiMenConstants = __importStar(require("./constants"));
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
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((current.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}
function getGateByJieQi(jieQi) {
    const gates = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
    const match = Object.entries(QiMenConstants.IS_BA_MEN).find(([, values]) => values.includes(jieQi));
    return match ? gates[Number(match[0])] : '死门';
}
class QiMenPaiPan {
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
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
        this.fuTou = '';
        this.jieQi = '';
        this.sanYuan = '';
        this.yinYangDun = '';
        this.juShu = 1;
        this.xunShou = '';
        this.xunShouYiZhang = '';
        this.xunShouGongWei = 1;
        this.diQiYi = [];
        this.diLiuJia = [];
        this.zhiFu = '';
        this.zhiShi = '';
        this.oldZhiFuGongWei = 1;
        this.newZhiFuGongWei = 1;
        this.oldZhiShiGongWei = 1;
        this.newZhiShiGongWei = 1;
        this.diPan = [];
        this.tianPan = [];
        this.renPan = [];
        this.shenPan = [];
        this.tianPanQiYiTianQinYes = new Array(9).fill('');
        this.tianPanQiYiTianQinNo = new Array(9).fill('');
        this.settings = {
            name: (_a = settings.name) !== null && _a !== void 0 ? _a : '',
            occupy: (_b = settings.occupy) !== null && _b !== void 0 ? _b : '',
            sex: (_c = settings.sex) !== null && _c !== void 0 ? _c : 1,
            panType: (_d = settings.panType) !== null && _d !== void 0 ? _d : 'zhuan',
            date: (_e = settings.date) !== null && _e !== void 0 ? _e : '2024-01-01 00:00:00',
            dateType: (_f = settings.dateType) !== null && _f !== void 0 ? _f : 0,
            leapMonthType: (_g = settings.leapMonthType) !== null && _g !== void 0 ? _g : 0,
            xuShiSuiType: (_h = settings.xuShiSuiType) !== null && _h !== void 0 ? _h : 0,
            jieQiType: (_j = settings.jieQiType) !== null && _j !== void 0 ? _j : 1,
            paiPanType: (_k = settings.paiPanType) !== null && _k !== void 0 ? _k : 3,
            zhiShiType: (_l = settings.zhiShiType) !== null && _l !== void 0 ? _l : 0,
            yueJiaQiJuType: (_m = settings.yueJiaQiJuType) !== null && _m !== void 0 ? _m : 1,
            yearGanZhiType: (_o = settings.yearGanZhiType) !== null && _o !== void 0 ? _o : 2,
            monthGanZhiType: (_p = settings.monthGanZhiType) !== null && _p !== void 0 ? _p : 1,
            dayGanZhiType: (_q = settings.dayGanZhiType) !== null && _q !== void 0 ? _q : 0,
        };
        if (this.settings.panType === 'fei') {
            throw new Error('当前仅完成转盘奇门重构，暂不支持飞盘奇门');
        }
        this.initializeDate();
        this.initializeGanZhi();
        this.initializeJieQi();
        this.initializeFuTouAndJieQi();
        this.initializeSanYuanAndJuShu();
        this.initializeYinYangDun();
        this.initializeXunShou();
        this.initializeDiQiYiLiuJiaFuShi();
        this.initializeDiPan();
        this.initializeTianPan();
        this.initializeRenPan();
        this.initializeShenPan();
    }
    getPaiPan() {
        const prevJieDate = this.prevJie.getSolar().toYmdHms();
        const nextJieDate = this.nextJie.getSolar().toYmdHms();
        const prevQiDate = this.prevQi.getSolar().toYmdHms();
        const nextQiDate = this.nextQi.getSolar().toYmdHms();
        const yueJiangData = this.getYueJiangData();
        const liuJiaXunKong = this.getLiuJiaXunKong();
        const liuJiaXunKongGongWei = this.getLiuJiaXunKongGongWei();
        const yiMa = this.getYiMa();
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
            shengXiao: this.getShengXiao(),
            xingZuo: `${this.solar.getXingZuo()}座`,
            yueXiang: this.lunar.getYueXiang(),
            yueJiang: yueJiangData[0],
            yueJiangShen: yueJiangData[1],
            wuBuYuShi: this.hourGanZhi === liuyaoMaps_1.WU_BU_YU_SHI[this.dayGan],
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
            fuTou: this.fuTou,
            jieQi: this.jieQi,
            sanYuan: this.sanYuan,
            yinYangDun: this.yinYangDun,
            juShu: `${this.yinYangDun}${this.juShu}局`,
            xunShou: this.xunShou,
            xunShouYiZhang: this.xunShouYiZhang,
            zhiFu: this.zhiFu,
            zhiShi: this.zhiShi,
            tianYi: QiMenConstants.JIU_XING_INITIAL[this.newZhiFuGongWei - 1],
            diYi: QiMenConstants.BA_MEN_INITIAL[this.newZhiShiGongWei - 1],
            taiYi: this.zhiShi,
            liuJiaXunKong,
            liuJiaXunKongGongWei,
            yiMa,
            yiMaGongWei: yiMa ? QiMenConstants.YI_MA_GONG[yiMa] : undefined,
            oldZhiFuGongWei: this.oldZhiFuGongWei,
            newZhiFuGongWei: this.newZhiFuGongWei,
            oldZhiShiGongWei: this.oldZhiShiGongWei,
            newZhiShiGongWei: this.newZhiShiGongWei,
            diPan: [...this.diPan],
            tianPan: [...this.tianPan],
            renPan: [...this.renPan],
            shenPan: [...this.shenPan],
            diLiuJia: [...this.diLiuJia],
            tianPanQiYiTianQinYes: [...this.tianPanQiYiTianQinYes],
            tianPanQiYiTianQinNo: [...this.tianPanQiYiTianQinNo],
            liuYiJiXing: this.getSpecialMarks(QiMenConstants.LIU_YI_JI_XING),
            qiYiRuMu: this.getSpecialMarks(QiMenConstants.QI_YI_RU_MU),
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
    initializeFuTouAndJieQi() {
        var _a;
        if (this.settings.paiPanType === 0 || this.settings.paiPanType === 1) {
            this.fuTou = (_a = QiMenConstants.RI_ZHU_FU_TOU[this.dayGanZhi]) !== null && _a !== void 0 ? _a : '甲子';
            this.jieQi = this.getPrevJieQiName();
            return;
        }
        const currentJieQi = this.getCurrentJieQi(this.lunar);
        if (QiMenConstants.SAN_YUAN_FU_TOU.includes(this.dayGanZhi) && currentJieQi) {
            this.fuTou = this.dayGanZhi;
            this.jieQi = currentJieQi;
            return;
        }
        const backwardResult = this.searchFuTouAndJieQi();
        this.fuTou = backwardResult.fuTou;
        this.jieQi = backwardResult.jieQi;
    }
    initializeSanYuanAndJuShu() {
        var _a, _b, _c, _d, _e, _f;
        if (this.settings.paiPanType === 0) {
            const year = this.solar.getYear();
            if (year <= 3) {
                this.sanYuan = '中元';
                this.juShu = 4;
                return;
            }
            const cycle = (year - 4) % 180;
            if (cycle < 60) {
                this.sanYuan = '下元';
                this.juShu = 7;
            }
            else if (cycle < 120) {
                this.sanYuan = '上元';
                this.juShu = 1;
            }
            else {
                this.sanYuan = '中元';
                this.juShu = 4;
            }
            return;
        }
        if (this.settings.paiPanType === 1) {
            const diZhi = this.settings.yueJiaQiJuType === 0
                ? this.yearZhi
                : (_c = (_b = (_a = QiMenConstants.SIX_JIA_ZI_XUN_SHOU_AND_YI_ZHANG[this.yearGanZhi]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.substring(1, 2)) !== null && _c !== void 0 ? _c : this.yearZhi;
            if (['寅', '申', '巳', '亥'].includes(diZhi)) {
                this.sanYuan = '上元';
                this.juShu = 1;
            }
            else if (['子', '午', '卯', '酉'].includes(diZhi)) {
                this.sanYuan = '中元';
                this.juShu = 7;
            }
            else {
                this.sanYuan = '下元';
                this.juShu = 4;
            }
            return;
        }
        if (this.settings.paiPanType === 2) {
            this.sanYuan = (_d = QiMenConstants.RI_ZHU_SAN_YUAN[this.dayGanZhi]) !== null && _d !== void 0 ? _d : '上元';
            const dayOfYear = getDayOfYear(this.solarDate);
            if (dayOfYear <= 60)
                this.juShu = 1;
            else if (dayOfYear <= 120)
                this.juShu = 7;
            else if (dayOfYear <= 180)
                this.juShu = 4;
            else if (dayOfYear <= 240)
                this.juShu = 9;
            else if (dayOfYear <= 300)
                this.juShu = 3;
            else
                this.juShu = 6;
            return;
        }
        this.sanYuan = (_e = QiMenConstants.RI_ZHU_SAN_YUAN[this.dayGanZhi]) !== null && _e !== void 0 ? _e : '上元';
        const juShu = (_f = QiMenConstants.JU_SHU[this.jieQi]) !== null && _f !== void 0 ? _f : [1, 7, 4];
        if (this.sanYuan === '上元')
            this.juShu = juShu[0];
        else if (this.sanYuan === '中元')
            this.juShu = juShu[1];
        else
            this.juShu = juShu[2];
    }
    initializeYinYangDun() {
        var _a;
        if (this.settings.paiPanType === 0 || this.settings.paiPanType === 1) {
            this.yinYangDun = '阴遁';
            return;
        }
        if (this.settings.paiPanType === 2) {
            this.yinYangDun = QiMenConstants.YIN_YANG_DUN_JIE_QI['阳遁'].includes(this.jieQi) ? '阳遁' : '阴遁';
            return;
        }
        this.yinYangDun = (_a = QiMenConstants.JIE_QI_YIN_YANG_DUN[this.jieQi]) !== null && _a !== void 0 ? _a : '阳遁';
    }
    initializeXunShou() {
        var _a, _b;
        const xunShouData = QiMenConstants.SIX_JIA_ZI_XUN_SHOU_AND_YI_ZHANG[this.hourGanZhi];
        this.xunShou = (_a = xunShouData === null || xunShouData === void 0 ? void 0 : xunShouData[0]) !== null && _a !== void 0 ? _a : '甲子';
        this.xunShouYiZhang = (_b = xunShouData === null || xunShouData === void 0 ? void 0 : xunShouData[1]) !== null && _b !== void 0 ? _b : '戊';
    }
    initializeDiQiYiLiuJiaFuShi() {
        var _a, _b, _c, _d, _e, _f;
        if (this.yinYangDun === '阳遁') {
            this.diQiYi = [...((_a = QiMenConstants.DI_YANG_QI_YI[this.juShu]) !== null && _a !== void 0 ? _a : QiMenConstants.DI_YANG_QI_YI[1])];
            this.diLiuJia = [...((_b = QiMenConstants.DI_YANG_LIU_JIA[this.juShu]) !== null && _b !== void 0 ? _b : QiMenConstants.DI_YANG_LIU_JIA[1])];
        }
        else {
            this.diQiYi = [...((_c = QiMenConstants.DI_YIN_QI_YI[this.juShu]) !== null && _c !== void 0 ? _c : QiMenConstants.DI_YIN_QI_YI[1])];
            this.diLiuJia = [...((_d = QiMenConstants.DI_YIN_LIU_JIA[this.juShu]) !== null && _d !== void 0 ? _d : QiMenConstants.DI_YIN_LIU_JIA[1])];
        }
        const xunShouIndex = this.diLiuJia.findIndex((value) => value === this.xunShou);
        if (xunShouIndex >= 0) {
            this.xunShouGongWei = xunShouIndex + 1;
            this.oldZhiFuGongWei = xunShouIndex + 1;
            this.oldZhiShiGongWei = xunShouIndex + 1;
        }
        this.zhiFu = (_e = QiMenConstants.JIU_XING_INITIAL[this.xunShouGongWei - 1]) !== null && _e !== void 0 ? _e : '天蓬';
        if (this.zhiFu === '天禽' || this.xunShouGongWei === 5) {
            if (this.settings.zhiShiType === 1) {
                this.zhiShi = this.yinYangDun === '阳遁' ? '生门' : '死门';
            }
            else if (this.settings.zhiShiType === 2) {
                this.zhiShi = getGateByJieQi(this.jieQi);
            }
            else {
                this.zhiShi = '死门';
            }
        }
        else {
            this.zhiShi = (_f = QiMenConstants.BA_MEN_INITIAL[this.xunShouGongWei - 1]) !== null && _f !== void 0 ? _f : '休门';
        }
    }
    initializeDiPan() {
        this.diPan = [...this.diQiYi];
    }
    initializeTianPan() {
        const hourGan = this.hourGan === '甲' ? this.xunShouYiZhang : this.hourGan;
        const hourGanIndex = this.diQiYi.findIndex((value) => value === hourGan);
        if (hourGanIndex >= 0) {
            this.newZhiFuGongWei = hourGanIndex + 1 === 5 ? 2 : hourGanIndex + 1;
        }
        const zhiFuRef = this.zhiFu === '天禽' ? '天芮' : this.zhiFu;
        const tianPan = Object.values(QiMenConstants.JIU_XING_SHUN).find((stars) => stars[this.newZhiFuGongWei - 1] === zhiFuRef);
        this.tianPan = [...(tianPan !== null && tianPan !== void 0 ? tianPan : QiMenConstants.JIU_XING_SHUN[0])];
        const tianRuiIndex = this.tianPan.findIndex((star) => star === '天芮');
        if (tianRuiIndex >= 0) {
            this.tianPan[tianRuiIndex] = '芮禽';
        }
        this.tianPanQiYiTianQinYes = new Array(9).fill('');
        const tianQinIndex = this.tianPan.findIndex((star) => star === '芮禽' || star === '天禽');
        if (tianQinIndex >= 0) {
            this.tianPanQiYiTianQinYes[tianQinIndex] = this.diQiYi[4];
        }
        this.tianPanQiYiTianQinNo = this.tianPan.map((star, index) => {
            if (index === 4) {
                return this.diQiYi[4];
            }
            if (star === '芮禽') {
                return this.diQiYi[1];
            }
            if (!star) {
                return '';
            }
            const originalIndex = QiMenConstants.JIU_XING_INITIAL_MAP[star];
            return originalIndex ? this.diQiYi[originalIndex - 1] : '';
        });
    }
    initializeRenPan() {
        var _a;
        const xunShouZhi = this.xunShou.substring(1, 2);
        let xunShouZhiIndex = QiMenConstants.DI_ZHI_QIMEN.indexOf(xunShouZhi);
        let hourZhiCount = 0;
        for (let i = 0; i < QiMenConstants.DI_ZHI_QIMEN.length; i += 1) {
            if (xunShouZhiIndex >= QiMenConstants.DI_ZHI_QIMEN.length) {
                xunShouZhiIndex = 0;
            }
            if (QiMenConstants.DI_ZHI_QIMEN[xunShouZhiIndex] === this.hourZhi) {
                break;
            }
            hourZhiCount += 1;
            xunShouZhiIndex += 1;
        }
        let xunShouGong = this.xunShouGongWei;
        if (xunShouZhi !== this.hourZhi) {
            for (let i = 0; i < hourZhiCount; i += 1) {
                if (this.yinYangDun === '阳遁') {
                    xunShouGong = xunShouGong >= 9 ? 1 : xunShouGong + 1;
                }
                else {
                    xunShouGong = xunShouGong <= 1 ? 9 : xunShouGong - 1;
                }
            }
        }
        this.newZhiShiGongWei = xunShouGong === 5 ? 2 : xunShouGong;
        this.renPan = [
            ...((_a = Object.values(QiMenConstants.BA_MEN_SHUN_ZHUAN).find((gates) => gates[this.newZhiShiGongWei - 1] === this.zhiShi)) !== null && _a !== void 0 ? _a : QiMenConstants.BA_MEN_SHUN_ZHUAN[0]),
        ];
    }
    initializeShenPan() {
        var _a, _b;
        const newZhiFuGong = this.newZhiFuGongWei === 5 ? 2 : this.newZhiFuGongWei;
        this.shenPan = this.yinYangDun === '阳遁'
            ? [...((_a = QiMenConstants.BA_SHEN_SHUN_ZHUAN[newZhiFuGong]) !== null && _a !== void 0 ? _a : QiMenConstants.BA_SHEN_SHUN_ZHUAN[1])]
            : [...((_b = QiMenConstants.BA_SHEN_NI_ZHUAN[newZhiFuGong]) !== null && _b !== void 0 ? _b : QiMenConstants.BA_SHEN_NI_ZHUAN[1])];
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
    getPrevJieQiName() {
        var _a, _b, _c, _d, _e;
        const lunarRef = this.lunar;
        const jieQi = (_a = lunarRef.getPrevJieQi) === null || _a === void 0 ? void 0 : _a.call(lunarRef, this.settings.jieQiType === 0);
        return (_e = (_c = (_b = jieQi === null || jieQi === void 0 ? void 0 : jieQi.getName) === null || _b === void 0 ? void 0 : _b.call(jieQi)) !== null && _c !== void 0 ? _c : (_d = jieQi === null || jieQi === void 0 ? void 0 : jieQi.toString) === null || _d === void 0 ? void 0 : _d.call(jieQi)) !== null && _e !== void 0 ? _e : '冬至';
    }
    getCurrentJieQi(lunarRef) {
        var _a, _b;
        return (_b = (_a = lunarRef.getJieQi) === null || _a === void 0 ? void 0 : _a.call(lunarRef)) !== null && _b !== void 0 ? _b : '';
    }
    searchFuTouAndJieQi() {
        var _a;
        let matchedJieQi = '';
        for (let offset = 0; offset < QiMenConstants.SAN_YUAN_FU_TOU.length; offset += 1) {
            const lunarRef = this.lunar.next(-offset);
            const dayGanZhi = this.getDayGanZhiByRef(lunarRef);
            const currentJieQi = this.getCurrentJieQi(lunarRef);
            if (!matchedJieQi && currentJieQi) {
                matchedJieQi = currentJieQi;
            }
            if (QiMenConstants.SAN_YUAN_FU_TOU.includes(dayGanZhi)) {
                return {
                    fuTou: dayGanZhi,
                    jieQi: matchedJieQi || this.getPrevJieQiName(),
                };
            }
        }
        return {
            fuTou: (_a = QiMenConstants.RI_ZHU_FU_TOU[this.dayGanZhi]) !== null && _a !== void 0 ? _a : '甲子',
            jieQi: this.getPrevJieQiName(),
        };
    }
    getYueJiangData() {
        const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
        const data = liuyaoMaps_1.YUE_JIANG[key];
        if (!data) {
            throw new Error(`月将映射缺失: ${key}`);
        }
        return data;
    }
    getLiuJiaXunKong() {
        var _a;
        return [...((_a = QiMenConstants.LIU_JIA_XUN_KONG[this.xunShou]) !== null && _a !== void 0 ? _a : [])];
    }
    getLiuJiaXunKongGongWei() {
        var _a;
        return [...((_a = QiMenConstants.LIU_JIA_XUN_KONG_GONG[this.getLiuJiaXunKong().join(',')]) !== null && _a !== void 0 ? _a : [])];
    }
    getYiMa() {
        return QiMenConstants.YI_MA[this.hourZhi];
    }
    getSpecialMarks(map) {
        const values = new Set();
        const collections = [this.tianPanQiYiTianQinYes, this.tianPanQiYiTianQinNo];
        collections.forEach((list) => {
            list.forEach((gan, index) => {
                if (!gan) {
                    return;
                }
                const mark = map[`${gan}${index + 1}`];
                if (mark) {
                    values.add(mark);
                }
            });
        });
        return [...values];
    }
}
exports.QiMenPaiPan = QiMenPaiPan;
function createQiMenPaiPan(settings) {
    return new QiMenPaiPan(settings).getPaiPan();
}
