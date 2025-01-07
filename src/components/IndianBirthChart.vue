<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  birthChart: Record<string, any>;
}>();

const zodiacSigns = [
  'Ari',
  'Tau',
  'Gem',
  'Can',
  'Leo',
  'Vir',
  'Lib',
  'Sco',
  'Sag',
  'Cap',
  'Aqu',
  'Pis',
];

const planetSymbols: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Mean_node: '☊',
  True_node: '☋',
};

const moonHouse = computed(() => {
  const moonData = props.birthChart.Moon;
  if (!moonData || !moonData.house) return 1;
  const houseMap = {
    First_House: 1,
    Second_House: 2,
    Third_House: 3,
    Fourth_House: 4,
    Fifth_House: 5,
    Sixth_House: 6,
    Seventh_House: 7,
    Eighth_House: 8,
    Ninth_House: 9,
    Tenth_House: 10,
    Eleventh_House: 11,
    Twelfth_House: 12,
  };
  return houseMap[moonData.house] || 1;
});

const houses = computed(() => {
  if (!props.birthChart) return [];

  return Array.from({ length: 12 }, (_, i) => {
    const houseKey = `${
      [
        'First',
        'Second',
        'Third',
        'Fourth',
        'Fifth',
        'Sixth',
        'Seventh',
        'Eighth',
        'Ninth',
        'Tenth',
        'Eleventh',
        'Twelfth',
      ][i]
    }_house`;
    const houseData = props.birthChart[houseKey];
    const planets = getPlanetsInHouse(`${houseKey}`);
    return {
      originalNumber: i + 1,
      adjustedNumber: ((i - moonHouse.value + 1 + 12) % 12) + 1,
      sign: houseData ? zodiacSigns[houseData.sign_num] : 'Unknown',
      planets: planets,
    };
  });
});

function getPlanetsInHouse(houseName: string) {
  const capitalizedHouseName = houseName.replace('_house', '_House');
  return Object.entries(props.birthChart)
    .filter(
      ([key, value]) =>
        typeof value === 'object' &&
        'house' in value &&
        value.house === capitalizedHouseName &&
        key !== 'aspects' &&
        !key.includes('_house')
    )
    .map(([key, value]) => ({
      name: key,
      symbol: planetSymbols[key] || key,
      position: (value as any).position.toFixed(0),
      retrograde: (value as any).retrograde,
    }));
}

const moonSign = computed(() => {
  const moonData = props.birthChart.Moon;
  return moonData ? zodiacSigns[moonData.sign_num] : 'Unknown';
});
</script>

<template>
  <div class="indian-birth-chart">
    <h2>North Indian Birth Chart (Moon-based House Numbering)</h2>
    <div class="chart-info">
      <p>Moon Sign: {{ moonSign }}</p>
    </div>
    <div v-if="houses.length" class="chart-grid">
      <div v-for="house in houses" :key="house.originalNumber" class="house">
        <div class="house-header">
          <span class="house-number">{{ house.adjustedNumber }}</span>
          <span class="house-sign">{{ house.sign }}</span>
        </div>
        <div class="planets">
          <div
            v-for="planet in house.planets"
            :key="planet.name"
            class="planet"
          >
            <span class="planet-symbol">{{ planet.symbol }}</span>
            <span class="planet-name">{{ planet.name }}</span>
            <span class="planet-position"
              >{{ planet.position }}°{{ planet.retrograde ? 'R' : '' }}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div v-else class="error-message">No birth chart data available.</div>
  </div>
</template>

<style scoped>
.indian-birth-chart {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-info {
  margin-bottom: 1rem;
  text-align: center;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1px;
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  background-color: #000;
}

.house {
  background-color: #fff;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.house-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.house-number {
  font-weight: bold;
  color: #ff6600;
}

.house-sign {
  color: #0066cc;
}

.planets {
  font-size: 0.8rem;
}

.planet {
  display: flex;
  align-items: center;
  margin-bottom: 0.1rem;
}

.planet-symbol {
  margin-right: 0.25rem;
}

.planet-name {
  margin-right: 0.25rem;
  font-weight: bold;
}

.planet-position {
  font-size: 0.7rem;
  color: #666;
}

.error-message {
  color: #ff0000;
  font-weight: bold;
}
</style>
