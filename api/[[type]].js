export default async function handler(request) {
    const { pathname } = new URL(request.url);
    const type = pathname.split('/').pop(); // 提取URL中的type参数
  
    // Mock数据定义
    const mockData = {
      game: [
        {
          id: 1,
          type: "image",
          title: "新英雄「焰灵」技能预览",
          media: "https://picsum.photos/300/400?random=1"
        },
        {
          id: 2,
          type: "video",
          title: "版本更新公告",
          media: "https://example.com/video1.mp4"
        }
      ],
      campus: [
        {
          id: 1,
          type: "image",
          title: "校园新地图「樱花湖」",
          media: "https://picsum.photos/300/500?random=2"
        }
      ]
    };
  
    // 返回对应数据
    const data = mockData[type] || [];
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  