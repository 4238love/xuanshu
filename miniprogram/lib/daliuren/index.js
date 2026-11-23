"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaLiuRenPaiPan = void 0;
exports.createDaLiuRenPaiPan = createDaLiuRenPaiPan;
// @ts-ignore - lunar-javascript 类型定义不完整
const lunar_javascript_1 = require('../vendor/lunar');
const common_1 = require("../utils/common");
const dateTime_1 = require("../utils/dateTime");
const liuyaoMaps_1 = require("../liuyao/liuyaoMaps");
const constants_1 = require("./constants");
const tianDiPanType_1 = require("./tianDiPanType");
const generatedMaps_1 = require("./generatedMaps");
const DI_PAN = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const EMPTY_TIAN_GAN = new Array(12).fill('');
function solarToDate(solar) {
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond());
}
function formatKongWang(value) {
    return value ? value.join('、') : undefined;
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
class DaLiuRenPaiPan {
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
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
        this.diPan = [...DI_PAN];
        this.tianPan = [];
        this.tianGan = [...EMPTY_TIAN_GAN];
        this.shenPan = [];
        this.siKe = [];
        this.sanChuan = [];
        this.settings = {
            name: (_a = settings.name) !== null && _a !== void 0 ? _a : '',
            occupy: (_b = settings.occupy) !== null && _b !== void 0 ? _b : '',
            sex: (_c = settings.sex) !== null && _c !== void 0 ? _c : 1,
            date: (_d = settings.date) !== null && _d !== void 0 ? _d : '2024-01-01 00:00:00',
            dateType: (_e = settings.dateType) !== null && _e !== void 0 ? _e : 0,
            leapMonthType: (_f = settings.leapMonthType) !== null && _f !== void 0 ? _f : 0,
            xuShiSuiType: (_g = settings.xuShiSuiType) !== null && _g !== void 0 ? _g : 0,
            jieQiType: (_h = settings.jieQiType) !== null && _h !== void 0 ? _h : 1,
            guiRenType: (_j = settings.guiRenType) !== null && _j !== void 0 ? _j : 0,
            yearGanZhiType: (_k = settings.yearGanZhiType) !== null && _k !== void 0 ? _k : 2,
            monthGanZhiType: (_l = settings.monthGanZhiType) !== null && _l !== void 0 ? _l : 1,
            dayGanZhiType: (_m = settings.dayGanZhiType) !== null && _m !== void 0 ? _m : 0,
        };
        this.initializeDate();
        this.initializeGanZhi();
        this.initializeJieQi();
        this.initializeTianPan();
        this.initializeTianGan();
        this.initializeShenPan();
        this.initializeSiKe();
        this.initializeSanChuan();
    }
    getPaiPan() {
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
            shengXiao: this.getShengXiao(),
            xingZuo: `${this.solar.getXingZuo()}座`,
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
            wuXingWangShuai: generatedMaps_1.WU_XING_WANG_SHUAI[this.monthZhi],
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
            yueXiang: this.lunar.getYueXiang(),
            yueJiang: yueJiangData[0],
            yueJiangShen: yueJiangData[1],
            diPan: [...this.diPan],
            tianPan: [...this.tianPan],
            shenPan: [...this.shenPan],
            tianGan: [...this.tianGan],
            siKe: this.siKe.map((item) => [...item]),
            siKeDunGan: this.getSiKeDunGan(),
            siKeShenJiang: this.getSiKeShenJiang(),
            sanChuan: [...this.sanChuan],
            sanChuanDunGan: this.getSanChuanDunGan(),
            sanChuanShenJiang: this.getSanChuanShenJiang(),
            sanChuanLiuQin: this.getSanChuanLiuQin(),
            tianDiPanType: tianDiPanType_1.TIAN_DI_PAN_TYPE[`${yueJiangData[0]}${this.hourZhi}`] || '',
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
    initializeTianPan() {
        const yueJiang = this.getYueJiangData()[0];
        const startIndex = this.diPan.findIndex((zhi) => zhi === this.hourZhi);
        const shunPai = constants_1.DI_ZHI_SHUN_PAI[yueJiang];
        if (startIndex < 0 || !shunPai) {
            throw new Error('大六壬天盘初始化失败');
        }
        this.tianPan = new Array(12).fill('');
        let currentIndex = startIndex;
        for (let i = 0; i < 12; i += 1) {
            this.tianPan[currentIndex] = shunPai[i];
            currentIndex = (currentIndex + 1) % 12;
        }
    }
    initializeTianGan() {
        const dayKongWang = liuyaoMaps_1.KONG_WANG[this.dayGanZhi];
        if (!dayKongWang) {
            this.tianGan = [...EMPTY_TIAN_GAN];
            return;
        }
        const kongWangIndex = this.tianPan.findIndex((zhi) => zhi === dayKongWang[1]);
        this.tianGan = kongWangIndex >= 0 ? [...(constants_1.DUN_GAN_SHUN[kongWangIndex + 1] || EMPTY_TIAN_GAN)] : [...EMPTY_TIAN_GAN];
    }
    initializeShenPan() {
        const guiRen = this.getGuiRen();
        const startIndex = this.tianPan.findIndex((zhi) => zhi === guiRen);
        if (startIndex < 0) {
            throw new Error('大六壬神盘初始化失败');
        }
        const direction = constants_1.GUI_REN_FANG_XIANG[this.diPan[startIndex]];
        this.shenPan = new Array(12).fill('');
        let currentIndex = startIndex;
        for (let i = 0; i < 12; i += 1) {
            this.shenPan[currentIndex] = constants_1.GUI_REN_SHUN_XU[i];
            currentIndex = direction === 0 ? (currentIndex + 1) % 12 : (currentIndex + 11) % 12;
        }
    }
    initializeSiKe() {
        const jiGong = constants_1.SHI_GAN_JI_GONG[this.dayGan];
        const ganYang = this.lookupPanValue(this.diPan, jiGong, this.tianPan);
        const ganYin = this.lookupPanValue(this.diPan, ganYang, this.tianPan);
        const zhiYang = this.lookupPanValue(this.diPan, this.dayZhi, this.tianPan);
        const zhiYin = this.lookupPanValue(this.diPan, zhiYang, this.tianPan);
        this.siKe = [
            [ganYang, this.dayGan],
            [ganYin, ganYang],
            [zhiYang, this.dayZhi],
            [zhiYin, zhiYang],
        ];
    }
    initializeSanChuan() {
        const sanChuan = generatedMaps_1.SAN_CHUAN[`${this.dayGanZhi}${this.siKe[0][0]}`];
        if (!sanChuan) {
            throw new Error(`三传映射缺失: ${this.dayGanZhi}${this.siKe[0][0]}`);
        }
        this.sanChuan = [...sanChuan];
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
        const data = constants_1.YUE_JIANG[key];
        if (!data) {
            throw new Error(`月将映射缺失: ${key}`);
        }
        return data;
    }
    getGuiRen() {
        if (this.settings.guiRenType === 1) {
            return generatedMaps_1.ZHOU_GUI_REN[this.dayGan];
        }
        if (this.settings.guiRenType === 2) {
            return generatedMaps_1.YE_GUI_REN[this.dayGan];
        }
        return constants_1.ZHOU_YE_GUI_REN[`${this.dayGan}${this.hourZhi}`];
    }
    lookupPanValue(source, key, target) {
        const index = source.findIndex((item) => item === key);
        if (index < 0) {
            throw new Error(`盘面映射缺失: ${key}`);
        }
        return target[index];
    }
    lookupTianPanRelated(zhi, target) {
        const index = this.tianPan.findIndex((item) => item === zhi);
        if (index < 0) {
            throw new Error(`天盘定位失败: ${zhi}`);
        }
        return target[index];
    }
    getSiKeReference() {
        const firstLower = constants_1.SHI_GAN_JI_GONG[this.siKe[0][1]];
        return [
            [this.siKe[0][0], firstLower],
            [...this.siKe[1]],
            [...this.siKe[2]],
            [...this.siKe[3]],
        ];
    }
    getSiKeDunGan() {
        return this.getSiKeReference().map((ke) => ke.map((zhi) => this.lookupTianPanRelated(zhi, this.tianGan)));
    }
    getSiKeShenJiang() {
        return this.getSiKeReference().map((ke) => ke.map((zhi) => this.lookupTianPanRelated(zhi, this.shenPan)));
    }
    getSanChuanDunGan() {
        return this.sanChuan.map((zhi) => this.lookupTianPanRelated(zhi, this.tianGan));
    }
    getSanChuanShenJiang() {
        return this.sanChuan.map((zhi) => this.lookupTianPanRelated(zhi, this.shenPan));
    }
    getSanChuanLiuQin() {
        return this.sanChuan.map((zhi) => constants_1.GAN_ZHI_SHENG_KE_LIU_QIN[`${this.dayGan}${zhi}`]);
    }
}
exports.DaLiuRenPaiPan = DaLiuRenPaiPan;
function createDaLiuRenPaiPan(settings) {
    return new DaLiuRenPaiPan(settings).getPaiPan();
}
