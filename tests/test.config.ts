/**
 * 测试套件配置文件
 * 用于配置测试环境和测试参数
 */

export const TEST_CONFIG = {
  // 测试数据
  testCases: {
    bazi: [
      {
        name: '标准测试用例1',
        settings: {
          name: '张三',
          sex: 1,
          date: '1990-01-01 08:30:00',
          dateType: 0
        }
      },
      {
        name: '标准测试用例2',
        settings: {
          name: '李四',
          sex: 0,
          date: '1985-06-15 14:20:00',
          dateType: 0
        }
      },
      {
        name: '农历测试用例',
        settings: {
          name: '王五',
          sex: 1,
          date: '1992-12-08 10:00:00',
          dateType: 1
        }
      }
    ],
    liuyao: [
      {
        name: '自动起卦测试',
        settings: {
          name: '测试者',
          occupy: '测试占事',
          sex: 1,
          date: '2024-01-01 08:00:00',
          dateType: 0,
          paiPanType: 1
        }
      },
      {
        name: '日期起卦测试',
        settings: {
          name: '测试者',
          occupy: '测试占事',
          sex: 1,
          date: '2024-01-01 08:00:00',
          dateType: 0,
          paiPanType: 0
        }
      },
      {
        name: '手动起卦测试',
        settings: {
          name: '测试者',
          occupy: '测试占事',
          sex: 1,
          date: '2024-01-01 08:00:00',
          dateType: 0,
          paiPanType: 2,
          manualYaoShu: [0, 1, 2, 3, 0, 1]
        }
      }
    ]
  },

  // 测试超时时间
  timeout: 10000,

  // 是否输出详细日志
  verbose: true,

  // 对比测试配置
  comparison: {
    // 原项目API地址(如果有)
    originalApiUrl: '',
    // 是否启用对比测试
    enabled: false
  }
};

export default TEST_CONFIG;
