export const statusMap = {
    Running: '运行中', Idle: '待机', Fault: '故障', Maintenance: '维护中', Offline: '离线'
}
export const statusColors = {
    Running: '#67C23A', Idle: '#E6A23C', Fault: '#F56C6C', Maintenance: '#909399', Offline: '#C0C4CC'
}
export const formatTime = (timeStr) => {
    if(!timeStr) return ''
    const date = new Date(timeStr)
    date.setHours(date.getHours() + 8) 
    return date.toLocaleString('zh-CN')
}