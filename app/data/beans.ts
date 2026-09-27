import type { Bean } from '~/types/brew'

export const BEANS: Bean[] = [
  {
    id: 'yirgacheffe-gedeb',
    name: '衣索比亞 耶加雪菲 潔蒂普',
    nameEn: 'Ethiopia Yirgacheffe Gedeb',
    process: '日曬 G1',
    roaster: 'NOMAD ROASTERS',
    roast: '淺焙 Light Roast',
    bloomSeconds: 35,
    altitude: 2150,
    recommended: {
      dose: 16,
      ratio: 15,
      temperature: 92,
      grind: 'C40 24 格',
      grindNote: '中細研磨 (Medium-Fine)',
      dripper: 'Hario V60 01',
      filter: '三洋麻纖維濾紙',
      waterPpm: 75,
      waterNote: 'Third Wave Water'
    }
  },
  {
    id: 'kenya-nyeri',
    name: '肯亞 涅里 AA',
    nameEn: 'Kenya Nyeri AA',
    process: '水洗 AA',
    roaster: 'SIMPLE KAFFA',
    roast: '淺中焙 Light-Medium',
    bloomSeconds: 30,
    altitude: 1800,
    recommended: {
      dose: 15,
      ratio: 16,
      temperature: 93,
      grind: 'C40 22 格',
      grindNote: '中細研磨 (Medium-Fine)',
      dripper: 'Kalita Wave 155',
      filter: '波浪濾紙',
      waterPpm: 90,
      waterNote: 'Third Wave Water'
    }
  },
  {
    id: 'colombia-huila',
    name: '哥倫比亞 薇拉 粉紅波旁',
    nameEn: 'Colombia Huila Pink Bourbon',
    process: '厭氧水洗',
    roaster: 'FIKA FIKA',
    roast: '中焙 Medium Roast',
    bloomSeconds: 40,
    altitude: 1750,
    recommended: {
      dose: 18,
      ratio: 14,
      temperature: 90,
      grind: 'C40 26 格',
      grindNote: '中研磨 (Medium)',
      dripper: 'Origami M',
      filter: '錐形濾紙',
      waterPpm: 110,
      waterNote: '過濾自來水'
    }
  }
]

export const FLAVOR_LIBRARY = [
  '柑橘 Citrus',
  '茉莉花 Jasmine',
  '蜂蜜 Honey',
  '佛手柑 Bergamot',
  '水蜜桃 Peach',
  '黑巧克力 Dark Chocolate',
  '杏仁 Almond',
  '焦糖 Caramel',
  '莓果 Berry',
  '紅茶 Black Tea'
]

/** Descriptors for low (<2.5), mid (<4) and high scores */
export const SENSORY_DIMENSIONS = [
  { key: 'acidity', label: '酸質 (Acidity)', descriptors: ['柔和低酸', '明亮果酸', '亮麗明亮柑橘酸'] },
  { key: 'sweetness', label: '甜感 (Sweetness)', descriptors: ['甜感偏弱', '焦糖蔗糖甜', '水蜜桃與成熟果甜'] },
  { key: 'body', label: '醇厚度 (Body)', descriptors: ['輕盈水感', '絲滑圓潤茶感質地', '厚實奶油口感'] },
  { key: 'aftertaste', label: '餘韻 (Aftertaste)', descriptors: ['收尾短促', '甜感回韻', '大吉嶺紅茶花香尾韻'] },
  { key: 'cleanliness', label: '乾淨度 (Cleanliness)', descriptors: ['略有雜味', '乾淨清爽', '晶瑩剔透無雜味'] }
] as const

export const NOTE_TAGS = ['推薦熱飲', '適合冷萃', '排氣第 14 天最佳賞味']
