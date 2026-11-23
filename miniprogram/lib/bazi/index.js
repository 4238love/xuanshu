"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaZiPaiPan = void 0;
exports.createBaZiPaiPan = createBaZiPaiPan;
// @ts-ignore - lunar-javascript 类型定义不完整
const lunar_javascript_1 = require('../vendor/lunar');
const constants_1 = require("../constants");
const liuyaoMaps_1 = require("../liuyao/liuyaoMaps");
const common_1 = require("../utils/common");
const baziMaps_1 = require("./baziMaps");
const trueSolarTime_1 = require("../utils/trueSolarTime");
const dateTime_1 = require("../utils/dateTime");
function solarToDate(solar) {
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond());
}
function getJieQiName(ref) {
    var _a, _b, _c, _d;
    return (_d = (_b = (_a = ref === null || ref === void 0 ? void 0 : ref.getName) === null || _a === void 0 ? void 0 : _a.call(ref)) !== null && _b !== void 0 ? _b : (_c = ref === null || ref === void 0 ? void 0 : ref.toString) === null || _c === void 0 ? void 0 : _c.call(ref)) !== null && _d !== void 0 ? _d : '';
}
function getJieQiTime(ref) {
    return ref === null || ref === void 0 ? void 0 : ref.getSolar().toYmdHms();
}
/**
 * 八字排盘类
 */
