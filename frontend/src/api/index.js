import axios from 'axios'
const api = axios.create({ baseURL: '/api' }) 

export const getDevices = () => api.get('/equipment/')
export const changeState = (id, data) => api.post(`/equipment/${id}/state-change`, data)
export const getEvents = (id) => api.get(`/equipment/${id}/events`)
export const reportProduction = (data) => api.post('/production/report', data)
export const getRecords = () => api.get('/production/records')