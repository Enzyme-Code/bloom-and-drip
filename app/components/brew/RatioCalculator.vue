<script setup lang="ts">
const { dose, water, ratio, params, setDose, setWater, setRatio } = useBrewSession()

const DOSE_PRESETS = [15, 16, 18, 20]
const RATIO_PRESETS = [14, 15, 16, 16.5]

/** SCA Golden Cup range is roughly 1:15 – 1:18 */
const inGoldenCup = computed(() => ratio.value >= 15 && ratio.value <= 18)

const presetClass = (active: boolean) =>
  active ? 'bg-primary text-on-primary' : 'bg-surface-container-high hover:bg-secondary-fixed text-on-surface'
</script>

<template>
  <div class="rounded-xl bg-surface-container-low p-4 md:p-space-lg shadow-sm flex flex-col gap-space-md">
    <!-- Title row -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="hidden md:block w-2 h-2 rounded-full bg-secondary" />
        <span class="md:hidden icon text-[18px] text-secondary">tune</span>
        <span class="text-label-md uppercase tracking-wider text-primary">粉水比動態計算機</span>
        <span class="hidden md:inline font-mono text-label-mono text-outline">RATIO CALIBRATION</span>
      </div>
      <span
        v-if="inGoldenCup"
        class="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-label-mono font-medium"
      >
        <span class="icon text-[13px]">verified</span>
        SCA 黃金金杯比例
      </span>
      <span class="md:hidden px-2.5 py-1 rounded-lg bg-secondary-fixed/60 font-mono text-body-sm text-secondary font-medium">
        粉水比 {{ formatRatio(ratio) }}
      </span>
    </div>

    <!-- Desktop steppers -->
    <div class="hidden md:grid grid-cols-12 gap-space-md items-center">
      <div class="col-span-5 rounded-lg bg-surface-container p-space-md flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md text-on-surface-variant">咖啡粉量 (Coffee Dose)</span>
          <span class="font-mono text-label-mono text-secondary">TARGET MASS</span>
        </div>
        <BrewStepper :model-value="dose" :step="0.5" @update:model-value="setDose" />
        <div class="flex items-center justify-between pt-1">
          <span class="font-mono text-[10px] text-outline">快捷預設</span>
          <div class="flex gap-1 font-mono text-[11px]">
            <button
              v-for="p in DOSE_PRESETS"
              :key="p"
              type="button"
              class="px-1.5 py-0.5 rounded"
              :class="presetClass(dose === p)"
              @click="setDose(p)"
            >
              {{ p }}g
            </button>
          </div>
        </div>
      </div>

      <div class="col-span-2 flex flex-col items-center justify-center py-2">
        <span class="font-mono text-[10px] text-outline uppercase tracking-widest mb-1">Ratio</span>
        <div class="px-3 py-2 rounded-lg bg-surface-container-highest shadow-inner">
          <span class="font-mono text-lg font-bold text-secondary tracking-tight whitespace-nowrap">{{ formatRatio(ratio) }}</span>
        </div>
        <span class="icon text-secondary text-sm mt-1">sync_alt</span>
      </div>

      <div class="col-span-5 rounded-lg bg-surface-container p-space-md flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md text-on-surface-variant">總注水量 (Water Volume)</span>
          <span class="font-mono text-label-mono text-secondary">FINAL YIELD</span>
        </div>
        <BrewStepper :model-value="water" :step="5" @update:model-value="setWater" />
        <div class="flex items-center justify-between pt-1">
          <span class="font-mono text-[10px] text-outline">注水倍率</span>
          <div class="flex gap-1 font-mono text-[11px]">
            <button
              v-for="r in RATIO_PRESETS"
              :key="r"
              type="button"
              class="px-1.5 py-0.5 rounded"
              :class="presetClass(ratio === r)"
              @click="setRatio(r)"
            >
              1:{{ r }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile steppers -->
    <div class="md:hidden grid grid-cols-2 gap-2">
      <div class="rounded-lg bg-surface-container p-3 flex flex-col gap-2 min-w-0">
        <span class="font-mono text-[11px] text-on-surface-variant">咖啡粉量 (DOSE)</span>
        <BrewStepper :model-value="dose" :step="0.5" size="md" @update:model-value="setDose" />
      </div>
      <div class="rounded-lg bg-surface-container p-3 flex flex-col gap-2 min-w-0">
        <span class="font-mono text-[11px] text-on-surface-variant">總注水量 (WATER)</span>
        <BrewStepper :model-value="water" :step="5" size="md" @update:model-value="setWater" />
      </div>
    </div>

    <!-- Parameter cards -->
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-space-sm md:pt-2">
      <BrewParamCard
        v-model:value="params.temperature"
        icon="device_thermostat"
        label="注水水溫"
        suffix="°C"
        hint="PID 智能溫控壺"
        numeric
      />
      <BrewParamCard
        v-model:value="params.grind"
        v-model:note="params.grindNote"
        icon="grain"
        label="研磨刻度"
      />
      <BrewParamCard
        v-model:value="params.dripper"
        v-model:note="params.filter"
        icon="filter_vintage"
        label="萃取濾杯"
      />
      <BrewParamCard
        v-model:value="params.waterPpm"
        v-model:note="params.waterNote"
        icon="water_drop"
        label="沖煮水質"
        suffix="ppm"
        numeric
        class="hidden sm:flex"
      />
    </div>
  </div>
</template>
