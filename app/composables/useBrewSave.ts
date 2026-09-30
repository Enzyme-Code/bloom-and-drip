import type { BrewLog } from '~/types/brew'

/** Builds a BrewLog from the current session + timer and stores it in the journal. */
export function useBrewSave() {
  const session = useBrewSession()
  const timer = useBrewTimer()
  const { add } = useBrewLogs()
  const toast = useToast()
  const requireLogin = useLoginPrompt()
  const { gearSets } = useGear()

  function buildLog(): BrewLog {
    const b = session.bean.value
    const tasting = {
      overall: session.overall.value,
      scores: { ...session.scores.value },
      flavors: [...session.flavors.value],
      notes: session.notes.value.trim(),
      tags: [...session.tags.value],
      // usePhotoList keeps the list within budget; this is only a safety net against an oversized document
      photos: photosSize(session.photos.value) <= PHOTO_BUDGET_CHARS ? [...session.photos.value] : []
    }
    const bean = {
      name: b.name.trim() || '未命名咖啡豆',
      nameEn: b.nameEn.trim(),
      process: b.process.trim(),
      roaster: b.roaster.trim(),
      roast: b.roast.trim(),
      bloomSeconds: Number(b.bloomSeconds) || 0
    }

    if (session.logMode.value === 'taste') {
      // Only the optional method name and gear set; Firestore rejects undefined, so absent keys are left out
      const methodName = session.tasteMethod.value.trim()
      const gear = gearSets.value.find(g => g.id === session.tasteGearId.value)
      return {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        mode: 'taste',
        bean,
        ...(methodName ? { method: { name: methodName, steps: [] } } : {}),
        ...(gear ? { gearId: gear.id, gearName: gear.name } : {}),
        ...tasting
      }
    }

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      bean,
      dose: session.dose.value,
      water: session.water.value,
      params: { ...session.params.value },
      gearId: session.gear.value.id,
      gearName: session.gear.value.name,
      method: JSON.parse(JSON.stringify(session.method.value)),
      totalSeconds: Math.round(timer.elapsed.value),
      stageSplits: [...timer.splits.value],
      ...tasting
    }
  }

  /** Anything filled in on the tasting side (the radar starts at 3, so it can't tell) */
  function hasTasting() {
    return session.overall.value > 0
      || !!session.notes.value.trim()
      || session.flavors.value.length > 0
      || session.tags.value.length > 0
      || session.photos.value.length > 0
  }

  function save() {
    const taste = session.logMode.value === 'taste'
    if (!hasTasting() && (taste || timer.status.value === 'idle')) {
      toast.show(taste ? '請先填寫評分、風味或筆記' : '尚未開始沖煮或填寫評分', 'info')
      return false
    }
    // Checked after the empty-brew guard so guests aren't bounced to login for nothing
    if (!requireLogin('登入後即可儲存這次的沖煮紀錄')) return false
    if (!taste && timer.status.value === 'running') timer.pause()

    const log = buildLog()
    const photoDropped = session.photos.value.length > 0 && !log.photos?.length
    try {
      add(log)
    } catch (err) {
      console.error('[save]', err)
      toast.show(`儲存失敗：${firestoreErrorMessage(err)}`, 'error')
      return false
    }
    discard()
    toast.show(photoDropped ? '已儲存（照片過大未保存）' : '已儲存本次沖煮紀錄')
    return true
  }

  function discard() {
    timer.reset()
    session.resetSensory()
  }

  return { save, discard }
}
