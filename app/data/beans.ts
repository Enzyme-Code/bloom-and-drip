import type { BeanInfo, BeanTemplate } from '~/types/brew'

/** Starting points in the bean picker; everything is editable afterwards */
export const BEAN_TEMPLATES: BeanTemplate[] = [
  {
    id: 'yirgacheffe-gedeb',
    name: '衣索比亞 耶加雪菲 潔蒂普',
    nameEn: 'Ethiopia Yirgacheffe Gedeb',
    process: '日曬 G1',
    roaster: 'NOMAD ROASTERS',
    roast: '淺焙 Light Roast',
    bloomSeconds: 35,
    recommended: { dose: 16, ratio: 15 }
  },
  {
    id: 'kenya-nyeri',
    name: '肯亞 涅里 AA',
    nameEn: 'Kenya Nyeri AA',
    process: '水洗 AA',
    roaster: 'SIMPLE KAFFA',
    roast: '淺中焙 Light-Medium',
    bloomSeconds: 30,
    recommended: { dose: 15, ratio: 16 }
  },
  {
    id: 'colombia-huila',
    name: '哥倫比亞 薇拉 粉紅波旁',
    nameEn: 'Colombia Huila Pink Bourbon',
    process: '厭氧水洗',
    roaster: 'FIKA FIKA',
    roast: '中焙 Medium Roast',
    bloomSeconds: 40,
    recommended: { dose: 18, ratio: 14 }
  }
]

export const BLANK_BEAN: BeanInfo = {
  name: '',
  nameEn: '',
  process: '',
  roaster: '',
  roast: '',
  bloomSeconds: 35
}

export const PROCESS_SUGGESTIONS = ['日曬', '水洗', '蜜處理', '厭氧發酵', '半水洗', '濕剝法']
export const ROAST_SUGGESTIONS = ['極淺焙', '淺焙', '淺中焙', '中焙', '中深焙', '深焙']

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
