<template>
  <div>
    <h2>📦 生产报工管理</h2>
    <el-card style="margin-bottom: 20px;">
      <el-form :inline="true" :model="form">
        <el-form-item label="选择设备">
          <el-select v-model="form.equipment_id" placeholder="请选择" @change="onDeviceChange">
            <el-option v-for="d in devices" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单号"><el-input v-model="form.work_order" placeholder="WO-01" /></el-form-item>
        <el-form-item label="计划"><el-input-number v-model="form.target_qty" :min="1" /></el-form-item>
        <el-form-item label="实际"><el-input-number v-model="form.actual_qty" :min="0" /></el-form-item>
        <el-form-item label="不良"><el-input-number v-model="form.defect_qty" :min="0" /></el-form-item>
        <el-form-item><el-button type="primary" @click="submitReport">提交报工</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-table :data="records" border>
      <el-table-column prop="work_order" label="工单号" />
      <el-table-column prop="equipment_name" label="设备" />
      <el-table-column prop="actual_qty" label="实际产量" />
      <el-table-column prop="defect_qty" label="不良品" />
      <el-table-column label="良率">
        <template #default="scope">
          <el-tag :type="scope.row.actual_qty > 0 && (scope.row.actual_qty - scope.row.defect_qty)/scope.row.actual_qty > 0.95 ? 'success' : 'danger'">
            {{ scope.row.actual_qty > 0 ? (((scope.row.actual_qty - scope.row.defect_qty)/scope.row.actual_qty)*100).toFixed(1) + '%' : '0%' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="record_time" label="报工时间" :formatter="(row) => formatTime(row.record_time)" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDevices, reportProduction, getRecords } from '../api'
import { formatTime } from '../utils/config'
import { ElMessage } from 'element-plus'

const devices = ref([])
const records = ref([])
const form = ref({ equipment_id: '', work_order: '', target_qty: 100, actual_qty: 100, defect_qty: 0 })

const loadData = async () => { devices.value = (await getDevices()).data; records.value = (await getRecords()).data }
const onDeviceChange = (id) => { const d = devices.value.find(x => x.id === id); if(d) form.value.equipment_name = d.name }
const submitReport = async () => {
  if(!form.value.equipment_id || !form.value.work_order) return ElMessage.warning('请完善信息')
  await reportProduction(form.value)
  ElMessage.success('报工成功')
  loadData()
}
onMounted(loadData)
</script>