# 共享UI组件库

这是一个基于 React + TypeScript + Tailwind CSS 构建的共享UI组件库，为易学排盘系统提供统一的UI组件。

## 特性

- ✅ 完整的 TypeScript 类型定义
- ✅ 响应式设计支持
- ✅ 可访问性 (ARIA) 支持
- ✅ 支持自定义样式
- ✅ 渐变色主题支持
- ✅ 动画效果

## 组件列表

### 1. Card - 卡片容器组件

用于展示内容的通用卡片容器。

```tsx
import { Card } from '@/components/shared';

<Card
  title="八字排盘"
  icon="☯"
  gradient="from-purple-500 to-pink-500"
  hoverable
  shadow
>
  <p>卡片内容</p>
</Card>
```

**Props:**
- `title?: string` - 卡片标题
- `icon?: string` - 标题图标
- `gradient?: string` - 渐变色类名
- `shadow?: boolean` - 是否显示阴影 (默认: true)
- `hoverable?: boolean` - 是否可悬停效果 (默认: false)
- `onClick?: () => void` - 点击事件

### 2. GradientButton - 渐变按钮组件

支持渐变背景、加载状态的按钮组件。

```tsx
import { GradientButton } from '@/components/shared';

<GradientButton
  gradient="from-purple-500 to-pink-500"
  size="md"
  loading={false}
  icon="→"
  onClick={handleClick}
>
  开始排盘
</GradientButton>
```

**Props:**
- `gradient?: string` - 渐变色类名 (默认: 'from-purple-500 to-pink-500')
- `size?: 'sm' | 'md' | 'lg'` - 按钮尺寸 (默认: 'md')
- `loading?: boolean` - 加载状态 (默认: false)
- `fullWidth?: boolean` - 是否全宽 (默认: false)
- `icon?: React.ReactNode` - 图标
- `iconPosition?: 'left' | 'right'` - 图标位置 (默认: 'left')

### 3. InfoGrid - 信息网格组件

用于展示结构化信息的网格布局。

```tsx
import { InfoGrid } from '@/components/shared';

<InfoGrid
  items={[
    { label: '年柱', value: '甲子', icon: '☯', color: 'from-purple-50 to-pink-50' },
    { label: '月柱', value: '乙丑', icon: '☯', color: 'from-blue-50 to-cyan-50' }
  ]}
  columns={{ sm: 1, md: 2, lg: 4 }}
  gap="md"
/>
```

**Props:**
- `items: InfoGridItem[]` - 信息项数组
- `columns?: { sm?: number; md?: number; lg?: number }` - 响应式列数
- `gap?: 'sm' | 'md' | 'lg'` - 间距大小 (默认: 'md')

**InfoGridItem:**
- `label: string` - 标签
- `value: string | number | React.ReactNode` - 值
- `icon?: string` - 图标
- `color?: string` - 渐变色
- `className?: string` - 自定义类名

### 4. CollapsibleSection - 折叠面板组件

可展开/折叠的内容面板。

```tsx
import { CollapsibleSection } from '@/components/shared';

<CollapsibleSection
  title="详细信息"
  icon="📋"
  defaultOpen={true}
  gradient="from-purple-500 to-pink-500"
>
  <p>这里是可折叠的内容</p>
</CollapsibleSection>
```

**Props:**
- `title: string` - 标题
- `icon?: string` - 标题图标
- `defaultOpen?: boolean` - 默认是否展开 (默认: false)
- `gradient?: string` - 渐变色

### 5. Badge - 标签徽章组件

用于标记和分类的小型标签。

```tsx
import { Badge } from '@/components/shared';

<Badge variant="success" size="md" icon="✓" gradient>
  已完成
</Badge>
```

**Props:**
- `variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink'` - 变体样式 (默认: 'default')
- `size?: 'sm' | 'md' | 'lg'` - 尺寸 (默认: 'md')
- `icon?: string` - 图标
- `gradient?: boolean` - 是否使用渐变 (默认: false)

