const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = {
    async get(endpoint: string, params?: Record<string, any>) {
        const url = new URL(`${API_URL}${endpoint}`)
        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        }
        const res = await fetch(url.toString())
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async post(endpoint: string, body: any) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    }
}
