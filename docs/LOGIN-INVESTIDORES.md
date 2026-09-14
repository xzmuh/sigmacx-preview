# Login da área do investidor

A área logada (`/investidores/area`, e as versões `/en` e `/es`) usa login
por código de e-mail, a receita do `hub-de-mkt` e do `treinamento-sigmacx`
(`treinamento-sigmacx/docs/login-por-codigo-reutilizavel.md`), com duas
proteções a mais descritas abaixo.

## Como funciona

1. Na página pública `/investidores`, o botão "Área do investidor" abre a
   janela de login.
2. A pessoa digita o e-mail. Se ele estiver na lista autorizada, recebe um
   código de 8 caracteres, válido por 10 minutos.
3. Com o código certo, o servidor grava um cookie de sessão assinado, válido
   por 7 dias, e a pessoa segue para a área.
4. Quem abre a área sem sessão volta para `/investidores?entrar=1`, com a
   janela de login já aberta.

## O que protege o material

O site é público. O material confidencial tem três camadas:

1. **Fora do JavaScript do site.** Nenhuma página importa o conteúdo. A área
   busca tudo em `/api/investidores/conteudo`, uma Pages Function que só
   responde com sessão válida. Abrir o código da página não mostra nada.
2. **Cifrado no repositório.** O remoto `origin` (sigmacx-preview) é
   público. O texto aberto fica em `content/private/`, que está no
   `.gitignore`. O que vai para o git é
   `functions/_content/investidores-area.enc.json`, cifrado com AES-256-GCM.
   A chave `INVESTOR_CONTENT_KEY` existe só no `.dev.vars` e na Cloudflare.
3. **Tokens presos à finalidade.** O desafio do passo 1 e o cookie de sessão
   são assinados com finalidades diferentes (`challenge` e `session`), que
   entram no HMAC. Na receita original, o desafio, que qualquer um recebe só
   digitando um e-mail da lista, também passava como cookie de sessão sem o
   código. Aqui isso não acontece.

| Caminho | Sem sessão |
|---|---|
| `/investidores/area` (e `/en`, `/es`) | redireciona para o login |
| `/api/investidores/*` | 401 |
| qualquer variação de caixa, barra dupla etc. | só a casca vazia do site, sem dado |

A lista de e-mails é conferida em toda requisição: quem sai dela perde o
acesso na hora, mesmo com sessão ativa.

## Arquivos

```
functions/
  _middleware.js                 # portão da área e da API de conteúdo
  _lib/auth.js                   # HMAC com finalidade, código, cookie, lista
  _content/investidores-area.enc.json  # material CIFRADO (vai ao git)
  api/auth/request-code.js       # passo 1: confere a lista e manda o código
  api/auth/verify.js             # passo 2: confere o código e cria a sessão
  api/auth/me.js                 # quem está logado (e-mail e fim da sessão)
  api/auth/logout.js             # sair
  api/investidores/conteudo.js   # decifra e entrega o material, só com sessão
content/private/                 # texto aberto do material (FORA do git)
scripts/cifrar-investidores.mjs  # cifra e decifra o material
public/_routes.json              # limita as Functions a /api/* e à área
.dev.vars.example                # modelo das variáveis
```

## Editar o texto da área

1. Edite `content/private/investidores-area.{pt,en,es}.json`.
2. Rode `npm run cifrar:investidores`.
3. Commite só o `functions/_content/investidores-area.enc.json`.

Em outra máquina, sem `content/private`, recupere o texto com
`npm run cifrar:investidores -- --abrir` (precisa da chave no `.dev.vars`).

**Guarde a `INVESTOR_CONTENT_KEY` num cofre.** Sem ela, o arquivo cifrado não
abre, e o texto aberto só existe em quem tem `content/private`.

**Nunca** importe esses JSON numa página em `src/` nem cite números do
material em comentários: tudo o que vai ao git é público.

## Publicar em um comando

```bash
npx --yes wrangler@3 login   # so na primeira vez: abre o navegador
npm run publicar             # confere, envia segredos, builda, publica e testa
```

- Na primeira vez pergunta o nome do projeto (padrão `sigmacx`) e os e-mails
  com acesso, e guarda tudo em `.producao.vars`, fora do git.
- Cancela sozinho se algum número do material aparecer no build público.
- No fim, testa no ar se a área e a API recusam quem não tem login.
- `npm run publicar -- --emails "a@x.com,b@y.com"` troca a lista e publica.
- `npm run publicar -- --simular` faz tudo menos publicar.

O resto desta seção é o que o script faz por baixo, para quem precisar
configurar à mão.

## Publicar (Cloudflare Pages)

As Functions só rodam na **Cloudflare Pages**. Em outra hospedagem estática
a área não abre, porque o conteúdo depende da API; nada vaza, só não funciona.

1. **Build command** `npm run build`, **Build output directory** `dist`. A
   pasta `functions/` na raiz é compilada sozinha.
2. Em **Settings > Environment variables**, em **Production e Preview**:

| Variável | Para quê |
|---|---|
| `AUTH_SESSION_SECRET` | Assina cookies e desafios. `openssl rand -hex 32`. Diferente do hub e do treinamento |
| `AUTH_ALLOWED_EMAILS` | E-mails autorizados, separados por vírgula, sem espaço |
| `AUTH_MAIL_URL` | URL `/exec` do Apps Script que envia o código |
| `AUTH_MAIL_SECRET` | Segredo compartilhado com o Apps Script |
| `INVESTOR_CONTENT_KEY` | Chave do material cifrado, a mesma do `.dev.vars` |