### 6. LoadingSpinner - 加载动画组件

显示加载状态的旋转动画。

```tsx
import { LoadingSpinner } from '@/components/shared';

<LoadingSpinner
  size="md"
  color="primary"
  text="加载中..."
  fullScreen={false}
/>
```

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - 尺寸 (默认: 'md')
- `color?: 'primary' | 'secondary' | 'white' | 'gray'` - 颜色 (默认: 'primary')
- `text?: string` - 加载文本
- `fullScreen?: boolean` - 是否全屏居中 (默认: false)

### 7. AnimatedCard - 动画卡片组件

带有悬停动画效果的交互式卡片。

```tsx
import { AnimatedCard } from '@/components/shared';

<AnimatedCard
  title="八字排盘"
  description="四柱八字，推算命理"
  icon="☯"
  gradient="from-purple-500 to-pink-500"
  animation="lift"
  onClick={handleClick}
/>
```

**Props:**
- `title: string` - 卡片标题
- `description?: string` - 卡片描述
- `icon?: string` - 图标
- `gradient?: string` - 渐变色类名 (默认: 'from-purple-500 to-pink-500')
- `animation?: 'lift' | 'scale' | 'glow' | 'slide'` - 动画类型 (默认: 'lift')
- `onClick?: () => void` - 点击事件
- `href?: string` - 链接地址

### 8. FormInput - 表单输入组件

带标签、错误提示、帮助文本的表单输入框。

```tsx
import { FormInput, FormTextarea } from '@/components/shared';

<FormInput
  label="姓名"
  placeholder="请输入姓名"
  required
  error={errors.name}
  helperText="请输入真实姓名"
  prefixIcon={<span>👤</span>}
/>

<FormTextarea
  label="备注"
  placeholder="请输入备注"
  rows={4}
/>
```

**FormInput Props:**
- `label?: string` - 标签文本
- `error?: string` - 错误信息
- `helperText?: string` - 帮助文本
- `inputSize?: 'sm' | 'md' | 'lg'` - 输入框尺寸 (默认: 'md')
- `required?: boolean` - 是否必填 (默认: false)
- `prefixIcon?: React.ReactNode` - 前置图标
- `suffixIcon?: React.ReactNode` - 后置图标

## 渐变色方案

项目中使用的标准渐变色：

- **八字排盘**: `from-purple-500 to-pink-500`
- **六爻排盘**: `from-blue-500 to-cyan-500`
- **梅花易数**: `from-indigo-500 to-purple-500`
- **大六壬**: `from-green-500 to-emerald-500`
- **奇门遁甲**: `from-orange-500 to-red-500`
- **紫微斗数**: `from-pink-500 to-rose-500`

## 使用示例

### 完整的表单示例

```tsx
'use client';

import { useState } from 'react';
import { Card, FormInput, GradientButton, LoadingSpinner } from '@/components/shared';

export default function ExampleForm() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 处理提交逻辑
    setLoading(false);
  };

  return (
    <Card
      title="示例表单"
      icon="📝"
      gradient="from-purple-500 to-pink-500"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="请输入姓名"
        />

        <GradientButton
          type="submit"
          gradient="from-purple-500 to-pink-500"
          loading={loading}
          fullWidth
        >
          提交
        </GradientButton>
      </form>
    </Card>
  );
}
```

## 可访问性

所有组件都遵循 WCAG 2.1 可访问性标准：

- 使用语义化 HTML 标签
- 提供适当的 ARIA 属性
- 支持键盘导航
- 提供屏幕阅读器支持
- 适当的颜色对比度

## 响应式设计

所有组件都支持响应式设计，使用 Tailwind CSS 的响应式断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 自定义样式

所有组件都支持通过 `className` prop 添加自定义样式：

```tsx
<Card className="my-custom-class">
  内容
</Card>
```

## 技术栈

- React 19
- TypeScript 5
- Tailwind CSS 4
- Next.js 16
