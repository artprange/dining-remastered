import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** Fail before publishing a hand-edited catalog, with the exact field to fix. */
export function validateCatalog(data) {
  const fail = (path, message) => { throw new Error(`${path}: ${message}`) }
  const object = (value, path, fields) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'esperado um objeto')
    for (const key of Object.keys(value)) if (!fields.includes(key)) fail(`${path}.${key}`, 'campo desconhecido')
  }
  const string = (value, path) => {
    if (typeof value !== 'string' || !value.trim()) fail(path, 'esperado texto não vazio')
  }
  if (!Array.isArray(data)) fail('catálogo', 'esperada uma lista []')
  const ids = new Set()
  data.forEach((item, i) => {
    const path = `restaurantes[${i}]`
    object(item, path, ['instagram', 'id', 'name', 'cuisines', 'tags', 'status', 'wishlistPriority', 'address', 'neighborhood', 'city', 'notes', 'wouldReturn', 'visits'])
    string(item.id, `${path}.id`)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) fail(`${path}.id`, 'use letras minúsculas, números e hífens')
    if (ids.has(item.id)) fail(`${path}.id`, 'identificador duplicado')
    ids.add(item.id)
    string(item.name, `${path}.name`)
    if (item.instagram != null) {
      let url
      try { url = new URL(item.instagram) } catch { fail(`${path}.instagram`, 'URL inválida') }
      if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname) || url.username || url.password) {
        fail(`${path}.instagram`, 'use um link HTTPS do Instagram')
      }
    }

    for (const field of ['cuisines', 'tags']) {
      if (item[field] === undefined) continue
      if (!Array.isArray(item[field])) fail(`${path}.${field}`, 'esperada uma lista de textos')
      item[field].forEach((v, j) => string(v, `${path}.${field}[${j}]`))
      if (new Set(item[field]).size !== item[field].length) fail(`${path}.${field}`, 'valores duplicados')
    }
    const enums = { status: ['ACTIVE', 'ARCHIVED'], wishlistPriority: ['LOW', 'NORMAL', 'HIGH'] }
    for (const [field, values] of Object.entries(enums)) {
      if (item[field] !== undefined && !values.includes(item[field])) fail(`${path}.${field}`, 'valor inválido')
    }
    for (const field of ['address', 'neighborhood', 'city', 'notes']) {
      if (item[field] != null && typeof item[field] !== 'string') fail(`${path}.${field}`, 'esperado texto ou null')
    }
    if (item.wouldReturn != null && typeof item.wouldReturn !== 'boolean') fail(`${path}.wouldReturn`, 'use true, false ou null')
    if (item.visits !== undefined && !Array.isArray(item.visits)) fail(`${path}.visits`, 'esperada uma lista')
    for (const [j, visit] of (item.visits ?? []).entries()) {
      const vp = `${path}.visits[${j}]`
      object(visit, vp, ['date', 'rating', 'notes'])
      if (typeof visit.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(visit.date)) fail(`${vp}.date`, 'use AAAA-MM-DD')
      const date = new Date(`${visit.date}T12:00:00Z`)
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== visit.date) fail(`${vp}.date`, 'data inexistente')
      if (!Number.isInteger(visit.rating) || visit.rating < 1 || visit.rating > 5) fail(`${vp}.rating`, 'use uma nota inteira de 1 a 5')
      if (visit.notes != null && typeof visit.notes !== 'string') fail(`${vp}.notes`, 'esperado texto ou null')
    }
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2] ?? 'src/data/restaurants.json'
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'))
    validateCatalog(data)
    console.log(`Catálogo válido: ${data.length} restaurante(s).`)
  } catch (error) {
    console.error(`Catálogo inválido — ${error.message}`)
    process.exitCode = 1
  }
}
