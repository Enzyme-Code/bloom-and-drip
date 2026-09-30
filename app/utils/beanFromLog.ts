import { BLANK_BEAN } from '~/data/beans'
import type { BeanInfo, BrewLog, Recipe } from '~/types/brew'

/** The bean of a saved log, plus its recipe (taste-only logs carry none) */
export function beanFromLog(log: BrewLog): { info: BeanInfo; recipe?: Recipe } {
  return {
    info: {
      name: log.bean.name,
      nameEn: log.bean.nameEn ?? '',
      process: log.bean.process ?? '',
      roaster: log.bean.roaster ?? '',
      roast: log.bean.roast ?? '',
      bloomSeconds: log.bean.bloomSeconds || BLANK_BEAN.bloomSeconds
    },
    recipe: log.dose && log.water ? { dose: log.dose, ratio: round1(log.water / log.dose), gearId: log.gearId, method: log.method } : undefined
  }
}
