import axiosInstance  from '../axios'

const api = axiosInstance({
  baseURL: 'http://localhost:3001/api/'
})

export const apiRequest = {
  addresses: {
    generate() {
      return api.post("generate")
    },
    import(privateKeys: string[]) {
      return api.post("import", privateKeys)
    },
    remove(pubKey: string) {
      return api.post("address/remove", { publicKey: pubKey })
    },
    get() {
      return api.get("address")
    }
  },
  transactions: {
    get() {
      return api.get("transactions")
    },
    getForAddress(pubKey: string) {
      return api.get("transactions?address=" + pubKey)
    },
    create(sender: string, receiver: string, amount: number) {
      return api.post('transactions?address=' + sender, {
        to: receiver, amount
      })
    }
  }
}
