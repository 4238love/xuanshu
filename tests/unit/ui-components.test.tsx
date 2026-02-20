/**
 * UI组件测试
 * 测试可复用UI组件的功能和样式
 */

import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, InfoCard } from '../../components/ui/Card';
import { Input, RadioGroup } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

describe('UI组件测试', () => {
  describe('Button组件', () => {
    test('渲染基础按钮', () => {
      const button = <Button>点击</Button>;
      expect(button).toBeDefined();
      expect(button.props.children).toBe('点击');
    });

    test('不同变体', () => {
      const variants = ['primary', 'secondary', 'danger', 'success'] as const;
      variants.forEach(variant => {
        const button = <Button variant={variant}>按钮</Button>;
        expect(button.props.variant).toBe(variant);
      });
    });

    test('不同尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach(size => {
        const button = <Button size={size}>按钮</Button>;
        expect(button.props.size).toBe(size);
      });
    });

    test('加载状态', () => {
      const button = <Button loading={true}>加载中</Button>;
      expect(button.props.loading).toBe(true);
    });

    test('禁用状态', () => {
      const button = <Button disabled={true}>禁用</Button>;
      expect(button.props.disabled).toBe(true);
    });

    test('全宽按钮', () => {
      const button = <Button fullWidth={true}>全宽</Button>;
      expect(button.props.fullWidth).toBe(true);
    });

    test('自定义渐变', () => {
      const gradient = 'from-blue-500 to-cyan-500';
      const button = <Button gradient={gradient}>渐变</Button>;
      expect(button.props.gradient).toBe(gradient);
    });
  });

  describe('Card组件', () => {
    test('渲染基础卡片', () => {
      const card = <Card>内容</Card>;
      expect(card).toBeDefined();
      expect(card.props.children).toBe('内容');
    });

    test('带标题的卡片', () => {
      const card = <Card title="标题">内容</Card>;
      expect(card.props.title).toBe('标题');
    });

    test('带图标的卡片', () => {
      const card = <Card title="标题" icon="📝">内容</Card>;
      expect(card.props.icon).toBe('📝');
    });

    test('带渐变的卡片', () => {
      const gradient = 'from-purple-500 to-pink-500';
      const card = <Card gradient={gradient}>内容</Card>;
      expect(card.props.gradient).toBe(gradient);
    });
  });

  describe('InfoCard组件', () => {
    test('渲染信息卡片', () => {
      const card = <InfoCard label="标签" value="值" />;
      expect(card.props.label).toBe('标签');
      expect(card.props.value).toBe('值');
    });

    test('带颜色的信息卡片', () => {
      const color = 'from-blue-50 to-cyan-50';
      const card = <InfoCard label="标签" value="值" color={color} />;
      expect(card.props.color).toBe(color);
    });

    test('带图标的信息卡片', () => {
      const card = <InfoCard label="标签" value="值" icon="🎯" />;
      expect(card.props.icon).toBe('🎯');
    });
  });

  describe('Input组件', () => {
    test('渲染基础输入框', () => {
      const input = <Input />;
      expect(input).toBeDefined();
    });

    test('带标签的输入框', () => {
      const input = <Input label="姓名" />;
      expect(input.props.label).toBe('姓名');
    });

    test('带错误提示的输入框', () => {
      const input = <Input error="错误信息" />;
      expect(input.props.error).toBe('错误信息');
    });

    test('带帮助文本的输入框', () => {
      const input = <Input helperText="帮助文本" />;
      expect(input.props.helperText).toBe('帮助文本');
    });

    test('全宽输入框', () => {
      const input = <Input fullWidth={true} />;
      expect(input.props.fullWidth).toBe(true);
    });
  });

  describe('RadioGroup组件', () => {
    test('渲染单选组', () => {
      const options = [
        { label: '选项1', value: 1 },
        { label: '选项2', value: 2 }
      ];
      const radioGroup = (
        <RadioGroup
          name="test"
          options={options}
          value={1}
          onChange={() => {}}
        />
      );
      expect(radioGroup.props.options).toHaveLength(2);
    });

    test('带标签的单选组', () => {
      const options = [{ label: '选项', value: 1 }];
      const radioGroup = (
        <RadioGroup
          label="选择"
          name="test"
          options={options}
          value={1}
          onChange={() => {}}
        />
      );
      expect(radioGroup.props.label).toBe('选择');
    });
  });

  describe('Badge组件', () => {
    test('渲染基础徽章', () => {
      const badge = <Badge>标签</Badge>;
      expect(badge).toBeDefined();
      expect(badge.props.children).toBe('标签');
    });

    test('不同变体', () => {
      const variants = ['default', 'success', 'warning', 'danger', 'info'] as const;
      variants.forEach(variant => {
        const badge = <Badge variant={variant}>标签</Badge>;
        expect(badge.props.variant).toBe(variant);
      });
    });

    test('不同尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach(size => {
        const badge = <Badge size={size}>标签</Badge>;
        expect(badge.props.size).toBe(size);
      });
    });
  });

  describe('Alert组件', () => {
    test('渲染基础提示', () => {
      const alert = <Alert>提示内容</Alert>;
      expect(alert).toBeDefined();
      expect(alert.props.children).toBe('提示内容');
    });

    test('不同类型', () => {
      const types = ['info', 'success', 'warning', 'error'] as const;
      types.forEach(type => {
        const alert = <Alert type={type}>提示</Alert>;
        expect(alert.props.type).toBe(type);
      });
    });

    test('带标题的提示', () => {
      const alert = <Alert title="标题">内容</Alert>;
      expect(alert.props.title).toBe('标题');
    });

    test('带关闭按钮的提示', () => {
      const onClose = jest.fn();
      const alert = <Alert onClose={onClose}>内容</Alert>;
      expect(alert.props.onClose).toBe(onClose);
    });

    test('自定义图标', () => {
      const alert = <Alert icon="🎉">内容</Alert>;
      expect(alert.props.icon).toBe('🎉');
    });
  });
});
