import axiosInstance  from '../axios'

const api = axiosInstance({
  baseURL: 'http://localhost:3001/api/'
})

export const apiRequest = {
  generateKeys() {
    return api.post("generate")
  },

  importPrivateKey(privateKey: string) {
    return api.post("import", privateKey)
  }
}
