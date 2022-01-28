import axiosInstance  from '../axios'

const api = axiosInstance({
  baseURL: 'http://localhost:3001/api/'
})

export const apiRequest = {
  addresses: {
    generate() {
      return api.post("generate")
    },
    import(privateKey: string) {
      return api.post("import", privateKey)
    },
    remove(pubKey: string) {
      return api.post("address/remove", { public_key: pubKey })
    },
    get() {
      return api.get("address")
    }
  }
}
