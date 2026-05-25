import axios, { AxiosInstance } from '@ohos/axios'
import { Constants } from './Constants'

const api: AxiosInstance = axios.create({
  baseURL: Constants.BASE_URL,
  timeout: 30000,
})

export default api
