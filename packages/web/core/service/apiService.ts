import axiosInstance  from '../axios'

const api = axiosInstance({
  baseUrl: 'localhost:3001/api/'
})

export const apiRequest = {
  generateKeys() {
    return api.get("generate")
  },
}