class BaZiPaiPan {
    constructor(settings) {
        var _a;
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
        this.settings = {
            leapMonthType: 0,
            xuShiSuiType: 1,
            jieQiType: 1,
            qiYunLiuPaiType: 1,
            renYuanType: 0,
            daYunLunShu: 10,
            yearGanZhiType: 2,
            monthGanZhiType: 1,
            dayGanZhiType: 0,
            useTrueSolarTime: false,
            showXiaoYun: true,
            showLiuYue: true,
            showLiuRi: true,
            showLiuShi: true,
            showJiuXing: true,
            showGanZhiLiuYi: true,
            showShenSha: true,
            showGeJu: true,
            ...settings
        };
        const dateType = (_a = this.settings.dateType) !== null && _a !== void 0 ? _a : 0;
        const rawDate = this.settings.date || '2024-01-01 00:00:00';
        const normalizedDate = (0, dateTime_1.normalizeDateValue)(rawDate, dateType);
        this.settings.date = normalizedDate;
        this.initializeDate();
        this.initializeGanZhi();
        this.initializeJieQi();
    }
    initializeDate() {
        var _a;
        if (this.settings.dateType === 1) {
            const lunarParts = (0, dateTime_1.parseLunarDateTimeString)(this.settings.date);
            if (!lunarParts) {
                throw new Error('农历日期格式无效');
            }
            const month = this.settings.leapMonthType === 1 || lunarParts.isLeap
                ? -Math.abs(lunarParts.month)
                : Math.abs(lunarParts.month);
            this.lunar = lunar_javascript_1.Lunar.fromYmdHms(lunarParts.year, month, lunarParts.day, lunarParts.hour, lunarParts.minute, lunarParts.second);
            this.solar = this.lunar.getSolar();
            this.solarDate = solarToDate(this.solar);
        }
        else {
            const solarParts = (0, dateTime_1.parseSolarDateTimeString)(this.settings.date);
            if (!solarParts) {
                throw new Error('日期格式无效，请使用 yyyy-MM-dd HH:mm:ss');
            }
            this.solarDate = (0, dateTime_1.solarPartsToDate)(solarParts);
            this.solar = lunar_javascript_1.Solar.fromDate(this.solarDate);
            this.lunar = this.solar.getLunar();
        }
        if (this.settings.useTrueSolarTime) {
            const trimmedCity = (_a = this.settings.city) === null || _a === void 0 ? void 0 : _a.trim();
            const cityLongitude = trimmedCity ? (0, trueSolarTime_1.getLongitudeByCity)(trimmedCity) : null;
            const longitude = cityLongitude !== null && cityLongitude !== void 0 ? cityLongitude : this.settings.longitude;
            if (longitude === undefined || Number.isNaN(longitude)) {
                throw new Error('启用真太阳时后，请填写受支持的城市或直接输入经度。');
            }
            this.solarDate = (0, trueSolarTime_1.calculateTrueSolarTime)(this.solarDate, longitude);
            this.solar = lunar_javascript_1.Solar.fromDate(this.solarDate);
            this.lunar = this.solar.getLunar();
        }
    }
    initializeGanZhi() {
        var _a, _b, _c, _d, _e;
        this.yearGanZhi = this.getYearGanZhi();
        this.monthGanZhi = this.getMonthGanZhi();
        this.dayGanZhi = this.getDayGanZhi();
        this.eightChar = this.lunar.getEightChar();
        (_b = (_a = this.eightChar).setSect) === null || _b === void 0 ? void 0 : _b.call(_a, ((_c = this.settings.dayGanZhiType) !== null && _c !== void 0 ? _c : 0) + 1);
        this.hourGanZhi = ((_e = (_d = this.eightChar).getTime) === null || _e === void 0 ? void 0 : _e.call(_d)) || `${this.eightChar.getTimeGan()}${this.eightChar.getTimeZhi()}`;
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
    getYueJiangData() {
        const key = `${this.prevQi.toString()}${this.nextQi.toString()}`;
        const data = liuyaoMaps_1.YUE_JIANG[key];
        if (!data) {
            throw new Error(`月将映射缺失: ${key}`);
        }
        return {
            yueJiang: data[0],
            yueJiangShen: data[1],
        };
    }
    getPrevJieDay() {
        const diff = this.solarDate.getTime() - solarToDate(this.prevJie.getSolar()).getTime();
        return Math.floor(diff / (24 * 60 * 60 * 1000));
    }
    getRenYuanSiLingFenYe() {
        var _a, _b, _c;
        const table = (_b = baziMaps_1.REN_YUAN_TABLES[(_a = this.settings.renYuanType) !== null && _a !== void 0 ? _a : 0]) !== null && _b !== void 0 ? _b : baziMaps_1.REN_YUAN_TABLES[0];
        const index = this.getPrevJieDay();
        const dayIndex = index < 0 || index > 29 ? 1 : index;
        const renYuan = ((_c = table[this.monthZhi]) === null || _c === void 0 ? void 0 : _c[dayIndex]) || '己';
        return `${renYuan}${liuyaoMaps_1.TIAN_GAN_WU_XING[renYuan] || ''}值令`;
    }
    /**
     * 获取排盘结果
     */
    getPaiPan() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const yearGanZhi = this.yearGanZhi;
        const monthGanZhi = this.monthGanZhi;
        const dayGanZhi = this.dayGanZhi;
        const hourGanZhi = this.hourGanZhi;
        const yearGan = this.yearGan;
        const yearZhi = this.yearZhi;
        const monthGan = this.monthGan;
        const monthZhi = this.monthZhi;
        const dayGan = this.dayGan;
        const dayZhi = this.dayZhi;
        const hourGan = this.hourGan;
        const hourZhi = this.hourZhi;
        // 计算五行数量
        const wuXingCount = this.calculateWuXingCount();
        // 获取生肖
        const shengXiao = constants_1.SHENG_XIAO[constants_1.DI_ZHI.indexOf(yearZhi)];
        // 将Solar对象转换为Date对象
        const solarDate = this.solarDate;
        // 获取星座
        const xingZuo = (0, common_1.getXingZuo)(this.solar.getMonth(), this.solar.getDay());
        // 获取星期
        const xingQi = (0, common_1.getWeekDay)(solarDate);
        // 获取季节
        const jiJie = this.getJiJie();
        // 获取年龄（默认使用实岁）
        const xuShiSuiType = (_a = this.settings.xuShiSuiType) !== null && _a !== void 0 ? _a : 1; // 默认实岁
        const age = xuShiSuiType === 0
            ? (0, common_1.getAge)(solarDate)
            : (0, common_1.getRealAge)(solarDate);
        // 同时计算虚岁和实岁
        const xuSui = (0, common_1.getAge)(solarDate); // 虚岁
        const shiSui = (0, common_1.getRealAge)(solarDate); // 实岁
        const shenQiangShenRuo = (0, common_1.calculateShenQiangShenRuo)(dayGan, yearGan, monthGan, hourGan, yearZhi, monthZhi, dayZhi, hourZhi);
        const geJu = this.settings.showGeJu !== false
            ? this.getGeJu(dayGan, monthZhi, [yearGan, monthGan, dayGan, hourGan], [yearZhi, monthZhi, dayZhi, hourZhi])
            : undefined;
        // 预先计算大运流年数据（用于财运和桃花运计算）
        const daYunLiuNianData = this.getDaYunLiuNian(dayGan);
        const daYunList = daYunLiuNianData.daYun || [];
        const liuNianList = daYunLiuNianData.liuNian || [];
        // 获取当前节气
        const jieQiInfo = this.getJieQiInfo();
        const yueJiang = this.getYueJiangData();
        const result = {
            // 基础信息
            solar: (0, common_1.formatDate)(solarDate),
            lunar: this.lunar.toString(),
            name: this.settings.name,
            occupy: this.settings.occupy,
            sex: this.settings.sex === 1 ? '男' : '女',
            age: age,
            ageLabel: xuShiSuiType === 0 ? '虚岁' : '实岁',
            xuSui: xuSui,
            shiSui: shiSui,
            shengXiao,
            xingZuo,
            xingQi,
            jiJie,
            // 八字
            baZi: [
                yearGanZhi,
                monthGanZhi,
                dayGanZhi,
                hourGanZhi
            ],
            baZiWuXing: [
                (0, common_1.getWuXing)(yearGan) + (0, common_1.getWuXing)(yearZhi),
                (0, common_1.getWuXing)(monthGan) + (0, common_1.getWuXing)(monthZhi),
                (0, common_1.getWuXing)(dayGan) + (0, common_1.getWuXing)(dayZhi),
                (0, common_1.getWuXing)(hourGan) + (0, common_1.getWuXing)(hourZhi)
            ],
            baZiNaYin: [
                (0, common_1.getNaYin)(yearGanZhi),
                (0, common_1.getNaYin)(monthGanZhi),
                (0, common_1.getNaYin)(dayGanZhi),
                (0, common_1.getNaYin)(hourGanZhi)
            ],
            baZiKongWang: this.getKongWang(),
            // 干支
            yearGan,
            monthGan,
            dayGan,
            hourGan,
            yearZhi,
            monthZhi,
            dayZhi,
            hourZhi,
            yearGanZhi,
            monthGanZhi,
            dayGanZhi,
            hourGanZhi,
            // 五行统计
            muCount: wuXingCount.mu,
            huoCount: wuXingCount.huo,
            tuCount: wuXingCount.tu,
            jinCount: wuXingCount.jin,
            shuiCount: wuXingCount.shui,
            // 五行分析
            wuXingWangShuai: this.getWuXingWangShuai(wuXingCount),
            wuXingQueShi: this.getWuXingQueShi(wuXingCount),
            xiYongShen: this.getXiYongShen(dayGan, shenQiangShenRuo.result, geJu),
            // 神煞
            shenSha: this.settings.showShenSha !== false ? this.getShenSha() : undefined,
            // 十神系统
            shiShen: this.getShiShen(dayGan, yearGan, monthGan, hourGan),
            shiShenZhi: this.getShiShenZhi(dayGan, yearZhi, monthZhi, dayZhi, hourZhi),
            shiShenAnalysis: this.getShiShenAnalysis(dayGan, yearGan, monthGan, hourGan, yearZhi, monthZhi, dayZhi, hourZhi),
            // 大运流年系统
            ...daYunLiuNianData,
            // 地支藏干系统
            diZhiCangGan: this.getDiZhiCangGan(dayGan, yearZhi, monthZhi, dayZhi, hourZhi),
            // 五行生克关系
            wuXingShengKe: this.getWuXingShengKe([yearGan, monthGan, dayGan, hourGan], [yearZhi, monthZhi, dayZhi, hourZhi]),
            // 格局判断系统
            geJu,
            // 胎元、胎息、命宫、身宫
            taiYuan: ((_c = (_b = this.eightChar).getTaiYuan) === null || _c === void 0 ? void 0 : _c.call(_b)) || (0, common_1.getTaiYuan)(monthGan, monthZhi),
            taiXi: ((_e = (_d = this.eightChar).getTaiXi) === null || _e === void 0 ? void 0 : _e.call(_d)) || (0, common_1.getTaiXi)(dayGan, dayZhi),
            mingGong: ((_g = (_f = this.eightChar).getMingGong) === null || _g === void 0 ? void 0 : _g.call(_f)) || (0, common_1.getMingGong)(monthZhi, hourZhi),
            shenGong: ((_j = (_h = this.eightChar).getShenGong) === null || _j === void 0 ? void 0 : _j.call(_h)) || (0, common_1.getShenGong)(monthZhi, hourZhi),
            // 小运、流月、流日、流时
            xiaoYun: daYunLiuNianData.xiaoYun,
            // 流月、流日、流时使用当前时间
            liuYue: this.settings.showLiuYue !== false ? this.getCurrentLiuYue() : undefined,
            liuRi: this.settings.showLiuRi === true ? this.getCurrentLiuRi() : undefined,
            liuShi: this.settings.showLiuShi !== false ? this.getCurrentLiuShi() : undefined,
            // 干支留意系统
            ganZhiLiuYi: this.settings.showGanZhiLiuYi !== false ?
                this.filterGanZhiLiuYi((0, common_1.analyzeGanZhiLiuYi)([yearGan, monthGan, dayGan, hourGan], [yearZhi, monthZhi, dayZhi, hourZhi])) :
                undefined,
            // 九星系统（5种体系）
            jiuXing: this.settings.showJiuXing !== false ? (0, common_1.calculateJiuXing)(this.lunar, this.settings.yearGanZhiType || 0, this.settings.monthGanZhiType || 0) : undefined,
            // 重冲生肖
            chongShengXiao: (0, common_1.getChongShengXiao)(yearZhi, monthZhi, dayZhi, hourZhi),
            // 彭祖百忌
            pengZuBaiJi: (0, common_1.getPengZuBaiJi)(dayGan, dayZhi),
            // 命卦
            mingGua: (0, common_1.getMingGua)(this.lunar.getYear(), this.settings.sex),
            // 日主论命
            riZhuLunMing: (0, common_1.getRiZhuLunMing)(dayGan + dayZhi),
            renYuanSiLingFenYe: this.getRenYuanSiLingFenYe(),
            // 月将
            yueJiang,
            // 财富运势
            caiYun: {
                zhengCai: (0, common_1.calculateZhengCai)(dayGan, daYunList, liuNianList),
                pianCai: (0, common_1.calculatePianCai)(dayGan, daYunList, liuNianList)
            },
            // 桃花运
            taoHuaYun: {
                zhengTaoHua: (0, common_1.calculateZhengTaoHua)(dayGan, this.settings.sex, daYunList, liuNianList),
                pianTaoHua: (0, common_1.calculatePianTaoHua)(dayGan, this.settings.sex, daYunList, liuNianList)
            }
        };
        // 生成详细分析（需要先计算十神数量）
        const shiShenCount = {};
        const gans = [yearGan, monthGan, hourGan];
        gans.forEach(gan => {
            const shiShen = (0, common_1.getShiShen)(dayGan, gan);
            if (shiShen) {
                shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 1;
            }
        });
        const zhis = [yearZhi, monthZhi, dayZhi, hourZhi];
        zhis.forEach(zhi => {
            const shiShens = (0, common_1.getZhiShiShen)(dayGan, zhi);
            shiShens.forEach(shiShen => {
                if (shiShen) {
                    shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 0.5;
                }
            });
        });
        const shenSha = this.settings.showShenSha !== false ? this.getShenSha() : [[], [], [], []];
        const geJuName = ((_k = result.geJu) === null || _k === void 0 ? void 0 : _k.geJuName) || '普通格局';
        result.detailedAnalysis = (0, common_1.generateDetailedAnalysis)(dayGan, dayZhi, shiShenCount, wuXingCount, geJuName, shenSha);
        // 计算骨重
        const dayInChinese = this.lunar.getDayInChinese();
        result.guZhong = (0, common_1.calculateGuZhong)(yearGan + yearZhi, monthZhi, dayInChinese, hourZhi, this.settings.sex);
        // 计算身强身弱
        result.shenQiangShenRuo = shenQiangShenRuo;
        // 判断五不遇时
        const currentHourGanZhi = hourGan + hourZhi;
        result.wuBuYuShi = constants_1.WU_BU_YU_SHI[dayGan] === currentHourGanZhi;
        // 获取节气信息
        result.jieQiInfo = jieQiInfo;
        return result;
    }
    /**
     * 计算五行数量
     */
    calculateWuXingCount() {
        const count = { mu: 0, huo: 0, tu: 0, jin: 0, shui: 0 };
        const gans = [
            this.yearGan,
            this.monthGan,
            this.dayGan,
            this.hourGan
        ];
        const zhis = [
            this.yearZhi,
            this.monthZhi,
            this.dayZhi,
            this.hourZhi
        ];
        // 统计天干五行
        gans.forEach(gan => {
            const wuXing = (0, common_1.getWuXing)(gan);
            if (wuXing === '木')
                count.mu++;
            else if (wuXing === '火')
                count.huo++;
            else if (wuXing === '土')
                count.tu++;
            else if (wuXing === '金')
                count.jin++;
            else if (wuXing === '水')
                count.shui++;
        });
        // 统计地支五行
        zhis.forEach(zhi => {
            const wuXing = (0, common_1.getWuXing)(zhi);
            if (wuXing === '木')
                count.mu++;
            else if (wuXing === '火')
                count.huo++;
            else if (wuXing === '土')
                count.tu++;
            else if (wuXing === '金')
                count.jin++;
            else if (wuXing === '水')
                count.shui++;
        });
        return count;
    }
    /**
     * 获取五行旺衰
     */
    getWuXingWangShuai(count) {
        const max = Math.max(count.mu, count.huo, count.tu, count.jin, count.shui);
        const wangList = [];
        if (count.mu === max)
            wangList.push('木');
        if (count.huo === max)
            wangList.push('火');
        if (count.tu === max)
            wangList.push('土');
        if (count.jin === max)
            wangList.push('金');
        if (count.shui === max)
            wangList.push('水');
        return wangList.join('、') + '旺';
    }
    /**
     * 获取五行缺失
     */
    getWuXingQueShi(count) {
        const que = [];
        if (count.mu === 0)
            que.push('木');
        if (count.huo === 0)
            que.push('火');
        if (count.tu === 0)
            que.push('土');
        if (count.jin === 0)
            que.push('金');
        if (count.shui === 0)
            que.push('水');
        return que;
    }
    /**
     * 获取喜用神（简化版）
     */
    getXiYongShen(dayGan, strength, geJu) {
        if (geJu) {
            return `用神 ${geJu.yongShen}；喜神 ${geJu.xiShen}`;
        }
        const element = (0, common_1.getWuXing)(dayGan);
        const cycle = {
            木: { resource: '水', output: '火', wealth: '土', official: '金' },
            火: { resource: '木', output: '土', wealth: '金', official: '水' },
            土: { resource: '火', output: '金', wealth: '水', official: '木' },
            金: { resource: '土', output: '水', wealth: '木', official: '火' },
            水: { resource: '金', output: '木', wealth: '火', official: '土' },
        };
        const relation = cycle[element];
        if (!relation) {
            return '';
        }
        if (strength === '身弱') {
            return `用神 ${relation.resource}、${element}；喜神 ${element}、${relation.official}`;
        }
        if (strength === '身强') {
            return `用神 ${relation.output}、${relation.wealth}；喜神 ${relation.official}`;
        }
        return `用神 ${relation.wealth}、${relation.official}；喜神 ${relation.output}`;
    }
    /**
     * 获取空亡
     */
    getKongWang() {
        return [
            this.yearGanZhi,
            this.monthGanZhi,
            this.dayGanZhi,
            this.hourGanZhi,
        ].map((ganZhi) => {
            const kongWang = liuyaoMaps_1.KONG_WANG[ganZhi];
            return kongWang ? kongWang.join('、') : '';
        });
    }
    /**
     * 获取季节
     */
    getJiJie() {
        const month = this.lunar.getMonth();
        const jieQi = this.lunar.getJieQi();
        if (month >= 1 && month <= 3) {
            if (month === 1)
                return '孟春';
            if (month === 2)
                return '仲春';
            return '季春';
        }
        else if (month >= 4 && month <= 6) {
            if (month === 4)
                return '孟夏';
            if (month === 5)
                return '仲夏';
            return '季夏';
        }
        else if (month >= 7 && month <= 9) {
            if (month === 7)
                return '孟秋';
            if (month === 8)
                return '仲秋';
            return '季秋';
        }
        else {
            if (month === 10)
                return '孟冬';
            if (month === 11)
                return '仲冬';
            return '季冬';
        }
    }
    /**
     * 过滤干支留意关系（根据配置）
     */
    filterGanZhiLiuYi(ganZhiLiuYi) {
        if (!this.settings.ganZhiLiuYiConfig || !ganZhiLiuYi) {
            return ganZhiLiuYi; // 如果没有配置，返回所有关系
        }
        const filtered = {};
        // 过滤天干相生
        if (this.settings.ganZhiLiuYiConfig['天干相生'] !== false && ganZhiLiuYi.tianGanSheng) {
            filtered.tianGanSheng = ganZhiLiuYi.tianGanSheng;
        }
        // 过滤天干相克
        if (this.settings.ganZhiLiuYiConfig['天干相克'] !== false && ganZhiLiuYi.tianGanKe) {
            filtered.tianGanKe = ganZhiLiuYi.tianGanKe;
        }
        // 过滤天干相冲
        if (this.settings.ganZhiLiuYiConfig['天干相冲'] !== false && ganZhiLiuYi.tianGanChong) {
            filtered.tianGanChong = ganZhiLiuYi.tianGanChong;
        }
        // 过滤地支半合
        if (this.settings.ganZhiLiuYiConfig['地支半合'] !== false && ganZhiLiuYi.diZhiBanHe) {
            filtered.diZhiBanHe = ganZhiLiuYi.diZhiBanHe;
        }
        // 过滤地支拱合
        if (this.settings.ganZhiLiuYiConfig['地支拱合'] !== false && ganZhiLiuYi.diZhiGongHe) {
            filtered.diZhiGongHe = ganZhiLiuYi.diZhiGongHe;
        }
        // 过滤地支暗合
        if (this.settings.ganZhiLiuYiConfig['地支暗合'] !== false && ganZhiLiuYi.diZhiAnHe) {
            filtered.diZhiAnHe = ganZhiLiuYi.diZhiAnHe;
        }
        return filtered;
    }
    /**
     * 过滤神煞（根据配置）
     */
    filterShenSha(shenSha) {
        if (!this.settings.shenShaConfig) {
            return shenSha; // 如果没有配置，返回所有神煞
        }
        // 导入神煞过滤函数和名称映射
        const { filterShenSha: filterFunc, BAZI_SHENSHA_NAME_MAP } = require('../config/shenShaConfig');
        return shenSha.map(pillarShenSha => filterFunc(pillarShenSha, this.settings.shenShaConfig, BAZI_SHENSHA_NAME_MAP));
    }
    /**
     * 获取神煞（完善版）
     */
    getShenSha() {
        const yearGan = this.yearGan;
        const yearZhi = this.yearZhi;
        const monthGan = this.monthGan;
        const monthZhi = this.monthZhi;
        const dayGan = this.dayGan;
        const dayZhi = this.dayZhi;
        const hourGan = this.hourGan;
        const hourZhi = this.hourZhi;
        const allZhi = [yearZhi, monthZhi, dayZhi, hourZhi];
        const allGan = [yearGan, monthGan, dayGan, hourGan];
        // 计算基础神煞
        const result = [
            this.calculateShenSha(yearGan, yearZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi),
            this.calculateShenSha(monthGan, monthZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi),
            this.calculateShenSha(dayGan, dayZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi),
            this.calculateShenSha(hourGan, hourZhi, dayGan, dayZhi, monthZhi, yearGan, allZhi)
        ];
        // 检查三奇贵人（需要在四柱天干中同时出现）
        const tianQi = constants_1.SAN_QI_GUI_REN.tian.every(g => allGan.includes(g));
        const diQi = constants_1.SAN_QI_GUI_REN.di.every(g => allGan.includes(g));
        const renQi = constants_1.SAN_QI_GUI_REN.ren.every(g => allGan.includes(g));
        if (tianQi || diQi || renQi) {
            // 将三奇贵人添加到日柱
            if (!result[2].includes('三奇贵人')) {
                result[2].push('三奇贵人');
            }
        }
        // 检查四废日（需要根据季节判断）
        const jiJie = this.getJiJie();
        let season = '';
        if (jiJie.includes('春'))
            season = '春';
        else if (jiJie.includes('夏'))
            season = '夏';
        else if (jiJie.includes('秋'))
            season = '秋';
        else if (jiJie.includes('冬'))
            season = '冬';
        if (season && constants_1.SI_FEI_RI[season]) {
            const dayGanZhi = dayGan + dayZhi;
            if (constants_1.SI_FEI_RI[season].includes(dayGanZhi)) {
                if (!result[2].includes('四废日')) {
                    result[2].push('四废日');
                }
            }
        }
        // 检查童子煞（需要根据季节和地支判断）
        const tongZiZhis = season === '春' || season === '秋' ? constants_1.TONG_ZI_SHA['春秋'] : constants_1.TONG_ZI_SHA['冬夏'];
        for (let i = 0; i < allZhi.length; i++) {
            if (tongZiZhis.includes(allZhi[i])) {
                if (!result[i].includes('童子煞')) {
                    result[i].push('童子煞');
                }
            }
        }
        // 检查冲天煞（年干支=月干支 或 日干支=时干支）
        const yearGanZhi = yearGan + yearZhi;
        const monthGanZhi = monthGan + monthZhi;
        const dayGanZhi = dayGan + dayZhi;
        const hourGanZhi = hourGan + hourZhi;
        if (yearGanZhi === monthGanZhi) {
            if (!result[0].includes('冲天煞'))
                result[0].push('冲天煞');
            if (!result[1].includes('冲天煞'))
                result[1].push('冲天煞');
        }
        if (dayGanZhi === hourGanZhi) {
            if (!result[2].includes('冲天煞'))
                result[2].push('冲天煞');
            if (!result[3].includes('冲天煞'))
                result[3].push('冲天煞');
        }
        // 检查截空（以日干查时支）
        const jieKongZhis = constants_1.JIE_KONG[dayGan];
        if (jieKongZhis && jieKongZhis.includes(hourZhi)) {
            if (!result[3].includes('截空')) {
                result[3].push('截空');
            }
        }
        // 检查天赦（以月支查日干支）
        const tianSheGanZhis = constants_1.TIAN_SHE[monthZhi];
        if (tianSheGanZhis && tianSheGanZhis.includes(dayGanZhi)) {
            if (!result[2].includes('天赦')) {
                result[2].push('天赦');
            }
        }
        // 检查天转（以月支查日干支）
        const tianZhuanGanZhis = constants_1.TIAN_ZHUAN[monthZhi];
        if (tianZhuanGanZhis && tianZhuanGanZhis.includes(dayGanZhi)) {
            if (!result[2].includes('天转')) {
                result[2].push('天转');
            }
        }
        // 检查地转（以月支查日干支）
        const diZhuanGanZhis = constants_1.DI_ZHUAN[monthZhi];
        if (diZhuanGanZhis && diZhuanGanZhis.includes(dayGanZhi)) {
            if (!result[2].includes('地转')) {
                result[2].push('地转');
            }
        }
        // 检查拱禄（特定日时干支组合）
        const gongLuKey = dayGanZhi + hourGanZhi;
        if (constants_1.GONG_LU[gongLuKey]) {
            const gongLuZhi = constants_1.GONG_LU[gongLuKey];
            // 检查年月日时支中是否有拱禄的地支
            for (let i = 0; i < allZhi.length; i++) {
                if (allZhi[i] === gongLuZhi) {
                    if (!result[i].includes('拱禄')) {
                        result[i].push('拱禄');
                    }
                }
            }
        }
        // 检查金神（固定日干支或时干支）
        if (constants_1.JIN_SHEN.includes(dayGanZhi)) {
            if (!result[2].includes('金神')) {
                result[2].push('金神');
            }
        }
        if (constants_1.JIN_SHEN.includes(hourGanZhi)) {
            if (!result[3].includes('金神')) {
                result[3].push('金神');
            }
        }
        // 应用神煞过滤配置
        return this.filterShenSha(result);
    }
    /**
     * 计算单柱神煞
     */
    calculateShenSha(gan, zhi, dayGan, dayZhi, monthZhi, yearGan, allZhi) {
        const shenSha = [];
        const yearZhi = allZhi[0];
        const ganZhi = gan + zhi;
        // 天乙贵人（以日干查四柱地支）
        const tianYi = constants_1.TIAN_YI_GUI_REN[dayGan];
        if (tianYi && tianYi.includes(zhi)) {
            shenSha.push('天乙贵人');
        }
        // 文昌贵人（以日干查地支）
        if (constants_1.WEN_CHANG_GUI_REN[dayGan] === zhi) {
            shenSha.push('文昌贵人');
        }
        // 天德贵人（以月支查地支）
        if (constants_1.TIAN_DE_GUI_REN[monthZhi] === zhi || constants_1.TIAN_DE_GUI_REN[monthZhi] === gan) {
            shenSha.push('天德贵人');
        }
        // 月德贵人（以月支查天干或地支）
        if (constants_1.YUE_DE_GUI_REN[monthZhi] === gan || constants_1.YUE_DE_GUI_REN[monthZhi] === zhi) {
            shenSha.push('月德贵人');
        }
        // 福星贵人（以日干查地支）
        if (constants_1.FU_XING_GUI_REN[dayGan] === zhi) {
            shenSha.push('福星贵人');
        }
        // 天官贵人（以日干查地支）
        if (constants_1.TIAN_GUAN_GUI_REN[dayGan] === zhi) {
            shenSha.push('天官贵人');
        }
        // 禄神（以日干查地支）
        if (constants_1.LU_SHEN[dayGan] === zhi) {
            shenSha.push('禄神');
        }
        // 羊刃（以日干查地支）
        if (constants_1.YANG_REN[dayGan] === zhi) {
            shenSha.push('羊刃');
        }
        // 驿马（以年支或日支查）
        if (constants_1.YI_MA[dayZhi] === zhi || constants_1.YI_MA[yearZhi] === zhi) {
            shenSha.push('驿马');
        }
        // 桃花（以年支或日支查）
        if (constants_1.TAO_HUA[dayZhi] === zhi || constants_1.TAO_HUA[yearZhi] === zhi) {
            shenSha.push('桃花');
        }
        // 华盖（以年支或日支查）
        if (constants_1.HUA_GAI[dayZhi] === zhi || constants_1.HUA_GAI[yearZhi] === zhi) {
            shenSha.push('华盖');
        }
        // 将星（以年支或日支查）
        if (constants_1.JIANG_XING[dayZhi] === zhi || constants_1.JIANG_XING[yearZhi] === zhi) {
            shenSha.push('将星');
        }
        // 劫煞（以年支或日支查）
        if (constants_1.JIE_SHA[dayZhi] === zhi || constants_1.JIE_SHA[yearZhi] === zhi) {
            shenSha.push('劫煞');
        }
        // 灾煞（以年支或日支查）
        if (constants_1.ZAI_SHA[dayZhi] === zhi || constants_1.ZAI_SHA[yearZhi] === zhi) {
            shenSha.push('灾煞');
        }
        // 孤辰（以年支查）
        if (constants_1.GU_CHEN[yearZhi] === zhi) {
            shenSha.push('孤辰');
        }
        // 寡宿（以年支查）
        if (constants_1.GUA_SU[yearZhi] === zhi) {
            shenSha.push('寡宿');
        }
        // 红艳（以日干查地支）
        if (constants_1.HONG_YAN[dayGan] === zhi) {
            shenSha.push('红艳');
        }
        // 金舆（以日干查地支）
        if (constants_1.JIN_YU[dayGan] === zhi) {
            shenSha.push('金舆');
        }
        // 学堂（以年支查）
        if (constants_1.XUE_TANG[yearZhi] === zhi) {
            shenSha.push('学堂');
        }
        // 词馆（以年支查）
        if (constants_1.CI_GUAN[yearZhi] === zhi) {
            shenSha.push('词馆');
        }
        // 亡神（以年支查）
        if (constants_1.WANG_SHEN[yearZhi] === zhi) {
            shenSha.push('亡神');
        }
        // 勾绞（以年支查）
        const gouJiao = constants_1.GOU_JIAO[yearZhi];
        if (gouJiao) {
            if (gouJiao.gou === zhi)
                shenSha.push('勾绞');
            if (gouJiao.jiao === zhi)
                shenSha.push('勾绞');
        }
        // 元辰（以年支查）
        if (constants_1.YUAN_CHEN[yearZhi] === zhi) {
            shenSha.push('元辰');
        }
        // 飞刃（以日干查地支）
        if (constants_1.FEI_REN[dayGan] === zhi) {
            shenSha.push('飞刃');
        }
        // 红鸾（以年支查）
        if (constants_1.HONG_LUAN[yearZhi] === zhi) {
            shenSha.push('红鸾');
        }
        // 天喜（以年支查）
        if (constants_1.TIAN_XI[yearZhi] === zhi) {
            shenSha.push('天喜');
        }
        // 天医（以年支查）
        if (constants_1.TIAN_YI_STAR[yearZhi] === zhi) {
            shenSha.push('天医');
        }
        // 天厨（以年支查）
        if (constants_1.TIAN_CHU[yearZhi] === zhi) {
            shenSha.push('天厨');
        }
        // 月空（以月支查）
        const yueKong = constants_1.YUE_KONG[monthZhi];
        if (yueKong && yueKong.includes(zhi)) {
            shenSha.push('月空');
        }
        // 截路空亡（以年支查）
        const jieLuKongWang = constants_1.JIE_LU_KONG_WANG[yearZhi];
        if (jieLuKongWang && jieLuKongWang.includes(zhi)) {
            shenSha.push('截路空亡');
        }
        // 阴阳差错（固定日柱）
        if (constants_1.YIN_YANG_CHA_CUO.includes(ganZhi)) {
            shenSha.push('阴阳差错');
        }
        // 孤鸾煞（固定日柱）
        if (constants_1.GU_LUAN_SHA.includes(ganZhi)) {
            shenSha.push('孤鸾煞');
        }
        // 铁扫帚（以年支查，需要性别信息）
        const tieSaoZhou = constants_1.TIE_SAO_ZHOU[yearZhi];
        if (tieSaoZhou) {
            const targetZhi = this.settings.sex === 1 ? tieSaoZhou.male : tieSaoZhou.female;
            if (targetZhi === zhi) {
                shenSha.push('铁扫帚');
            }
        }
        // 天罗地网
        if (constants_1.TIAN_LUO_DI_WANG.includes(zhi)) {
            if (zhi === '辰' || zhi === '戌') {
                shenSha.push('天罗');
            }
            if (zhi === '丑' || zhi === '未') {
                shenSha.push('地网');
            }
        }
        // 太极贵人（以日干查地支）
        const taiJi = constants_1.TAI_JI_GUI_REN[dayGan];
        if (taiJi && taiJi.includes(zhi)) {
            shenSha.push('太极贵人');
        }
        // 德秀贵人（以日干查月支）
        const deXiu = constants_1.DE_XIU_GUI_REN[dayGan];
        if (deXiu && deXiu.includes(monthZhi) && zhi === monthZhi) {
            shenSha.push('德秀贵人');
        }
        // 天德合（以月支查天干）
        if (constants_1.TIAN_DE_HE[monthZhi] === gan) {
            shenSha.push('天德合');
        }
        // 月德合（以月支查天干）
        if (constants_1.YUE_DE_HE[monthZhi] === gan) {
            shenSha.push('月德合');
        }
        // 十恶大败（固定日柱）
        if (constants_1.SHI_E_DA_BAI.includes(ganZhi)) {
            shenSha.push('十恶大败');
        }
        // 六秀日（固定日柱）
        if (constants_1.LIU_XIU_RI.includes(ganZhi)) {
            shenSha.push('六秀日');
        }
        // 十灵日（固定日柱）
        if (constants_1.SHI_LING_RI.includes(ganZhi)) {
            shenSha.push('十灵日');
        }
        // 阴注阳受（固定日柱）
        if (constants_1.YIN_ZHU_YANG_SHOU.includes(ganZhi)) {
            shenSha.push('阴注阳受');
        }
        // 魁罡日（固定日柱）
        if (constants_1.KUI_GANG_RI.includes(ganZhi)) {
            shenSha.push('魁罡日');
        }
        // 八专日（固定日柱）
        if (constants_1.BA_ZHUAN_RI.includes(ganZhi)) {
            shenSha.push('八专日');
        }
        // 九丑日（固定日柱）
        if (constants_1.JIU_CHOU_RI.includes(ganZhi)) {
            shenSha.push('九丑日');
        }
        // 流霞（以日干查地支）
        if (constants_1.LIU_XIA[dayGan] === zhi) {
            shenSha.push('流霞');
        }
        // 吊客（以年支查地支）
        if (constants_1.DIAO_KE[yearZhi] === zhi) {
            shenSha.push('吊客');
        }
        // 披麻（以年支查地支）
        if (constants_1.PI_MA[yearZhi] === zhi) {
            shenSha.push('披麻');
        }
        // 丧门（以年支查地支）
        if (constants_1.SANG_MEN[yearZhi] === zhi) {
            shenSha.push('丧门');
        }
        // 国印（以年干或日干查地支）
        if (constants_1.GUO_YIN[yearGan] === zhi || constants_1.GUO_YIN[dayGan] === zhi) {
            shenSha.push('国印');
        }
        // 血刃（以月支查地支）
        if (constants_1.XUE_REN[monthZhi] === zhi) {
            shenSha.push('血刃');
        }
        // 六厄（以年支查地支）
        if (constants_1.LIU_E[yearZhi] === zhi) {
            shenSha.push('六厄');
        }
        return shenSha;
    }
    /**
     * 获取地支神煞（简化版，已废弃）
     */
    getZhiShenSha(zhi) {
        const shenSha = [];
        // 桃花
        if (['子', '午', '卯', '酉'].includes(zhi)) {
            shenSha.push('桃花');
        }
        // 华盖
        if (['辰', '戌', '丑', '未'].includes(zhi)) {
            shenSha.push('华盖');
        }
        return shenSha;
    }
    /**
     * 获取天干十神
     */
    getShiShen(dayGan, yearGan, monthGan, hourGan) {
        return {
            year: (0, common_1.getShiShen)(dayGan, yearGan),
            month: (0, common_1.getShiShen)(dayGan, monthGan),
            day: '日主', // 日干是自己，标记为日主
            hour: (0, common_1.getShiShen)(dayGan, hourGan)
        };
    }
    /**
     * 获取地支藏干十神
     */
    getShiShenZhi(dayGan, yearZhi, monthZhi, dayZhi, hourZhi) {
        return {
            year: (0, common_1.getZhiShiShen)(dayGan, yearZhi),
            month: (0, common_1.getZhiShiShen)(dayGan, monthZhi),
            day: (0, common_1.getZhiShiShen)(dayGan, dayZhi),
            hour: (0, common_1.getZhiShiShen)(dayGan, hourZhi)
        };
    }
    /**
     * 获取十神格局分析
     */
    getShiShenAnalysis(dayGan, yearGan, monthGan, hourGan, yearZhi, monthZhi, dayZhi, hourZhi) {
        // 统计十神数量
        const shiShenCount = {};
        // 统计天干十神
        const gans = [yearGan, monthGan, hourGan];
        gans.forEach(gan => {
            const shiShen = (0, common_1.getShiShen)(dayGan, gan);
            if (shiShen) {
                shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 1;
            }
        });
        // 统计地支藏干十神
        const zhis = [yearZhi, monthZhi, dayZhi, hourZhi];
        zhis.forEach(zhi => {
            const shiShens = (0, common_1.getZhiShiShen)(dayGan, zhi);
            shiShens.forEach(shiShen => {
                if (shiShen) {
                    // 地支藏干权重较小，按0.5计算
                    shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 0.5;
                }
            });
        });
        return (0, common_1.analyzeShiShenPattern)(shiShenCount);
    }
    /**
     * 获取大运流年信息
     */
    /**
     * 计算单个干支的神煞（用于大运流年）
     * @param ganZhi 干支字符串（如"甲子"）
     * @param dayGan 日干
     * @param dayZhi 日支
     * @param monthZhi 月支
     * @param yearZhi 年支
     * @returns 神煞数组
     */
    calculateGanZhiShenSha(ganZhi, dayGan, dayZhi, monthZhi, yearZhi) {
        const shenSha = [];
        const gan = ganZhi[0];
        const zhi = ganZhi[1];
        // 天乙贵人（以日干查地支）
        const tianYi = constants_1.TIAN_YI_GUI_REN[dayGan];
        if (tianYi && tianYi.includes(zhi)) {
            shenSha.push('天乙贵人');
        }
        // 文昌贵人（以日干查地支）
        if (constants_1.WEN_CHANG_GUI_REN[dayGan] === zhi) {
            shenSha.push('文昌贵人');
        }
        // 禄神（以日干查地支）
        if (constants_1.LU_SHEN[dayGan] === zhi) {
            shenSha.push('禄神');
        }
        // 羊刃（以日干查地支）
        if (constants_1.YANG_REN[dayGan] === zhi) {
            shenSha.push('羊刃');
        }
        // 驿马（以日支查）
        if (constants_1.YI_MA[dayZhi] === zhi) {
            shenSha.push('驿马');
        }
        // 桃花（以日支查）
        if (constants_1.TAO_HUA[dayZhi] === zhi) {
            shenSha.push('桃花');
        }
        // 华盖（以日支查）
        if (constants_1.HUA_GAI[dayZhi] === zhi) {
            shenSha.push('华盖');
        }
        // 将星（以日支查）
        if (constants_1.JIANG_XING[dayZhi] === zhi) {
            shenSha.push('将星');
        }
        // 劫煞（以日支查）
        if (constants_1.JIE_SHA[dayZhi] === zhi) {
            shenSha.push('劫煞');
        }
        // 灾煞（以日支查）
        if (constants_1.ZAI_SHA[dayZhi] === zhi) {
            shenSha.push('灾煞');
        }
        // 红鸾（以年支查）
        if (constants_1.HONG_LUAN[yearZhi] === zhi) {
            shenSha.push('红鸾');
        }
        // 天喜（以年支查）
        if (constants_1.TIAN_XI[yearZhi] === zhi) {
            shenSha.push('天喜');
        }
        // 天医（以年支查）
        if (constants_1.TIAN_YI_STAR[yearZhi] === zhi) {
            shenSha.push('天医');
        }
        // 天罗地网
        if (constants_1.TIAN_LUO_DI_WANG.includes(zhi)) {
            shenSha.push('天罗地网');
        }
        // 应用神煞过滤配置
        return this.filterShenSha([shenSha])[0];
    }
    getDaYunLiuNian(dayGan) {
        var _a, _b;
        const sect = ((_a = this.settings.qiYunLiuPaiType) !== null && _a !== void 0 ? _a : 1) + 1;
        const yun = this.eightChar.getYun(this.settings.sex, sect);
        const daYunLunShu = this.settings.daYunLunShu || 10;
        const allDaYunRefs = yun.getDaYun(daYunLunShu + 1) || [];
        const displayDaYunRefs = allDaYunRefs.filter((item) => item.getIndex() > 0);
        const childDaYunRef = allDaYunRefs.find((item) => item.getIndex() === 0);
        const now = this.getChinaNow();
        const currentYear = now.getFullYear();
        const startSolar = yun.getStartSolar();
        const qiYunDate = (0, common_1.formatDate)(new Date(startSolar.getYear(), startSolar.getMonth() - 1, startSolar.getDay(), startSolar.getHour(), startSolar.getMinute(), startSolar.getSecond()));
        const qiYunSui = ((_b = displayDaYunRefs[0]) === null || _b === void 0 ? void 0 : _b.getStartAge()) || 0;
        const dayZhi = this.dayZhi;
        const monthZhi = this.monthZhi;
        const yearZhi = this.yearZhi;
        const decorateGanZhi = (ganZhi, includeShenSha) => {
            const result = {
                shiShen: (0, common_1.getShiShen)(dayGan, ganZhi[0])
            };
            if (includeShenSha) {
                result.shenSha = this.calculateGanZhiShenSha(ganZhi, dayGan, dayZhi, monthZhi, yearZhi);
            }
            return result;
        };
        const daYun = displayDaYunRefs.map((item) => ({
            ganZhi: item.getGanZhi(),
            startAge: item.getStartAge(),
            endAge: item.getEndAge(),
            ...decorateGanZhi(item.getGanZhi(), this.settings.showDaYunShenSha !== false)
        }));
        const activeDaYunRef = allDaYunRefs.find((item) => currentYear >= item.getStartYear() && currentYear <= item.getEndYear()) || displayDaYunRefs[0];
        const liuNianRefs = activeDaYunRef ? activeDaYunRef.getLiuNian() : [];
        const liuNian = liuNianRefs.map((item) => ({
            year: item.getYear(),
            ganZhi: item.getGanZhi(),
            age: item.getAge(),
            ...decorateGanZhi(item.getGanZhi(), this.settings.showLiuNianShenSha !== false)
        }));
        const xiaoYun = this.settings.showXiaoYun !== false && childDaYunRef && qiYunSui > 1
            ? childDaYunRef.getXiaoYun(qiYunSui - 1).map((item) => ({
                ganZhi: item.getGanZhi(),
                age: item.getAge()
            }))
            : undefined;
        const currentDaYun = activeDaYunRef && activeDaYunRef.getIndex() > 0
            ? {
                ganZhi: activeDaYunRef.getGanZhi(),
                startAge: activeDaYunRef.getStartAge(),
                endAge: activeDaYunRef.getEndAge(),
                ...decorateGanZhi(activeDaYunRef.getGanZhi(), this.settings.showDaYunShenSha !== false)
            }
            : undefined;
        const currentLiuNian = liuNian.find(item => item.year === currentYear)
            || (0, common_1.getCurrentLiuNian)(liuNian, currentYear)
            || undefined;
        return {
            qiYunSui,
            qiYunDate,
            daYun,
            liuNian,
            xiaoYun,
            currentDaYun,
            currentLiuNian
        };
    }
    /**
     * 获取地支藏干信息
     */
    getDiZhiCangGan(dayGan, yearZhi, monthZhi, dayZhi, hourZhi) {
        const getCangGanInfo = (zhi) => {
            const cangGan = constants_1.DI_ZHI_CANG_GAN[zhi] || [];
            const shiShen = cangGan.map(gan => (0, common_1.getShiShen)(dayGan, gan));
            return { gan: cangGan, shiShen };
        };
        return {
            year: getCangGanInfo(yearZhi),
            month: getCangGanInfo(monthZhi),
            day: getCangGanInfo(dayZhi),
            hour: getCangGanInfo(hourZhi)
        };
    }
    /**
     * 获取五行生克关系
     */
    getWuXingShengKe(gans, zhis) {
        return {
            tianGanWuHe: (0, common_1.analyzeTianGanWuHe)(gans),
            diZhiSanHe: (0, common_1.analyzeDiZhiSanHe)(zhis),
            diZhiSanHui: (0, common_1.analyzeDiZhiSanHui)(zhis),
            diZhiLiuHe: (0, common_1.analyzeDiZhiLiuHe)(zhis),
            diZhiXiangChong: (0, common_1.analyzeDiZhiXiangChong)(zhis),
            diZhiXiangXing: (0, common_1.analyzeDiZhiXiangXing)(zhis),
            diZhiXiangHai: (0, common_1.analyzeDiZhiXiangHai)(zhis),
            diZhiXiangPo: (0, common_1.analyzeDiZhiXiangPo)(zhis)
        };
    }
    /**
     * 获取格局判断
     */
    getGeJu(dayGan, monthZhi, gans, zhis) {
        // 统计十神数量
        const shiShenCount = {};
        // 统计天干十神
        gans.forEach(gan => {
            const shiShen = (0, common_1.getShiShen)(dayGan, gan);
            if (shiShen && shiShen !== '日主') {
                shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 1;
            }
        });
        // 统计地支藏干十神
        zhis.forEach(zhi => {
            const shiShens = (0, common_1.getZhiShiShen)(dayGan, zhi);
            shiShens.forEach(shiShen => {
                if (shiShen) {
                    // 地支藏干权重较小，按0.5计算
                    shiShenCount[shiShen] = (shiShenCount[shiShen] || 0) + 0.5;
                }
            });
        });
        return (0, common_1.analyzeGeJu)(dayGan, monthZhi, gans, zhis, shiShenCount);
    }
    /**
     * 获取节气信息
     */
    getJieQiInfo() {
        var _a, _b;
        try {
            const byDay = this.settings.jieQiType === 0;
            const lunarRef = this.lunar;
            const currentRef = (_a = lunarRef.getPrevJieQi) === null || _a === void 0 ? void 0 : _a.call(lunarRef, byDay);
            const nextRef = (_b = lunarRef.getNextJieQi) === null || _b === void 0 ? void 0 : _b.call(lunarRef, byDay);
            const nextDate = nextRef ? solarToDate(nextRef.getSolar()) : undefined;
            return {
                current: getJieQiName(currentRef) || getJieQiName(this.prevJie) || '未知',
                prev: getJieQiName(this.prevJie) || '未知',
                next: getJieQiName(nextRef) || getJieQiName(this.nextJie) || '未知',
                currentTime: getJieQiTime(currentRef) || getJieQiTime(this.prevJie),
                nextTime: getJieQiTime(nextRef) || getJieQiTime(this.nextJie),
                daysToNext: nextDate
                    ? Math.floor((nextDate.getTime() - this.solarDate.getTime()) / (24 * 60 * 60 * 1000))
                    : undefined,
            };
            const jieQiTable = this.lunar.getJieQiTable();
            // 获取所有节气名称（按时间顺序）
            const jieQiNames = [
                '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
                '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
                '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
                '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
            ];
            if (!jieQiTable) {
                return {
                    current: '未知',
                    prev: '未知',
                    next: '未知'
                };
            }
            // 获取出生日期的时间戳
            const birthDate = new Date(this.solar.getYear(), this.solar.getMonth() - 1, this.solar.getDay());
            const birthTime = birthDate.getTime();
            // 找到最接近且不晚于出生日期的节气
            let currentJieQi = '';
            let currentJieQiTime = 0;
            let currentIndex = -1;
            for (let i = 0; i < jieQiNames.length; i++) {
                const jieQiName = jieQiNames[i];
                if (jieQiTable[jieQiName]) {
                    const jieQiSolar = jieQiTable[jieQiName];
                    const jieQiDate = new Date(jieQiSolar.getYear(), jieQiSolar.getMonth() - 1, jieQiSolar.getDay());
                    const jieQiTime = jieQiDate.getTime();
                    // 找到最接近且不晚于出生日期的节气
                    if (jieQiTime <= birthTime && jieQiTime > currentJieQiTime) {
                        currentJieQi = jieQiName;
                        currentJieQiTime = jieQiTime;
                        currentIndex = i;
                    }
                }
            }
            // 如果没有找到当前节气，使用第一个节气
            if (currentIndex === -1) {
                currentIndex = 0;
                currentJieQi = jieQiNames[0];
            }
            const prevIndex = (currentIndex - 1 + 24) % 24;
            const nextIndex = (currentIndex + 1) % 24;
            const prev = jieQiNames[prevIndex];
            const next = jieQiNames[nextIndex];
            // 获取当前节气的时间
            let currentTime;
            if (jieQiTable[currentJieQi]) {
                const currentJieQiSolar = jieQiTable[currentJieQi];
                const year = currentJieQiSolar.getYear();
                const month = String(currentJieQiSolar.getMonth()).padStart(2, '0');
                const day = String(currentJieQiSolar.getDay()).padStart(2, '0');
                const hour = String(currentJieQiSolar.getHour()).padStart(2, '0');
                const minute = String(currentJieQiSolar.getMinute()).padStart(2, '0');
                currentTime = `${year}-${month}-${day} ${hour}:${minute}`;
            }
            // 获取下一个节气的时间
            let nextTime;
            let daysToNext;
            if (jieQiTable[next]) {
                const nextJieQiSolar = jieQiTable[next];
                const year = nextJieQiSolar.getYear();
                const month = String(nextJieQiSolar.getMonth()).padStart(2, '0');
                const day = String(nextJieQiSolar.getDay()).padStart(2, '0');
                const hour = String(nextJieQiSolar.getHour()).padStart(2, '0');
                const minute = String(nextJieQiSolar.getMinute()).padStart(2, '0');
                nextTime = `${year}-${month}-${day} ${hour}:${minute}`;
                // 计算距离下一个节气的天数
                const currentDate = new Date(this.solar.getYear(), this.solar.getMonth() - 1, this.solar.getDay());
                const nextDate = new Date(nextJieQiSolar.getYear(), nextJieQiSolar.getMonth() - 1, nextJieQiSolar.getDay());
                daysToNext = Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            }
            return {
                current: currentJieQi,
                prev,
                next,
                currentTime,
                nextTime,
                daysToNext
            };
        }
        catch (error) {
            console.error('获取节气信息失败:', error);
            return {
                current: '未知',
                prev: '未知',
                next: '未知'
            };
        }
    }
    /**
     * 获取中国时区的当前日期
     */
    getChinaNow() {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23'
        });
        const parts = formatter.formatToParts(new Date()).reduce((result, part) => {
            if (part.type !== 'literal') {
                result[part.type] = part.value;
            }
            return result;
        }, {});
        return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    }
    /**
     * 获取当前时间的流月
     */
    getCurrentLiuYue() {
        const now = this.getChinaNow();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JavaScript月份从0开始
        const liuYueList = (0, common_1.calculateLiuYue)(currentYear);
        // 标记当前月份
        return liuYueList.map(ly => ({
            ...ly,
            isCurrent: ly.month === currentMonth
        }));
    }
    /**
     * 获取当前时间的流日
     */
    getCurrentLiuRi() {
        const now = this.getChinaNow();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JavaScript月份从0开始
        const currentDay = now.getDate();
        // 使用 lunar-javascript 库获取准确的干支
        const liuRiList = [];
        // 获取该月的天数
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth - 1, day);
            const solar = lunar_javascript_1.Solar.fromDate(date);
            const lunar = solar.getLunar();
            const eightChar = lunar.getEightChar();
            const dayGan = eightChar.getDayGan();
            const dayZhi = eightChar.getDayZhi();
            const ganZhi = dayGan + dayZhi;
            liuRiList.push({
                day,
                ganZhi,
                isCurrent: day === currentDay
            });
        }
        return liuRiList;
    }
    /**
     * 获取当前时间的流时
     */
    getCurrentLiuShi() {
        // 获取中国时区的当前时间
        const now = this.getChinaNow();
        const currentSolar = lunar_javascript_1.Solar.fromDate(now);
        const currentLunar = currentSolar.getLunar();
        const currentEightChar = currentLunar.getEightChar();
        const currentDayGan = currentEightChar.getDayGan();
        const currentTimeZhi = currentEightChar.getTimeZhi(); // 获取当前时辰的地支
        const liuShiList = (0, common_1.calculateLiuShi)(currentDayGan);
        // 标记当前时辰（通过地支匹配）
        return liuShiList.map(ls => {
            // 从干支中提取地支（第二个字符）
            const zhi = ls.ganZhi[1];
            return {
                ...ls,
                isCurrent: zhi === currentTimeZhi
            };
        });
    }
    /**
     * 判断是否为当前时辰（已废弃，使用库的方法）
     */
    isCurrentHour(shiHour, currentHour) {
        // 时辰对应关系：
        // 0=子时(23-1), 1=丑时(1-3), 2=寅时(3-5), 3=卯时(5-7)
        // 4=辰时(7-9), 5=巳时(9-11), 6=午时(11-13), 7=未时(13-15)
        // 8=申时(15-17), 9=酉时(17-19), 10=戌时(19-21), 11=亥时(21-23)
        if (shiHour === 0) {
            // 子时：23-1点
            return currentHour === 23 || currentHour === 0;
        }
        else {
            // 其他时辰：每2小时一个时辰
            const startHour = shiHour * 2 - 1;
            const endHour = shiHour * 2 + 1;
            return currentHour >= startHour && currentHour < endHour;
        }
    }
}
exports.BaZiPaiPan = BaZiPaiPan;
/**
 * 创建八字排盘
 */
function createBaZiPaiPan(settings) {
    const paiPan = new BaZiPaiPan(settings);
    return paiPan.getPaiPan();
}
