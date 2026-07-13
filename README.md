# MES 数字孪生智慧工厂

一个面向离散制造场景的 MES 演示系统。项目采用 Vue 3 + Three.js 构建工业数字孪生前端，使用 FastAPI + SQLModel 提供设备状态、生产报工和 SQLite 数据服务。

当前版本已将综合看板、数字孪生、设备管理和生产报工统一到同一套响应式工业可视化界面，并支持深色/浅色主题切换。

## 主要功能

- **MES 综合看板**：设备状态分布、产量与良品率、OEE 趋势、故障列表和实时生产事件。
- **3D 数字孪生工厂**：可交互的 CNC、注塑机、机械臂、AGV、输送带、包装线、安防设备和动环传感器。
- **设备状态管理**：运行、待机、故障、维护和离线状态筛选及状态变更记录。
- **生产报工**：设备与工单选择、计划/实际/不良数量录入、良品率计算和当日报工记录。
- **统一主题系统**：公共顶部导航、响应式布局、深色/浅色主题以及 ECharts 和 Three.js 场景联动。
- **真实模型扩展**：优先加载 `public/models/*.glb`，模型不存在时自动使用程序化工业模型。
- **接口安全边界**：来源与 Host 白名单、请求大小限制、写入频率限制、严格输入校验和安全响应头。

## 页面路由

| 路由 | 页面 |
| --- | --- |
| `/dashboard` | MES 综合数据看板 |
| `/factory-3d` | 3D 数字孪生智慧工厂 |
| `/equipment` | 设备状态管理 |
| `/production` | 生产报工管理 |

## 技术栈

### 前端

- Vue 3、Vite、Vue Router、Pinia
- Element Plus
- Three.js、TresJS、`@tresjs/core`、`@tresjs/cientos`
- ECharts、vue-echarts
- Axios

### 后端

- Python 3.12
- FastAPI、Uvicorn
- SQLModel、SQLite
- Pydantic 数据校验

## 项目结构

```text
Simple-MES-System/
├─ backend/
│  ├─ models/              # 设备与生产数据模型
│  ├─ routers/             # 设备管理和生产报工 API
│  ├─ tests/               # 后端校验与安全测试
│  ├─ database.py          # SQLite 连接与会话
│  ├─ settings.py          # 运行环境和安全配置
│  ├─ init_data.py         # 示例数据初始化
│  └─ main.py              # FastAPI 入口
├─ frontend/
│  ├─ public/models/       # 可选 GLB/GLTF 工业模型
│  └─ src/
│     ├─ api/              # 前端 API 封装和 mock 数据
│     ├─ components/       # 公共 UI 与 3D 工厂组件
│     ├─ layouts/          # FactoryShell 公共布局
│     ├─ stores/           # Pinia 工厂状态
│     ├─ types/            # 数字孪生类型定义
│     └─ views/            # 四个业务页面
└─ .github/                # CI 和 Dependabot 配置
```

## 环境要求

- Python 3.12
- Node.js 22.12 或更高版本
- npm 10 或更高版本

## 本地运行

### 1. 启动后端

在项目根目录执行：

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8010
```

后端默认地址：`http://127.0.0.1:8010`

开发环境 API 文档：`http://127.0.0.1:8010/docs`

SQLite 数据库固定创建在项目根目录的 `mes_database.db`，该文件不会提交到 Git。

### 2. 启动前端

打开另一个 PowerShell 窗口：

```powershell
cd frontend
npm install
npm run dev
```

前端默认地址：`http://127.0.0.1:5173`

Vite 会将 `/api` 代理到 `http://127.0.0.1:8010`。

### 3. 仅使用前端 mock 数据

```powershell
cd frontend
$env:VITE_MOCK_API="true"
npm run dev
```

## 环境配置

后端配置示例位于 [`backend/.env.example`](backend/.env.example)，前端配置示例位于 [`frontend/.env.example`](frontend/.env.example)。

后端常用环境变量：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `MES_ENV` | `development` | `development`、`test` 或 `production` |
| `MES_ALLOWED_ORIGINS` | 本机 5173 端口 | 允许访问 API 的浏览器来源 |
| `MES_ALLOWED_HOSTS` | `127.0.0.1,localhost` | 允许的 HTTP Host |
| `MES_WRITE_RATE_LIMIT` | `60` | 单个客户端每分钟写入上限 |
| `MES_MAX_REQUEST_BYTES` | `65536` | API 请求体大小上限 |

## 模型替换

将真实模型放入 `frontend/public/models/` 后，3D 场景会优先尝试加载对应文件；文件缺失或加载失败时自动回退到程序化模型。

```text
cnc.glb
lathe.glb
injection-machine.glb
robot-arm.glb
agv.glb
conveyor.glb
security-camera.glb
sensor.glb
```

## 构建与测试

```powershell
# 后端测试
python -m unittest discover -s backend/tests -v

# 前端生产构建
cd frontend
npm run build

# 前端依赖安全检查（需要 npm registry）
npm audit
```

仓库包含 GitHub Actions CI：每次推送和 Pull Request 都会运行后端测试及前端构建；Dependabot 每周检查 npm 和 Python 依赖更新。

## 安全说明

当前项目定位为本地或内网 MES 演示系统。API 已实现基础请求防护，但尚未提供用户账号、角色权限和审计登录体系。部署到生产环境前应接入企业统一身份认证、HTTPS、反向代理访问控制和正式数据库备份策略，不能直接暴露到公网。

## License

MIT
