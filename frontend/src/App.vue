<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background: #304156;">
      <div style="color: white; text-align: center; padding: 20px; font-weight: bold; font-size: 18px;">MES 控制台</div>
      <el-menu background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" router>
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon><span>📊 综合看板</span>
        </el-menu-item>
        <el-menu-item index="/equipment">
          <el-icon><Setting /></el-icon><span>⚙️ 设备管理</span>
        </el-menu-item>
        <el-menu-item index="/production">
          <el-icon><Box /></el-icon><span>📦 生产报工</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main style="background: #f0f2f5; padding: 20px;">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>