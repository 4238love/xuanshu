import { createBaZiPaiPan } from '../../lib/bazi';
import {
  calculateTrueSolarTime,
  calculateTrueSolarTimeAccurate,
  getLongitudeByCity,
} from '../../lib/utils/trueSolarTime';
import { BaZiSettings } from '../../types';

describe('真太阳时测试', () => {
  test('calculateTrueSolarTime 统一走更精确的修正结果', () => {
    const date = new Date(2024, 5, 1, 12, 0, 0);
    const longitude = 113.2644;

    expect(calculateTrueSolarTime(date, longitude).getTime()).toBe(
      calculateTrueSolarTimeAccurate(date, longitude).getTime()
    );
  });

  test('城市名支持常见后缀容错', () => {
    expect(getLongitudeByCity('广州')).toBe(113.3);
    expect(getLongitudeByCity('广州市')).toBe(113.3);
    expect(getLongitudeByCity('  广州  ')).toBe(113.3);
  });

  test('未知城市且未提供经度时，八字排盘直接抛错', () => {
    const settings: BaZiSettings = {
      name: '真太阳时测试',
      sex: 1,
      date: '1990-05-15 10:30:00',
      dateType: 0,
      useTrueSolarTime: true,
      city: '不存在的城市',
    };

    expect(() => createBaZiPaiPan(settings)).toThrow();
  });

  test('未知城市但提供经度时，会回退到经度修正', () => {
    const withUnknownCity: BaZiSettings = {
      name: '真太阳时测试',
      sex: 1,
      date: '1990-05-15 10:30:00',
      dateType: 0,
      useTrueSolarTime: true,
      city: '不存在的城市',
      longitude: 113.3,
    };

    const withLongitudeOnly: BaZiSettings = {
      ...withUnknownCity,
      city: '',
    };

    const unknownCityResult = createBaZiPaiPan(withUnknownCity);
    const longitudeResult = createBaZiPaiPan(withLongitudeOnly);

    expect(unknownCityResult.solar).toBe(longitudeResult.solar);
    expect(unknownCityResult.baZi.join('')).toBe(longitudeResult.baZi.join(''));
  });
});
