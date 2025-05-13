// 全局变量
let currentPage = 1;
let isLoading = false;
let currentType = 'game'; // 默认类型

// 初始化：解析URL参数并加载数据
function init() {
  const params = new URLSearchParams(window.location.search);
  currentType = params.get('type') || 'game';
  loadData();
  setupScrollListener();
  setupPullToRefresh();
}

// 加载数据
async function loadData() {
  if (isLoading) return;
  isLoading = true;
  document.getElementById('loader').style.display = 'block';

  try {
    const response = await fetch(`/api/${currentType}?_page=${currentPage}&_limit=10`);
    const data = await response.json();
    renderItems(data);
    currentPage++;
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    isLoading = false;
    document.getElementById('loader').style.display = 'none';
  }
}

// 渲染瀑布流
function renderItems(items) {
  const waterfall = document.getElementById('waterfall');
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'item';
    itemEl.innerHTML = `
      ${item.type === 'video' ? 
        `<video controls><source src="${item.media}" type="video/mp4"></video>` : 
        `<img src="${item.media}" alt="${item.title}">`}
      <h3>${item.title}</h3>
    `;
    waterfall.appendChild(itemEl);
  });
}

// 上拉加载监听
function setupScrollListener() {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadData();
    }
  }, { threshold: 0.1 });

  observer.observe(document.getElementById('loader'));
}

// 下拉刷新
function setupPullToRefresh() {
  let startY;
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].clientY;
    if (y > startY + 100 && window.scrollY === 0) {
      window.location.reload(); // 简单实现
    }
  });
}

// 启动
init();
