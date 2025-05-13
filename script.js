/**
 * 233乐园社区发现页 - 主逻辑实现
 * 功能：瀑布流布局、上拉加载、下拉刷新、视频播放、数据动态渲染
 */

// 配置常量
const CONFIG = {
  DEFAULT_DATA_TYPE: 'default',
  LOAD_DELAY: 800,
  REFRESH_DELAY: 1000,
  VIDEO_PROBABILITY: 0.3,
  INITIAL_LOAD_COUNT: 12,
  SUBSEQUENT_LOAD_COUNT: 6
};

// 数据模板
const DATA_TEMPLATES = {
  titles: {
      default: [
          "版本前瞻 | 手游新版本预告",
          "重置新模型 部分攻击新特效",
          "新角色技能展示，太酷啦！",
          "公会战新玩法攻略分享",
          "每日签到奖励翻倍活动开启",
          "玩家自制地图分享"
      ],
      game: [
          "王者荣耀新赛季上分技巧",
          "和平精英最新枪械测评",
          "原神3.0版本新地图探索",
          "LOL手游新英雄技能解析",
          "阴阳师新式神抽卡玄学",
          "崩坏3新剧情讨论"
      ],
      school: [
          "校园模拟新服装展示",
          "同学互动新功能体验",
          "教室装修设计大赛",
          "校园恋爱剧情讨论",
          "学霸养成攻略分享",
          "校园活动策划建议"
      ]
  },
  descriptions: [
      "这次更新带来了全新的游戏体验，模型更加精细，特效更加炫酷，快来体验吧！",
      "经过玩家反馈，我们对部分角色进行了平衡性调整，游戏体验更加公平。",
      "新版本活动福利多多，登录就送限定皮肤，千万不要错过！",
      "分享一个快速升级的小技巧，亲测有效，一天升10级不是梦。",
      "公会战新玩法上线，团队配合更重要了，来看看我们的战术分享。",
      "玩家自制地图上线创意工坊，各种有趣玩法等你来发现。"
  ],
  users: ["游戏达人", "攻略大师", "萌新玩家", "资深策划", "电竞选手", "美术设计"]
};

// DOM 元素
const DOM = {
  loading: document.getElementById('loading'),
  refresh: document.getElementById('refresh'),
  column1: document.getElementById('column1'),
  column2: document.getElementById('column2'),
  tabs: document.querySelectorAll('.tab')
};

/**
* 工具函数 - 从URL获取参数
* @param {string} name - 参数名
* @returns {string|null} 参数值
*/
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
* 生成模拟数据
* @param {string} type - 数据类型 (default|game|school)
* @returns {Array} 生成的数据数组
*/
function generateMockData(type = CONFIG.DEFAULT_DATA_TYPE) {
  const data = [];
  const count = type === CONFIG.DEFAULT_DATA_TYPE ? 
      CONFIG.INITIAL_LOAD_COUNT : CONFIG.SUBSEQUENT_LOAD_COUNT;
  const titles = DATA_TEMPLATES.titles[type] || DATA_TEMPLATES.titles.default;

  for (let i = 0; i < count; i++) {

      const isVideo = Math.random() < CONFIG.VIDEO_PROBABILITY;
      data.push({
          id: Date.now() + i,
          title: titles[i % titles.length],
          description: DATA_TEMPLATES.descriptions[i % DATA_TEMPLATES.descriptions.length],
          user: DATA_TEMPLATES.users[i % DATA_TEMPLATES.users.length],
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 500),
          isVideo, 
          media:  isVideo 
          ? `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4?${type}`
          : `https://picsum.photos/400/${Math.floor(300 + Math.random() * 200)}?random=${type}`
      });
  }

  return data;
}

/**
* 瀑布流布局控制器
*/
class WaterfallController {
  constructor() {
      this.columnHeights = [0, 0];
      this.page = 1;
      this.isLoading = false;
      this.dataType = getUrlParam('type') || CONFIG.DEFAULT_DATA_TYPE;
      this.startY = 0;
      this.currentY = 0;
      
      this.init();
  }

  /**
   * 初始化方法
   */
  init() {
      this.setupEventListeners();
      this.loadData();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
      // 上拉加载
      window.addEventListener('scroll', this.handleScroll.bind(this));
      
      // 下拉刷新
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
      
      // 视频控制
      document.addEventListener('click', this.handleVideoControl.bind(this));
      
      // Tab切换
      DOM.tabs.forEach(tab => {
          tab.addEventListener('click', () => this.switchTab(tab));
      });
  }

  /**
   * 滚动处理 - 上拉加载
   */
  handleScroll() {
      if (this.isLoading) return;
      
      const { scrollTop, scrollHeight } = document.documentElement;
      const { innerHeight } = window;
      
      if (scrollTop + innerHeight >= scrollHeight - 100) {
          this.loadData();
      }
  }

