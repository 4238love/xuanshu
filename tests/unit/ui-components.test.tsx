import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, InfoCard } from '../../components/ui/Card';
import { DateTimePicker, Select } from '../../components/ui/FormControls';
import { Input, RadioGroup } from '../../components/ui/Input';

function extract(markup: string, pattern: RegExp): string {
  const match = markup.match(pattern);
  expect(match).not.toBeNull();
  return match![1];
}

describe('UI 组件测试', () => {
  describe('Button', () => {
    test('渲染加载态和宽度类名', () => {
      const markup = renderToStaticMarkup(
        <Button loading fullWidth>
          提交
        </Button>
      );

      expect(markup).toContain('w-full');
      expect(markup).toContain('disabled=""');
      expect(markup).toContain('animate-spin');
      expect(markup).toContain('提交');
    });
  });

  describe('Card / Badge / InfoCard', () => {
    test('渲染标题、图标和渐变样式', () => {
      const cardMarkup = renderToStaticMarkup(
        <Card title="结果摘要" icon="命" gradient="from-stone-900 to-amber-700">
          内容
        </Card>
      );

      expect(cardMarkup).toContain('结果摘要');
      expect(cardMarkup).toContain('命');
      expect(cardMarkup).toContain('from-stone-900 to-amber-700');

      const badgeMarkup = renderToStaticMarkup(<Badge variant="warning">偏弱</Badge>);
      expect(badgeMarkup).toContain('bg-amber-50');
      expect(badgeMarkup).toContain('border-amber-200');
      expect(badgeMarkup).toContain('偏弱');

      const infoCardMarkup = renderToStaticMarkup(
        <InfoCard label="起运岁数" value={6} icon="运" color="from-amber-50 to-orange-50" />
      );
      expect(infoCardMarkup).toContain('起运岁数');
      expect(infoCardMarkup).toContain('6');
      expect(infoCardMarkup).toContain('from-amber-50 to-orange-50');
    });
  });

  describe('Input', () => {
    test('label、input、error 能正确关联', () => {
      const markup = renderToStaticMarkup(
        <Input label="姓名" error="必填" fullWidth />
      );

      const inputId = extract(markup, /<input[^>]*\sid="([^"]+)"/);
      expect(markup).toContain(`<label for="${inputId}"`);
      expect(markup).toContain('aria-invalid="true"');
      expect(markup).toContain(`aria-describedby="${inputId}-error"`);
      expect(markup).toContain(`id="${inputId}-error"`);
      expect(markup).toContain('role="alert"');
    });

    test('helperText 走 aria-describedby', () => {
      const markup = renderToStaticMarkup(
        <Input label="城市" helperText="用于真太阳时修正" />
      );

      const inputId = extract(markup, /<input[^>]*\sid="([^"]+)"/);
      expect(markup).toContain(`<label for="${inputId}"`);
      expect(markup).toContain(`aria-describedby="${inputId}-helper"`);
      expect(markup).toContain(`id="${inputId}-helper"`);
    });
  });

  describe('RadioGroup', () => {
    test('使用 fieldset/legend 并暴露 radiogroup 语义', () => {
      const markup = renderToStaticMarkup(
        <RadioGroup
          label="性别"
          name="sex"
          value={1}
          onChange={() => {}}
          helperText="用于起运顺逆"
          options={[
            { label: '男命', value: 1 },
            { label: '女命', value: 0 },
          ]}
        />
      );

      const legendId = extract(markup, /<legend id="([^"]+)"/);
      expect(markup).toContain('<fieldset');
      expect(markup).toContain('性别');
      expect(markup).toContain(`role="radiogroup" aria-labelledby="${legendId}"`);
      expect(markup).toContain('name="sex"');
      expect(markup).toContain('type="radio"');
      expect(markup).toContain('女命');
    });

    test('error 信息会绑定到 fieldset', () => {
      const markup = renderToStaticMarkup(
        <RadioGroup
          label="日期类型"
          name="dateType"
          value={0}
          onChange={() => {}}
          error="请选择有效日期类型"
          options={[
            { label: '公历', value: 0 },
            { label: '农历', value: 1 },
          ]}
        />
      );

      const errorId = extract(markup, /<p id="([^"]+-error)"[^>]*role="alert"/);
      expect(markup).toContain('aria-invalid="true"');
      expect(markup).toContain(`aria-describedby="${errorId}"`);
    });
  });

  describe('Select / DateTimePicker', () => {
    test('Select 具备 label 与错误描述关联', () => {
      const markup = renderToStaticMarkup(
        <Select
          label="排盘类型"
          value={3}
          onChange={() => {}}
          error="请选择排盘类型"
          options={[
            { label: '时家奇门', value: 3 },
            { label: '日家奇门', value: 2 },
          ]}
        />
      );

      const selectId = extract(markup, /<select id="([^"]+)"/);
      expect(markup).toContain(`<label for="${selectId}"`);
      expect(markup).toContain('aria-invalid="true"');
      expect(markup).toContain(`aria-describedby="${selectId}-error"`);
    });

    test('DateTimePicker 暴露输入框、label 和状态按钮语义', () => {
      const markup = renderToStaticMarkup(
        <DateTimePicker
          label="出生时间"
          value="2024-01-01 08:30:00"
          onChange={() => {}}
          dateType={0}
          error="日期格式错误"
        />
      );

      const inputId = extract(markup, /<input id="([^"]+)" type="text"/);
      expect(markup).toContain(`<label for="${inputId}"`);
      expect(markup).toContain('aria-invalid="true"');
      expect(markup).toContain(`aria-describedby="${inputId}-error"`);
      expect(markup).toContain(`aria-controls="${inputId}-picker"`);
      expect(markup).toContain('aria-expanded="false"');
    });
  });

  describe('Alert', () => {
    test('error / warning 使用 alert 语义，带关闭按钮 aria-label', () => {
      const errorMarkup = renderToStaticMarkup(
        <Alert type="error" title="校验失败" onClose={() => {}}>
          日期格式无效
        </Alert>
      );

      expect(errorMarkup).toContain('role="alert"');
      expect(errorMarkup).toContain('aria-label="关闭提示"');
      expect(errorMarkup).toContain('校验失败');

      const infoMarkup = renderToStaticMarkup(<Alert type="info">已保存</Alert>);
      expect(infoMarkup).toContain('role="status"');
    });
  });
});
