import * as THREE from 'three'

export const palette = {
  floor: '#071626',
  steel: '#526579',
  darkSteel: '#18283a',
  body: '#1f3d5a',
  panel: '#0b1422',
  glass: '#07111f',
  cyan: '#38bdf8',
  blue: '#0ea5e9',
  green: '#26f5a6',
  orange: '#ffb020',
  red: '#ff4d5e',
  grey: '#8b9bb4',
  yellow: '#facc15',
}

export const factoryThemes = {
  dark: {
    background: '#031020',
    fog: '#031020',
    floor: '#071626',
    gridA: '#1f5f7a',
    gridB: '#14273b',
    wall: '#11243a',
    steel: '#526579',
    darkSteel: '#18283a',
    body: '#1f3d5a',
    panel: '#0b1422',
    glass: '#07111f',
    lightAmbient: '#b7e9ff',
    lightAmbientIntensity: 0.7,
    lightKey: '#ffffff',
    lightKeyIntensity: 2.05,
    lightRim: '#16d9ff',
    lightRimIntensity: 1.55,
  },
  light: {
    background: '#eef5fa',
    fog: '#eef5fa',
    floor: '#dce7ee',
    gridA: '#8ab8cf',
    gridB: '#c0d3de',
    wall: '#c9d8e2',
    steel: '#72889b',
    darkSteel: '#90a4b5',
    body: '#b9ccda',
    panel: '#f5f9fc',
    glass: '#d9edf7',
    lightAmbient: '#ffffff',
    lightAmbientIntensity: 1.25,
    lightKey: '#ffffff',
    lightKeyIntensity: 2.55,
    lightRim: '#4aa7d8',
    lightRimIntensity: 0.9,
  },
}

const lightColorMap = new Map([
  ['#071626', factoryThemes.light.floor],
  ['#11243a', factoryThemes.light.wall],
  ['#526579', factoryThemes.light.steel],
  ['#64748b', '#8294a6'],
  ['#5b7188', '#879bad'],
  ['#8aa4bf', '#9fb4c6'],
  ['#18283a', factoryThemes.light.darkSteel],
  ['#1f3d5a', factoryThemes.light.body],
  ['#24445f', '#bfd0dc'],
  ['#17324f', '#bfd0dc'],
  ['#34465a', '#95a8b8'],
  ['#21364f', '#adc0cf'],
  ['#101c2e', '#b8c7d4'],
  ['#10253b', '#bfd0dc'],
  ['#111c2e', '#aab9c5'],
  ['#1b3248', '#a9bdcb'],
  ['#25384c', '#b6c6d2'],
  ['#26384c', '#9badbd'],
  ['#2a3f55', '#9cafbf'],
  ['#334155', '#8c9bad'],
  ['#0b1422', factoryThemes.light.panel],
  ['#07111f', factoryThemes.light.glass],
  ['#06111f', '#e7f2f7'],
  ['#0f172a', '#d4e2ea'],
  ['#dbeafe', '#f7fbff'],
  ['#f8fafc', '#ffffff'],
  ['#c7d9e8', '#f0f6fa'],
  ['#d7e4ef', '#f4f8fb'],
])

export function themedColor(baseColor, theme = 'dark') {
  if (theme !== 'light') return baseColor
  return lightColorMap.get(String(baseColor).toLowerCase()) || baseColor
}

export function standardMaterial(color, options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color: themedColor(color, options.theme),
    roughness: options.roughness ?? 0.48,
    metalness: options.metalness ?? 0.28,
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? '#000000',
    emissiveIntensity: options.emissiveIntensity ?? 0,
  })
  material.userData.baseColor = color
  material.userData.baseEmissive = options.emissive ?? '#000000'
  material.userData.keepThemeColor = options.keepThemeColor ?? false
  return material
}

export function basicMaterial(color, options = {}) {
  const material = new THREE.MeshBasicMaterial({
    color: themedColor(color, options.theme),
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.DoubleSide,
    depthWrite: options.depthWrite ?? true,
  })
  material.userData.baseColor = color
  material.userData.keepThemeColor = options.keepThemeColor ?? false
  return material
}

export function applyMaterialTheme(material, theme = 'dark') {
  if (!material || material.userData?.keepThemeColor) return
  const baseColor = material.userData?.baseColor
  if (baseColor && material.color) material.color.set(themedColor(baseColor, theme))
  const baseEmissive = material.userData?.baseEmissive
  if (baseEmissive && material.emissive) material.emissive.set(baseEmissive)
}

export function statusColor(status) {
  if (status === 'running') return palette.green
  if (status === 'standby') return palette.orange
  if (status === 'fault') return palette.red
  return palette.grey
}
