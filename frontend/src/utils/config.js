export const statusMap = {
  Running: '运行中',
  Idle: '待机',
  Fault: '故障',
  Maintenance: '维护中',
  Offline: '离线',
}

export const statusColors = {
  Running: '#26f5a6',
  Idle: '#f7b731',
  Fault: '#ff4d6d',
  Maintenance: '#8b9bb4',
  Offline: '#7a8b9b',
}

export const statusTagTypes = {
  Running: 'success',
  Idle: 'warning',
  Fault: 'danger',
  Maintenance: 'info',
  Offline: 'info',
}

export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
