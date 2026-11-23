Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true,
  },

  properties: {
    /** 卡片标题，留空则不渲染标题区 */
    title: { type: String, value: '' },
    /** 标题右侧的辅助说明 */
    hint: { type: String, value: '' },
    /** 紧凑模式：减小内边距，用于高频信息块 */
    compact: { type: Boolean, value: false },
    /** 去掉边框，用于内嵌块 */
    flat: { type: Boolean, value: false },
  },
});
