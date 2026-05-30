<template>
  <div>
    <h2>📊 MES 综合数据看板 (OEE监控)</h2>
    <el-row :gutter="20">
      <el-col :span="12"><el-card><div id="pieChart" style="height: 400px;"></div></el-card></el-col>
      <el-col :span="12"><el-card><div id="barChart" style="height: 400px;"></div></el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'
import { getDevices } from '../api'
import { statusMap, statusColors } from '../utils/config'

onMounted(async () => {
  const devices = (await getDevices()).data
  const statusCount = {}
  devices.forEach(d => statusCount[d.status] = (statusCount[d.status] || 0) + 1)
  
  const pieChart = echarts.init(document.getElementById('pieChart'))
  pieChart.setOption({
    title: { text: '全厂设备状态分布', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: '60%',
      data: Object.keys(statusCount).map(k => ({ name: statusMap[k], value: statusCount[k], itemStyle: { color: statusColors[k] } }))
    }]
  })

  const barChart = echarts.init(document.getElementById('barChart'))
  barChart.setOption({
    title: { text: '各设备累计产量与良率', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: devices.map(d => d.name), axisLabel: { rotate: 30 } },
    yAxis: [{ type: 'value', name: '产量' }, { type: 'value', name: '良率(%)', max: 100 }],
    series: [
      { name: '总产量', type: 'bar', data: devices.map(d => d.total_parts) },
      { name: '良品率', type: 'line', yAxisIndex: 1, data: devices.map(d => d.total_parts > 0 ? ((d.good_parts/d.total_parts)*100).toFixed(1) : 0), itemStyle: { color: '#67C23A' } }
    ]
  })
  window.addEventListener('resize', () => { pieChart.resize(); barChart.resize() })
})
</script>