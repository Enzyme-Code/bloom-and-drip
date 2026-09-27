<script setup lang="ts">
useHead({ title: '器具設備 — Bloom & Drip' })

const { user } = useAuth()
const { gearSets, selectedId, select, add, remove } = useGear()
const { logs } = useBrewLogs()
const toast = useToast()

const drippers = computed(() => {
  const counts = new Map<string, number>()
  for (const l of logs.value) counts.set(l.params.dripper, (counts.get(l.params.dripper) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

function onAdd() {
  const g = add()
  select(g.id)
  toast.show(`已新增「${g.name}」`, 'add')
}

function onDuplicate(id: string) {
  const source = gearSets.value.find(g => g.id === id)
  if (!source) return
  const g = add(source)
  toast.show(`已複製為「${g.name}」`, 'content_copy')
}

function onSelect(id: string) {
  select(id)
  toast.show('已切換使用的器具組合', 'check_circle')
}
</script>

<template>
  <div class="flex flex-col w-full pb-space-xl">
    <PageTitle crumb="器具設備" title="器具設備" tag="Gear">
      <button
        type="button"
        class="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-all shadow-sm"
        @click="onAdd"
      >
        <span class="icon text-[16px]">add</span>
        新增器具組合
      </button>
    </PageTitle>

    <div class="px-margin-mobile md:px-margin pt-space-md flex flex-col gap-space-md">
      <p class="text-body-sm text-on-surface-variant">
        每組器具包含水溫、研磨、濾杯與水質，沖煮時在「粉水比」下方選擇要用哪一組。修改會自動儲存。
      </p>
      <p v-if="!user" class="flex flex-wrap items-center gap-1 text-body-sm bg-secondary-fixed/40 text-on-secondary-fixed px-3 py-2 rounded-lg">
        <span class="icon text-[18px]">info</span>
        訪客模式下的修改只在這次瀏覽有效，
        <NuxtLink :to="{ path: '/login', query: { redirect: '/gear' } }" class="font-semibold underline">登入</NuxtLink>
        後即可保存你的器具。
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        <GearCard
          v-for="g in gearSets"
          :key="g.id"
          :gear="g"
          :active="g.id === selectedId"
          :removable="gearSets.length > 1"
          @select="onSelect(g.id)"
          @duplicate="onDuplicate(g.id)"
          @remove="remove(g.id)"
        />
      </div>

      <section v-if="user" class="rounded-xl bg-surface-container-low p-space-lg flex flex-col gap-space-sm">
        <span class="text-label-md uppercase tracking-wider text-primary">濾杯使用紀錄</span>
        <p v-if="!drippers.length" class="text-body-sm text-on-surface-variant">尚無紀錄。</p>
        <div v-for="[name, count] in drippers" :key="name" class="flex items-center justify-between rounded-lg bg-surface-container p-3">
          <span class="font-mono text-body-sm text-primary">{{ name }}</span>
          <span class="font-mono text-label-mono text-secondary">{{ count }} 次</span>
        </div>
      </section>
    </div>
  </div>
</template>
