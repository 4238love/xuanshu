/**
 * 测试运行脚本
 * 用于快速运行测试并生成报告
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  results: TestResult[];
}

/**
 * 运行所有测试
 */
export async function runAllTests(): Promise<TestReport> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  console.log('🚀 开始运行测试套件...\n');

  // 运行单元测试
  console.log('📝 运行单元测试...');
  try {
    execSync('npm run test:unit', { stdio: 'inherit' });
    results.push({
      name: '单元测试',
      passed: true,
      duration: 0
    });
  } catch (error) {
    results.push({
      name: '单元测试',
      passed: false,
      duration: 0,
      error: String(error)
    });
  }

  // 运行集成测试
  console.log('\n🔗 运行集成测试...');
  try {
    execSync('npm run test:integration', { stdio: 'inherit' });
    results.push({
      name: '集成测试',
      passed: true,
      duration: 0
    });
  } catch (error) {
    results.push({
      name: '集成测试',
      passed: false,
      duration: 0,
      error: String(error)
    });
  }

  // 运行对比测试
  console.log('\n⚖️ 运行对比测试...');
  try {
    execSync('npm run test:comparison', { stdio: 'inherit' });
    results.push({
      name: '对比测试',
      passed: true,
      duration: 0
    });
  } catch (error) {
    results.push({
      name: '对比测试',
      passed: false,
      duration: 0,
      error: String(error)
    });
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  const report: TestReport = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests: results.filter(r => !r.passed).length,
    duration,
    results
  };

  // 生成报告
  generateReport(report);

  return report;
}

/**
 * 生成测试报告
 */
function generateReport(report: TestReport) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  console.log(`时间: ${report.timestamp}`);
  console.log(`总测试数: ${report.totalTests}`);
  console.log(`通过: ${report.passedTests} ✅`);
  console.log(`失败: ${report.failedTests} ❌`);
  console.log(`耗时: ${(report.duration / 1000).toFixed(2)}秒`);
  console.log('='.repeat(60));

  report.results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
  });

  console.log('='.repeat(60));

  // 保存报告到文件
  const reportPath = path.join(__dirname, '../test-reports', `report-${Date.now()}.json`);
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 报告已保存到: ${reportPath}`);
}

// 如果直接运行此脚本
if (require.main === module) {
  runAllTests().catch(console.error);
}
