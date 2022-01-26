import axiosInstance  from '../axios'

const api = axiosInstance({
  baseURL: 'http://localhost:3001/api/'
})

export const apiRequest = {
  generateKeys() {
    return api.get("generate")
  },

  importPrivateKey(privateKey: string) {
    return api.post("import", privateKey)
  }
}
