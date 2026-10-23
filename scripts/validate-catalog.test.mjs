import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateCatalog } from './validate-catalog.mjs'

test('o exemplo documentado e o catálogo real são válidos', () => {
  for (const file of ['examples/restaurants.json', 'src/data/restaurants.json']) {
    assert.doesNotThrow(() => validateCatalog(JSON.parse(readFileSync(file, 'utf8'))))
  }
})
test('recusa erros comuns de edição com indicação do campo', () => {
  const base = { id: 'cafe', name: 'Café' }
  for (const [extra, field] of [
    [{ status: 'ABERTO' }, 'status'], [{ cuisines: 'Italiana' }, 'cuisines'],
    [{ wouldReturn: 'true' }, 'wouldReturn'], [{ nome: 'Outro' }, 'nome'],
    [{ visits: [{ date: '2026-02-30', rating: 4 }] }, 'date'],
    [{ visits: [{ date: '2026-10-20', rating: 6 }] }, 'rating'],
  ]) assert.throws(() => validateCatalog([{ ...base, ...extra }]), new RegExp(field))
  assert.throws(() => validateCatalog([base, base]), /duplicado/)
})
