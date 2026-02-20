declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
    getXingZuo(): string;
    toDate(): Date;
    toString(): string;
    toYmd(): string;
  }

  export class Lunar {
    static fromDate(date: Date): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getJieQi(): string;
    getPrevJie(): JieQi;
    getNextJie(): JieQi;
    getPrevJieQi(): JieQi;
    getPrevQi(wholeDay?: boolean): JieQi;
    getNextQi(wholeDay?: boolean): JieQi;
    getYearInGanZhi(): string;
    getYearInGanZhiExact(): string;
    getMonthInGanZhi(): string;
    getMonthInGanZhiExact(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearNineStar(yearGanZhiType: number): string;
    getMonthNineStar(monthGanZhiType: number): string;
    getDayNineStar(): string;
    getTimeNineStar(): string;
    getWeekInChinese(): string;
    getSeason(): string;
    getYearShengXiaoExact(): string;
    getYueXiang(): string;
    next(days: number): Lunar;
    toString(): string;
    getJieQiList(): string[];
    getJieQiTable(): { [key: string]: Solar };
  }

  export class JieQi {
    getName(): string;
    getSolar(): Solar;
    toString(): string;
  }

  export class EightChar {
    getYear(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonth(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDay(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTime(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getKongWang(): string;
    getYun(sex: number): Yun;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getStartYear(): number;
    getStartAge(): number;
    getGanZhi(): string;
    getLiuNian(): LiuNian[];
  }

  export class LiuNian {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
  }
}
