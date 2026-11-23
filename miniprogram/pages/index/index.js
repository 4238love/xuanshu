const app = getApp();

/** 六大排盘体系 —— 与 Web 端首页保持一致的口径 */
const MODULES = [
  {
    id: 'bazi',
    icon: '☯',
    name: '八字排盘',
    desc: '四柱、十神、五行与流运的完整命盘档案。',
    features: ['四柱', '十神', '大运流年'],
    ready: true,
    route: '/packages/bazi/pages/bazi/bazi',
  },
  {
    id: 'liuyao',
    icon: '☷',
    name: '六爻排盘',
    desc: '本卦、变卦、六亲与神煞的占断工作台。',
    features: ['本变互综', '六亲六神'],
    ready: true,
    route: '/packages/liuyao/pages/liuyao/liuyao',
  },
  {
    id: 'daliuren',
    icon: '⚌',
    name: '大六壬',
    desc: '天地盘、四课三传与神将结构的课式舞台。',
    features: ['天地盘', '四课三传'],
    ready: true,
    route: '/packages/daliuren/pages/daliuren/daliuren',
  },
  {
    id: 'qimen',
    icon: '⚍',
    name: '奇门遁甲',
    desc: '九宫局式、八门九星与八神的综合盘面。',
    features: ['九宫布局', '值符值使'],
    ready: true,
    route: '/packages/qimen/pages/qimen/qimen',
  },
  {
    id: 'meihua',
    icon: '☲',
    name: '梅花易数',
    desc: '本卦、互卦、错综与体用分析的轻量盘面。',
    features: ['体用关系', '卦象注记'],
    ready: true,
    route: '/packages/meihua/pages/meihua/meihua',
  },
  {
    id: 'ziwei',
    icon: '★',
    name: '紫微斗数',
    desc: '十二宫、四化与大限小限的星曜盘册。',
    features: ['十二宫位', '四化星'],
    ready: true,
    route: '/packages/ziwei/pages/ziwei/ziwei',
  },
];

/** 层叠卡牌的位移参数，改手感只动这里 */
const CARD = {
  sideShift: 78, // 侧卡横向位移（卡片宽度百分比）
  sideScale: 0.14, // 侧卡缩小的幅度
  fade: 0.38, // 侧卡透明度衰减
  minOpacity: 0.62,
  farShift: 150,
  farScale: 0.8,
  hiddenBeyond: 1.02, // 偏移超过这个值就完全隐藏
  threshold: 0.18, // 判定翻页的位移占卡宽比例
  minThresholdPx: 28,
  moveEpsilon: 1.5, // 位移小于这个像素数不重绘，省掉无意义的 setData
  edgeDamping: 0.35, // 首尾卡再往外拖时的阻尼
  tapGuardMs: 350, // 拖动结束后多久内的 tap 不算点击
};

/**
 * 卡片内联样式。
 *
 * 纯函数：只依赖「卡片相对当前卡的偏移量」，拖到一半的偏移量是小数。
 * 注意：小程序 setData 每帧只能更新少量字段，拖动时只重算当前卡及左右各一张。
 *
 * @param {number} offset 相对当前卡的偏移（0 = 居中）
 * @param {boolean} isTop 是否是正在被拖动的那张，拖动中需要压在最上层
 */
function cardStyle(offset, isTop) {
  const abs = Math.abs(offset);
  const zIndex = isTop ? 30 : 20 - Math.round(Math.min(abs, 2) * 10);

  if (abs > CARD.hiddenBeyond) {
    return `transform: translateX(${(offset * CARD.farShift).toFixed(2)}%) scale(${CARD.farScale}); opacity: 0; z-index: ${zIndex};`;
  }

  const dist = Math.min(abs, 1);
  const dir = offset < 0 ? -1 : 1;
  const x = (dir * dist * CARD.sideShift).toFixed(2);
  const scale = (1 - dist * CARD.sideScale).toFixed(3);
  const opacity = Math.max(CARD.minOpacity, 1 - abs * CARD.fade).toFixed(2);

  return `transform: translateX(${x}%) scale(${scale}); opacity: ${opacity}; z-index: ${zIndex};`;
}

/** 首尾卡继续往外拖时给一点阻尼，手感上像橡皮筋 */
function dampen(dx, current, total) {
  if (dx > 0 && current === 0) return dx * CARD.edgeDamping;
  if (dx < 0 && current === total - 1) return dx * CARD.edgeDamping;
  return dx;
}

