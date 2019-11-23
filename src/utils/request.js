import axios from 'axios'
import {Message} from 'element-ui'
// create an axios instance
const service = axios.create({
  baseURL: 'http://localhost:9999/api/', // api 的 base_url
  timeout: 20000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const status = response.status
    if (status >= 200&&status<300) {
      return response.data;
    } else {
      Message({
        message: response.data.reason,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject('error')
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
