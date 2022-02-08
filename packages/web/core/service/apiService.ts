import axiosInstance from '../axios'

const nodePort = new URLSearchParams(window.location.search).get('node') ?? 3001
const api = axiosInstance({
  baseURL: 'http://localhost:' + nodePort + '/api/'
})

export const apiRequest = {
  addresses: {
    generate: () =>
      api.post('generate'),
    import: (privateKeys: string[]) =>
      api.post('import', privateKeys),
    remove: (pubKey: string) =>
      api.post('address/remove', { publicKey: pubKey }),
    get: () =>
      api.get('address')
  },
  transactions: {
    get: (publicKey: string) =>
      api.get('transactions', { params: { publicKey } }),
    create: (sender: string, receiver: string, amount: number) =>
      api.post('transactions', { receiver, amount }, { params: { publicKey: sender } })
  },
  balance: {
    get: (publicKey: string) =>
      api.get('balance', { params: { publicKey } })
  },
  settings: {
    mirror: (enabled: boolean) => api.post('mirror', { enabled })
  }
}
