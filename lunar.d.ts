// 扩展 lunar-javascript 的类型定义
declare module 'lunar-javascript' {
  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    static fromDate(date: Date): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getSolar(): any;
    getEightChar(): any;
    getJieQi(): any;
    getDayInChinese(): string;
    getPrevQi(forward?: boolean): any;
    getNextQi(forward?: boolean): any;
    getJieQiList(): any;
    getJieQiTable(): any;
    getLeapMonth(): number;
    getYearInGanZhiExact(): string;
    getMonthInGanZhiExact(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getYearNineStar(yearGanZhiType: number): any;
    getMonthNineStar(monthGanZhiType: number): any;
    getDayNineStar(): any;
    getTimeNineStar(): any;
    getPrevJie(): any;
    getNextJie(): any;
    getPrevJieQi(): any;
    getNextJieQi(): any;
    getWeekInChinese(): string;
    getSeason(): string;
    getYearShengXiaoExact(): string;
    getYueXiang(): string;
    next(days: number): any;
  }

  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
    getXingZuo(): string;
    toYmd(): string;
  }

  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear;
    getMonth(month: number): { getDayCount(): number } | null;
  }

  export class LunarMonth {
    getDayCount(): number;
  }
}
