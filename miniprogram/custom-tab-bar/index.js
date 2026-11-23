/**
 * 自定义 tabBar
 *
 * 用 CSS 画图标，与纸质赭石视觉体系统一，不引入 PNG 资源。
 * 选中态由各 tab 页在 onShow 里通过 getTabBar().setData({ selected }) 同步，
 * 否则 switchTab 后自定义组件会保留上一次的选中态。
 */

const TABS = [
  { path: '/pages/index/index', text: '首页', icon: 'home' },
  { path: '/pages/mine/mine', text: '我的', icon: 'mine' },
];

Component({
  options: {
    addGlobalClass: true,
  },

  data: {
    selected: 0,
    list: TABS,
  },

  methods: {
    onTap(event) {
      const index = Number(event.currentTarget.dataset.index);
      if (index === this.data.selected) return;

      wx.switchTab({
        url: TABS[index].path,
        fail: (error) => {
          console.error('[tabBar] 切换失败', error);
        },
      });
    },
  },
});
