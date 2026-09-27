import type { BrewLog } from '~/types/brew'

/** Firestore documents max out at 1 MiB; keep the embedded photo well below that */
const MAX_PHOTO_CHARS = 700_000

/** Builds a BrewLog from the current session + timer and stores it in the journal. */
export function useBrewSave() {
  const session = useBrewSession()
  const timer = useBrewTimer()
  const { add } = useBrewLogs()
  const toast = useToast()
  const requireLogin = useLoginPrompt()

  function buildLog(): BrewLog {
    const b = session.bean.value
    const photo = session.photo.value
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      bean: {
        name: b.name.trim() || '未命名咖啡豆',
        nameEn: b.nameEn.trim(),
        process: b.process.trim(),
        roaster: b.roaster.trim(),
        roast: b.roast.trim(),
        bloomSeconds: Number(b.bloomSeconds) || 0,
        altitude: b.altitude ? Number(b.altitude) : null
      },
      dose: session.dose.value,
      water: session.water.value,
      params: { ...session.params.value },
      gearId: session.gear.value.id,
      gearName: session.gear.value.name,
      method: JSON.parse(JSON.stringify(session.method.value)),
      totalSeconds: Math.round(timer.elapsed.value),
      stageSplits: [...timer.splits.value],
      overall: session.overall.value,
      scores: { ...session.scores.value },
      flavors: [...session.flavors.value],
      notes: session.notes.value.trim(),
      tags: [...session.tags.value],
      photo: photo && photo.length <= MAX_PHOTO_CHARS ? photo : null
    }
  }

  function save() {
    if (timer.status.value === 'idle' && session.overall.value === 0 && !session.notes.value.trim()) {
      toast.show('尚未開始沖煮或填寫評分', 'info')
      return false
    }
    // Checked after the empty-brew guard so guests aren't bounced to login for nothing
    if (!requireLogin('登入後即可儲存這次的沖煮紀錄')) return false
    if (timer.status.value === 'running') timer.pause()

    const log = buildLog()
    const photoDropped = !!session.photo.value && !log.photo
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

  function summary() {
    const log = buildLog()
    return [
      `☕ ${log.bean.name}`,
      `${log.dose}g / ${log.water}g (1:${session.ratio.value}) · ${log.params.temperature}°C · ${log.params.grind}`,
      `⏱ ${formatTime(log.totalSeconds)} · ${log.params.dripper}`,
      log.overall ? `★ ${log.overall.toFixed(1)}` : '',
      log.flavors.length ? `風味：${log.flavors.join('、')}` : '',
      log.notes
    ]
      .filter(Boolean)
      .join('\n')
  }

  async function share() {
    const text = summary()
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Bloom & Drip 沖煮紀錄', text })
      } else {
        await navigator.clipboard.writeText(text)
        toast.show('已複製沖煮摘要', 'content_copy')
      }
    } catch {
      // Share sheet dismissed
    }
  }

  return { save, discard, share }
}
