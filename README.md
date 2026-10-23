# Dining Remastered

Catálogo pessoal de restaurantes para consultar pelo celular e decidir onde comer.
React + Vite, publicado como site estático. Sem API, banco, localStorage ou cadastro
pelo navegador: a fonte de verdade é **`src/data/restaurants.json`**.

## Desenvolvimento

Node 22.12+ (ou uma versão mais recente compatível).

```bash
npm ci
npm run dev
```

Não precisa de `.env` nem do backend. O Vite escuta na rede local; para consultar
pelo celular na mesma rede, abra o endereço de rede mostrado no terminal.

## Cadastrar e atualizar lugares

Edite `src/data/restaurants.json`. O catálogo começa vazio de propósito: os dados
da antiga demo não são os seus restaurantes. O arquivo é uma lista de objetos:

```json
[
  {
    "id": "meu-restaurante",
    "name": "Meu restaurante",
    "cuisines": ["Italiana"],
    "tags": ["Ao ar livre"],
    "city": "São Paulo",
    "neighborhood": "Centro",
    "wishlistPriority": "HIGH",
    "wouldReturn": true,
    "visits": [
      { "date": "2026-10-20", "rating": 4, "notes": "Gostamos da massa." }
    ]
  }
]
```

Há um exemplo completo, fictício e não publicado em `examples/restaurants.json`.
Somente `id` e `name` são obrigatórios. Use IDs únicos com letras minúsculas,
números e hífens; mantenha-os estáveis para preservar links.

| Campo | Valores/padrão |
| --- | --- |
| `cuisines`, `tags` | Listas de nomes; padrão `[]`. Use o mesmo nome para a mesma categoria. |
| `status` | `ACTIVE` (padrão) ou `ARCHIVED`. Arquivados não entram na lista/sugestões normais. |
| `wishlistPriority` | `LOW`, `NORMAL` (padrão), `HIGH`. |
| `address`, `neighborhood`, `city`, `notes` | Texto opcional. |
| `wouldReturn` | `true`, `false` ou `null` (ainda não decidido). |
| `visits` | Lista opcional com `date` em `AAAA-MM-DD`, nota inteira `rating` de 1 a 5 e `notes` opcional. |

O app calcula média, quantidade de visitas e última visita. As sugestões combinam
prioridade de desejo, lugares ainda não visitados, vontade de voltar, notas e
mais de 60 dias sem visitar. Sorteio usa os mesmos filtros.

Após editar:

```bash
npm run validate:catalog
npm test
npm run build
npm run preview
```

A validação também roda no build e rejeita IDs duplicados, datas inexistentes,
notas fora da faixa, enums inválidos e campos desconhecidos. No desenvolvimento,
rode a validação após editar. Uma nova publicação é necessária para atualizar o
catálogo remoto; no celular, recarregue a página para obter a nova versão.

## Publicar na Cloudflare

`wrangler.jsonc` prepara Workers Static Assets em `dining.prange.dev`, com fallback
de SPA para abrir/recarregar páginas de detalhe. Sem Containers, D1 ou backend.
Nenhum recurso foi criado na conta por esta adaptação.

**Antes do primeiro deploy com dados pessoais**, configure Cloudflare Access:

1. Crie uma aplicação self-hosted para **todo** `dining.prange.dev`, inclusive assets.
2. Habilite login por código de e-mail e uma política Allow com apenas os dois e-mails autorizados.
3. Mantenha `workers_dev: false` e `preview_urls: false` para não oferecer URLs alternativas públicas.
4. Confira que o repositório também é privado se o catálogo contiver informações privadas.

O login é configurado no Access, não existe senha embutida no site. O JSON fica
incluído nos arquivos enviados ao navegador: esconder botões ou URLs não protege
o catálogo. A política precisa proteger também os arquivos JavaScript.

Depois de configurar o acesso e conferir a conta/domínio:

```bash
npx wrangler login
npm run deploy
```

Teste em janela anônima que a página **e os assets** exigem login; valide os dois
usuários autorizados, a recusa de outro e-mail, recarregamento de detalhes e acesso
pelo celular em rede móvel. Publicação e configuração do Access ainda estão pendentes.

Referências: [SPA com Static Assets](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/),
[Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/common-policies/).
