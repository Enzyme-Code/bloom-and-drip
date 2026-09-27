import type { GearSet } from '~/types/brew'

/** Starting gear for new users and guests; editable on the gear page */
export const DEFAULT_GEAR: GearSet[] = [
  {
    id: 'v60-daily',
    name: 'V60 日常',
    temperature: 92,
    grind: 'C40 24 格',
    grindNote: '中細研磨 (Medium-Fine)',
    dripper: 'Hario V60 01',
    filter: '三洋麻纖維濾紙',
    waterSource: 'Third Wave Water',
    waterNote: ''
  },
  {
    id: 'kalita-wave',
    name: 'Kalita 波浪',
    temperature: 93,
    grind: 'C40 22 格',
    grindNote: '中細研磨 (Medium-Fine)',
    dripper: 'Kalita Wave 155',
    filter: '波浪濾紙',
    waterSource: '過濾水',
    waterNote: ''
  },
  {
    id: 'hario-switch',
    name: 'Switch 浸泡',
    temperature: 90,
    grind: 'C40 26 格',
    grindNote: '中研磨 (Medium)',
    dripper: 'Hario Switch 02',
    filter: 'V60 錐形濾紙',
    waterSource: '礦泉水',
    waterNote: ''
  }
]
