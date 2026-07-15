/**
 * Backend API client - Video Text App
 * Base URL: VITE_API_URL (prefer 127.0.0.1 over localhost on Windows)
 */
// Dev: use proxy ('' = same origin). Prod: set VITE_API_URL to backend URL
const RAW_BASE = import.meta.env.VITE_API_URL || ''
// Windows often resolves "localhost" to ::1 while Node listens on IPv4 → intermittent NetworkError
const BASE = String(RAW_BASE).replace(/localhost/gi, '127.0.0.1').replace(/\/$/, '')

const getToken = () => localStorage.getItem('videoTextToken')
const setToken = (t) => { if (t) localStorage.setItem('videoTextToken', t); else localStorage.removeItem('videoTextToken') }

const headers = (json = true) => {
  const h = {}
  if (json) h['Content-Type'] = 'application/json'
  const t = getToken()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function isNetworkFetchError(e) {
  const name = e?.name || ''
  const msg = String(e?.message || e || '')
  return (
    name === 'TypeError' ||
    name === 'AbortError' ||
    /NetworkError|Failed to fetch|network|fetch failed|Load failed|aborted|timed out|timeout/i.test(msg)
  )
}

function friendlyNetworkError(e) {
  const msg = String(e?.message || e || '')
  if (/AbortError|aborted|timed out|timeout/i.test(e?.name || '') || /timed out|timeout/i.test(msg)) {
    return 'TTS preview timed out. Backend may be busy — try again in a moment.'
  }
  const where = BASE || 'the Vite /api proxy'
  return `Cannot reach backend (${where}). Start Reel-Maker-Backend (port 3002) and retry. Original: ${msg}`
}

/**
 * Fetch with timeout + retries for flaky Windows localhost / brief backend restarts.
 */
async function fetchWithRetry(url, options = {}, { timeoutMs = 45000, retries = 2 } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const r = await fetch(url, { ...options, signal: ctrl.signal })
      clearTimeout(timer)
      return r
    } catch (e) {
      clearTimeout(timer)
      lastErr = e
      if (!isNetworkFetchError(e) || attempt === retries) {
        throw new Error(friendlyNetworkError(e))
      }
      await sleep(350 * (attempt + 1))
    }
  }
  throw new Error(friendlyNetworkError(lastErr))
}

const res = async (r) => {
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || err.message || r.statusText)
  }
  return r.json().catch(() => ({}))
}