Page({
  data: {
    modules: [],
    dots: [],
    current: 0,
    currentName: '',
    statusBarHeight: 20,
    /** 卡片实际像素宽度，用来把手势位移换算成卡片比例 */
    cardWidth: 260,
    /** 拖动中关掉 CSS transition，松手后再打开做吸附动画 */
    dragging: false,
  },

  onLoad() {
    const safeArea = app.getSafeArea();
    const modules = MODULES.map((item, index) => {
      const card = Object.assign({}, item);
      card.style = cardStyle(index, false);
      return card;
    });

    // 卡片在 wxss 里是 520rpx，换算成当前设备上的像素宽
    const screenWidth = safeArea.screenWidth || 375;
    const cardWidth = Math.round((520 / 750) * screenWidth);

    this.setData({
      statusBarHeight: safeArea.statusBarHeight,
      cardWidth,
      modules,
      current: 0,
      currentName: modules[0].name,
      dots: modules.map((_item, index) => index === 0),
    });
  },

  onShow() {
    // 自定义 tabBar 不会自动同步选中态，必须每页自己设
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      if (tabBar) {
        tabBar.setData({ selected: 0 });
      }
    }
  },

  /* ---------------- 拖动 ---------------- */

  onStackTouchStart(event) {
    const touch = event.touches && event.touches[0];
    if (!touch) return;

    this.drag = {
      startX: touch.pageX,
      lastDx: 0,
      cardWidth: this.data.cardWidth || 260,
    };

    if (!this.data.dragging) {
      this.setData({ dragging: true });
    }
  },

  onStackTouchMove(event) {
    if (!this.drag) return;

    const touch = event.touches && event.touches[0];
    if (!touch) return;

    const dx = touch.pageX - this.drag.startX;
    if (Math.abs(dx - this.drag.lastDx) < CARD.moveEpsilon) return;

    this.drag.lastDx = dx;
    this.paintDrag(dx);
  },

  onStackTouchEnd(event) {
    if (!this.drag) return;

    const drag = this.drag;
    this.drag = null;

    const touch = event.changedTouches && event.changedTouches[0];
    const dx = touch ? touch.pageX - drag.startX : drag.lastDx;
    const threshold = Math.max(CARD.minThresholdPx, drag.cardWidth * CARD.threshold);

    let target = this.data.current;
    if (dx <= -threshold) {
      target += 1;
    } else if (dx >= threshold) {
      target -= 1;
    }

    this.settle(target, dx);
  },

  /** 拖动中重绘：只碰当前卡和左右各一张，其余保持原样（本来就在视口外） */
  paintDrag(dx) {
    const { modules, current, cardWidth } = this.data;
    const ratio = cardWidth > 0 ? dampen(dx, current, modules.length) / cardWidth : 0;
    const from = Math.max(0, current - 1);
    const to = Math.min(modules.length - 1, current + 1);
    const patch = {};

    for (let i = from; i <= to; i += 1) {
      patch[`modules[${i}].style`] = cardStyle(i - current + ratio, i === current);
    }

    this.setData(patch);
  },

  /** 落位：重算全部卡片样式，CSS transition 负责吸附动画 */
  settle(target, dx) {
    const modules = this.data.modules;
    const next = Math.max(0, Math.min(modules.length - 1, target));
    const patch = {};

    for (let i = 0; i < modules.length; i += 1) {
      patch[`modules[${i}].style`] = cardStyle(i - next, false);
    }

    patch.dragging = false;
    patch.current = next;
    patch.currentName = modules[next].name;
    patch.dots = modules.map((_item, i) => i === next);
    this.setData(patch);

    // 记下拖动时间，用于挡掉拖动结束时的误点
    if (Math.abs(dx) > 8) {
      this.lastDragAt = Date.now();
    }
  },

  setCurrent(index) {
    const { modules, current } = this.data;
    if (index < 0 || index >= modules.length || index === current) return;
    this.settle(index, 0);
  },

  /* ---------------- 点击 ---------------- */

  onTapCard(event) {
    // 刚拖动完的 tap 不算点击，否则滑完一张就误进模块
    if (this.lastDragAt && Date.now() - this.lastDragAt < CARD.tapGuardMs) return;

    const index = Number(event.currentTarget.dataset.index);
    const current = this.data.current;

    // 点侧边的卡片：先切到那张，不直接进模块
    if (index !== current) {
      this.setCurrent(index);
      return;
    }

    const target = this.data.modules[index];
    if (!target) return;

    if (!target.ready) {
      wx.showToast({
        title: `${target.name}正在迁移中`,
        icon: 'none',
        duration: 1600,
      });
      return;
    }

    wx.navigateTo({ url: target.route });
  },

  onTapDot(event) {
    const index = Number(event.currentTarget.dataset.index);
    if (index === this.data.current) return;
    this.setCurrent(index);
  },

  onShareAppMessage() {
    return {
      title: '玄数排盘 · 六大体系排盘工作台',
      path: '/pages/index/index',
    };
  },
});