Sem `AUTH_SESSION_SECRET` ninguém entra; sem `INVESTOR_CONTENT_KEY` a área
não carrega. As duas falhas são fechadas.

Não defina `AUTH_DEV_LOG_CODE` em produção. Mesmo definida, ela só funciona
em pedidos para `localhost`.

### Enviador de e-mail

Hoje é o Web App do Apps Script do treinamento (ação `send_login_code`). O
e-mail sai com o assunto e o texto do treinamento ("Seu passe de acesso ·
Treinamento SigmaCX"). O pedido já manda `app: "SigmaCX Investidores"`,
`lang` e `expiresAt`; para personalizar, leia `d.app` e `d.lang` no
`sendLoginCode` do script e republique.

## Testar local

```bash
cp .dev.vars.example .dev.vars   # e preencher
npm run build                    # o wrangler serve a pasta dist
npm run dev:api                  # terminal 1: Functions na porta 8789
npm run dev                      # terminal 2: site com hot reload
```

- A porta é 8789 porque a 8788 costuma estar com o treinamento.
- Com `AUTH_DEV_LOG_CODE=1`, o código aparece no terminal do wrangler.
- **Não rode `npm run build` com o wrangler aberto**: o build apaga a `dist`
  e o wrangler para de responder. Feche, rode o build e abra de novo.
- Ao parar o wrangler, confira se não sobrou `workerd.exe` segurando a porta.

## Pedido de acesso e aprovação

1. O formulário de `/investidores` manda o pedido para
   `/api/investidores/solicitar`, que guarda no KV `INVESTIDORES` e envia ao
   aprovador (`APPROVER_EMAIL`) um e-mail com "Sim" e "Não".
2. Os botões abrem `/investidores/decisao`, que mostra o pedido e só decide
   depois do clique em confirmar. Antivírus e leitores de e-mail abrem links
   sozinhos; se o link aprovasse direto, alguém seria aprovado sem clique.
3. **Sim:** grava `allow:<email>` no KV (o login aceita na hora), cria o card
   no Trello e manda o e-mail de aprovação. **Não:** só encerra o pedido
   (`SEND_REJECTION_EMAIL=1` manda e-mail de recusa).
4. Cada link vale 14 dias e decide uma vez só.

Contra spam: campo isca invisível, 5 pedidos por IP por hora e 1 pedido por
e-mail a cada 15 minutos.

**E-mails:** saem do Apps Script "SigmaCX Investidores"
(`apps-script/investidores.gs`, gerado por `npm run apps-script` a partir do
`.template.gs`). Prévia dos quatro e-mails em `apps-script/previa/`. O
segredo fica em Propriedades do script > `MAIL_SECRET`, com o valor de
`.apps-script.local.txt`.

**Trello:** `npm run trello:listas -- --key CHAVE --token TOKEN` mostra as
listas; `npm run trello:listas -- --usar ID` grava a escolhida.

**Publicar com o fluxo ligado:**

```bash
npm run publicar -- --aprovador pessoa@empresa.com --apps-script https://script.google.com/macros/s/.../exec
```

O script se recusa a publicar sem os dois: o Apps Script do treinamento não
conhece as ações de aprovação e gravaria os pedidos na planilha dele.

**Tirar o acesso de alguém aprovado pelo formulário:**

```bash
npx --yes wrangler@3 kv key delete --binding INVESTIDORES "allow:email@da.pessoa"
```

**E-mail que não chegou:** cada envio grava o resultado (sem endereço nem
segredo) por 3 dias. `"reply":"sent"` quer dizer que o Google enviou; aí o
problema é filtro da caixa de quem recebe (o Hotmail costuma mandar para o
Lixo eletrônico).

```bash
npx --yes wrangler@3 kv key get --binding INVESTIDORES "diag:mail:request_approval"
```

## Operação

| Preciso... | Como |
|---|---|
| Liberar um investidor | Somar o e-mail em `AUTH_ALLOWED_EMAILS` e fazer redeploy |
| Tirar o acesso | Remover o e-mail e fazer redeploy. A sessão cai na hora |
| Derrubar todas as sessões | Trocar `AUTH_SESSION_SECRET` |
| Trocar a chave do material | Nova chave no `.dev.vars`, `npm run cifrar:investidores`, commit e a mesma chave na Cloudflare |

## Pendências conhecidas

- **Sem limite de tentativas** no `verify`. Com 8 caracteres e 10 minutos a
  força bruta não é viável, mas uma regra de Rate Limiting da Cloudflare em
  `/api/auth/*` fecha de vez.
- **O desafio vale várias vezes** dentro dos 10 minutos. Só serve para quem
  tem o código.
- **A resposta do passo 1 revela** se um e-mail está na lista.
- **Sem log de acesso.** A faixa diz "acesso registrado", mas ainda não há
  registro de quem abriu e quando.
- **"Acesso até"** mostra o fim da sessão de 7 dias.
- **Cota do Gmail**, por volta de 100 e-mails por dia, no Apps Script.