// ----- Auth -----
export const api = {
  async login(email, password) {
    const d = await res(await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ email, password })
    }))
    if (d.token) { setToken(d.token); if (d.user) localStorage.setItem('videoTextUser', JSON.stringify(d.user)) }
    return d
  },
  async signup(email, password, name = '') {
    const d = await res(await fetch(`${BASE}/api/auth/signup`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ email, password, name })
    }))
    if (d.token) { setToken(d.token); if (d.user) localStorage.setItem('videoTextUser', JSON.stringify(d.user)) }
    return d
  },
  logout() { setToken(null); localStorage.removeItem('videoTextUser') },
  getUser() {
    try { return JSON.parse(localStorage.getItem('videoTextUser') || 'null') } catch { return null }
  },
  isLoggedIn() { return !!getToken() },

  // ----- Capabilities -----
  async getCapabilities() {
    try {
      const r = await fetch(`${BASE}/api/capabilities`, { headers: headers(false) })
      if (!r.ok) return { serverless: true, features: {} }
      return r.json()
    } catch { return { serverless: true, features: {} } }
  },

  // ----- Projects -----
  async getProjects() {
    return res(await fetch(`${BASE}/api/projects`, { headers: headers(false) }))
  },
  async getProject(id) {
    return res(await fetch(`${BASE}/api/projects/${id}`, { headers: headers(false) }))
  },
  async saveProject(name, config, thumbnail) {
    return res(await fetch(`${BASE}/api/projects`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ name, config, thumbnail })
    }))
  },
  async updateProject(id, data) {
    return res(await fetch(`${BASE}/api/projects/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data)
    }))
  },
  async deleteProject(id) {
    return res(await fetch(`${BASE}/api/projects/${id}`, { method: 'DELETE', headers: headers() }))
  },

  // ----- User Presets -----
  async getUserPresets() {
    return res(await fetch(`${BASE}/api/user-presets`, { headers: headers() }))
  },
  async saveUserPreset(name, settings) {
    return res(await fetch(`${BASE}/api/user-presets`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ name, settings })
    }))
  },
  async updateUserPreset(id, data) {
    return res(await fetch(`${BASE}/api/user-presets/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data)
    }))
  },
  async deleteUserPreset(id) {
    return res(await fetch(`${BASE}/api/user-presets/${id}`, { method: 'DELETE', headers: headers() }))
  },

  // ----- Excel parse -----
  async parseExcel(file) {
    const fd = new FormData()
    fd.append('file', file)
    return res(await fetch(`${BASE}/api/excel/parse`, {
      method: 'POST', headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' }, body: fd
    }))
  },

  // ----- Analytics -----
  async track(action, payload = {}) {
    try {
      await fetch(`${BASE}/api/analytics`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ action, payload })
      })
    } catch (_) {}
  },

  // ----- Export history -----
  async processVideoOnServer(formData) {
    const r = await fetch(`${BASE}/api/video/process`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      body: formData,
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.error || r.statusText)
    }
    return r.json()
  },
  async processSlideshowOnServer(formData) {
    const r = await fetch(`${BASE}/api/video/slideshow`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      body: formData,
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.error || r.statusText)
    }
    return r.json()
  },
  async getVideoJobStatus(jobId) {
    return res(await fetch(`${BASE}/api/video/job/${jobId}`, { headers: headers(false) }))
  },
  async cancelVideoJob(jobId) {
    return res(await fetch(`${BASE}/api/video/job/${jobId}/cancel`, {
      method: 'POST',
      headers: headers(),
    }))
  },
  async logExport(projectId, format = 'mp4', duration = 0) {
    try {
      await fetch(`${BASE}/api/exports`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ projectId, format, duration })
      })
    } catch (_) {}
  },

  async extractAudioOnServer(formData) {
    const r = await fetch(`${BASE}/api/audio/extract`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      body: formData,
    })
    if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || r.statusText) }
    return r.json()
  },

  async extractThumbnailsOnServer(formData) {
    const r = await fetch(`${BASE}/api/thumbnails/extract`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      body: formData,
    })
    if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || r.statusText) }
    return r.json()
  },

  async mergeVideosOnServer(formData) {
    const r = await fetch(`${BASE}/api/video/merge`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      body: formData,
    })
    if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || r.statusText) }
    return r.json()
  },

  async fetchTTSVoices() {
    return res(await fetch(`${BASE}/api/tts/generate/voices`, { headers: headers() }))
  },

  /** Real Edge Neural sample (audio blob) — not browser speechSynthesis */
  async previewTTSSample({ text, speaker, rate, pitch, volume, quality }) {
    const r = await fetchWithRetry(
      `${BASE}/api/tts/generate/preview`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ text, speaker, rate, pitch, volume, quality }),
      },
      { timeoutMs: 25000, retries: 0 }
    )
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.error || err.message || r.statusText)
    }
    return r.blob()
  },

  async fetchAdvancedTTSVoices() {
    return res(await fetchWithRetry(`${BASE}/api/tts/generate/advanced/voices`, { headers: headers() }, { timeoutMs: 15000, retries: 1 }))
  },

  async fetchAdvancedTTSStatus() {
    return res(await fetchWithRetry(`${BASE}/api/tts/generate/advanced/status`, { headers: headers() }, { timeoutMs: 10000, retries: 1 }))
  },

  async previewAdvancedTTS(payload) {
    const r = await fetchWithRetry(
      `${BASE}/api/tts/generate/advanced/preview`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      },
      { timeoutMs: 45000, retries: 0 }
    )
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.error || err.message || r.statusText)
    }
    return r.blob()
  },

  async generateAdvancedTTSOnServer(payload) {
    return res(await fetch(`${BASE}/api/tts/generate/advanced`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    }))
  },

  async uploadAdvancedClone(file) {
    const fd = new FormData()
    fd.append('audio', file)
    const h = {}
    const t = getToken()
    if (t) h['Authorization'] = `Bearer ${t}`
    return res(await fetch(`${BASE}/api/tts/generate/advanced/clone`, {
      method: 'POST',
      headers: h,
      body: fd,
    }))
  },

  async generateTTSOnServer({ texts, speaker, rate, pitch, volume, quality, excelData, column, mode, rows }) {
    return res(await fetch(`${BASE}/api/tts/generate`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ texts, speaker, rate, pitch, volume, quality, excelData, column, mode, rows })
    }))
  },

  async uploadCaptionBatch(audioFiles, videoFiles = [], { whisperModel, language = 'auto' } = {}) {
    const fd = new FormData()
    audioFiles.forEach((f) => fd.append('audios', f))
    videoFiles.forEach((f) => fd.append('videos', f))
    // Never force "base" — backend .env WHISPER_MODEL (small/medium) is much better for HI/PA.
    if (whisperModel) fd.append('whisperModel', whisperModel)
    fd.append('language', language)
    const r = await fetch(`${BASE}/api/captions/batch`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      body: fd,
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.error || r.statusText)
    }
    return r.json()
  },
  async getCaptionJob(jobId, { summary = false } = {}) {
    const qs = summary ? '?summary=1' : ''
    return res(await fetch(`${BASE}/api/captions/job/${jobId}${qs}`, { headers: headers(false) }))
  },
  async updateCaptionTrack(trackId, segments) {
    return res(await fetch(`${BASE}/api/captions/tracks/${trackId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ segments }),
    }))
  },
  async getBackgroundEffectsCatalog() {
    return res(await fetch(`${BASE}/api/background-effects/catalog`, { headers: headers(false) }))
  },

  async generateImagesOnServer(formData) {
    const r = await fetch(`${BASE}/api/images/generate`, {
      method: 'POST',
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      body: formData,
    })
    if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || r.statusText) }
    return r.json()
  },

  // Admin
  async adminGetUsers() {
    return res(await fetch(`${BASE}/api/admin/users`, { headers: headers(false) }))
  },
  async adminCreateUser(email, password, name, role) {
    return res(await fetch(`${BASE}/api/admin/users`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ email, password, name, role })
    }))
  },
  async adminUpdateUser(id, data) {
    return res(await fetch(`${BASE}/api/admin/users/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data)
    }))
  },
  async adminDeleteUser(id) {
    return res(await fetch(`${BASE}/api/admin/users/${id}`, { method: 'DELETE', headers: headers() }))
  },
  async adminGetStats() {
    return res(await fetch(`${BASE}/api/admin/stats`, { headers: headers(false) }))
  },
}

export default api
