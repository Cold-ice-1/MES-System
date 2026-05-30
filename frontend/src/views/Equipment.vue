<template>
  <div>
    <h2>⚙️ 设备状态管理 (ISA-95标准)</h2>
    <el-row :gutter="20">
      <el-col :span="6" v-for="d in devices" :key="d.id" style="margin-bottom: 20px;">
        <el-card shadow="hover" @click="openDialog(d)">
          <template #header>
            <div style="display:flex;justify-content:space-between;">
              <span>{{ d.name }}</span>
              <el-tag :type="getStatusType(d.status)">{{ statusMap[d.status] }}</el-tag>
            </div>
          </template>
          <p>运行: {{ d.total_run_time_minutes }} 分钟</p>
          <p>良品率: {{ d.total_parts > 0 ? ((d.good_parts/d.total_parts)*100).toFixed(1) + '%' : 'N/A' }}</p>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="`操作: ${current?.name}`" width="400px">
      <el-form label-width="80px">
        <el-form-item label="目标状态">
          <el-radio-group v-model="newStatus">
            <el-radio-button label="Running">运行</el-radio-button>
            <el-radio-button label="Idle">待机</el-radio-button>
            <el-radio-button label="Fault">故障</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因码">
          <el-select v-model="reason" placeholder="必选" style="width:100%">
            <el-option label="P01-正常开机" value="P01-正常开机"/>
            <el-option label="F01-缺料停机" value="F01-缺料停机"/>
            <el-option label="F02-设备报警" value="F02-设备报警"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitChange">确认变更</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDevices, changeState } from '../api'
import { statusMap } from '../utils/config'
import { ElMessage } from 'element-plus'

const devices = ref([])
const dialogVisible = ref(false)
const current = ref(null)
const newStatus = ref('Running')
const reason = ref('')

const loadData = async () => { devices.value = (await getDevices()).data }
const openDialog = (d) => { current.value = d; newStatus.value = d.status; reason.value = ''; dialogVisible.value = true }
const submitChange = async () => {
  if(!reason.value) return ElMessage.error('MES拦截：必须选择原因码')
  await changeState(current.value.id, { new_status: newStatus.value, reason_code: reason.value })
  ElMessage.success('状态变更成功')
  dialogVisible.value = false
  loadData()
}
const getStatusType = (s) => ({Running:'success', Idle:'warning', Fault:'danger', Maintenance:'info', Offline:'info'}[s])
onMounted(loadData)
</script>