  /**
   * 触摸开始 - 下拉刷新
   * @param {TouchEvent} e 
   */
  handleTouchStart(e) {
      this.startY = e.touches[0].clientY;
  }

  /**
   * 触摸移动 - 下拉刷新
   * @param {TouchEvent} e 
   */
  handleTouchMove(e) {
      if (this.isLoading) return;
      
      this.currentY = e.touches[0].clientY;
      const diff = this.currentY - this.startY;
      
      if (diff > 0 && window.scrollY <= 0) {
          e.preventDefault();
          DOM.refresh.style.top = `${Math.min(diff, 60) - 50}px`;
          DOM.refresh.textContent = diff > 60 ? '释放刷新' : '下拉刷新';
      }
  }

  /**
   * 触摸结束 - 下拉刷新
   */
  handleTouchEnd() {
      const diff = this.currentY - this.startY;
      
      if (diff > 60 && window.scrollY <= 0) {
          this.refreshData();
      } else {
          DOM.refresh.style.top = '-50px';
      }
  }

  /**
   * 视频控制处理
   * @param {MouseEvent} e 
   */
  handleVideoControl(e) {
      // 点击播放按钮
      if (e.target.closest('.play-icon')) {
          const video = e.target.closest('.card-media').querySelector('video');
          if (video) {
              video.play();
              e.target.closest('.play-icon').style.display = 'none';
          }
          return;
      }
      
      // 点击视频暂停
      if (e.target.tagName === 'VIDEO') {
          const video = e.target;
          video.pause();
          video.currentTime = 0;
          video.nextElementSibling.style.display = 'flex';
      }
  }

  /**
   * 切换Tab
   * @param {HTMLElement} tab 
   */
  switchTab(tab) {
      DOM.tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 根据Tab切换数据类型
      const typeMap = {
          '发现': 'default',
          '游戏圈': 'game',
          '模拟校园': 'school'
      };
      
      this.dataType = typeMap[tab.textContent] || CONFIG.DEFAULT_DATA_TYPE;
      this.refreshData();
  }

  /**
   * 加载数据
   */
  async loadData() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      DOM.loading.style.display = 'block';
      
      // 模拟异步加载
      await new Promise(resolve => setTimeout(resolve, CONFIG.LOAD_DELAY));
      
      const data = generateMockData(this.dataType);
      this.renderData(data);
      
      this.page++;
      this.isLoading = false;
      DOM.loading.style.display = 'none';
  }

  /**
   * 刷新数据
   */
  async refreshData() {
      DOM.refresh.textContent = '刷新中...';
      
      // 清空现有内容
      DOM.column1.innerHTML = '';
      DOM.column2.innerHTML = '';
      this.columnHeights = [0, 0];
      this.page = 1;
      
      // 模拟异步刷新
      await new Promise(resolve => setTimeout(resolve, CONFIG.REFRESH_DELAY));
      
      const data = generateMockData(this.dataType);
      this.renderData(data);
      
      DOM.refresh.style.top = '-50px';
      this.page = 2;
  }

  /**
   * 渲染数据
   * @param {Array} data 
   */
  renderData(data) {
      data.forEach(item => {
          const card = this.createCardElement(item);
          const columnIndex = this.columnHeights[0] <= this.columnHeights[1] ? 0 : 1;
          
          if (columnIndex === 0) {
              DOM.column1.appendChild(card);
          } else {
              DOM.column2.appendChild(card);
          }
          
          this.columnHeights[columnIndex] += card.offsetHeight;
      });
  }

  /**
   * 创建卡片元素
   * @param {Object} item 
   * @returns {HTMLElement} 卡片元素
   */
  createCardElement(item) {
      const card = document.createElement('div');
      card.className = 'card';
      
      const mediaHtml = item.isVideo ? `
          <div class="card-media">
          <video src="${item.media}" controls="" poster="https://picsum.photos/400/300?random=${item.id}>
          </video> 
          
          </div>
      ` : `
          <div class="card-media">
              <img src="${item.media}" alt="${item.title}" loading="lazy">
          </div>
      `;
      
      card.innerHTML = `
          ${mediaHtml}
          <div class="card-content">
              <div class="card-title">${item.title}</div>
              <div class="card-desc">${item.description}</div>
          </div>
          <div class="card-footer">
              <div class="footer-item">
                  <i>👤</i>
                  <span>${item.user}</span>
              </div>
              <div class="footer-item">
                  <i>👍</i>
                  <span>${item.likes}</span>
              </div>
              <div class="footer-item">
                  <i>💬</i>
                  <span>${item.comments}</span>
              </div>
          </div>
      `;
      
      return card;
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new WaterfallController();
});