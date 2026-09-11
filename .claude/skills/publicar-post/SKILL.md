---
name: publicar-post
description: Publica um artigo novo no blog da SigmaCX a partir de um texto solto e, se houver, uma foto largados em `_novos-posts/`. Use quando o usuário disser "publicar post", "subir artigo", "novo post do blog", ou rodar /publicar-post. Escreve os três arquivos de idioma em content/blog/<slug>/, converte a imagem, atualiza content/blog/index.json, roda o build e esvazia a pasta.
---

# Publicar um artigo no blog

A entrada é solta e a saída é rígida. **Nunca dá para saber como o texto vai
chegar** — pode vir com título na primeira linha ou não, com subtítulos ou num
bloco só, colado do Word com aspas curvas e linhas quebradas no meio da frase.
Aceite qualquer forma. O que sai de `content/blog/` tem que ser sempre igual ao
que já está lá, porque quem lê esses arquivos é `src/lib/blog.ts`, e ele espera
uma forma exata.

⚠️ **Aqui o artigo é JSON, não Markdown.** Se você já publicou no projeto do
Dialogi, aquele fluxo grava `.md`; este grava blocos em `.json`. Não misture.

---

## 1. Ler a pasta

```
ls _novos-posts/
```

Espere um `.txt` ou `.md` e, opcionalmente, uma imagem (`.jpg`, `.jpeg`, `.png`,
`.webp`). Ignore `LEIA-ME.md` — ele é a instrução para o usuário, não conteúdo.

- **Nenhum arquivo de texto:** pare e diga que a pasta está vazia. Não invente
  artigo.
- **Mais de um texto:** pergunte qual publicar. Não publique os dois de uma vez
  sem perguntar.

Leia o texto inteiro antes de decidir qualquer coisa.

---

## 2. Extrair do texto

**Título.** Se houver uma linha `Título:` ou `Titulo:`, é ela. Senão, a primeira
linha não vazia do arquivo. Tire dela qualquer marcação (`#`, `**`).

**Autor.** Nesta ordem:

1. Linha `Autor:` explícita.
2. Assinatura no fim do texto (um nome solto nas últimas linhas).
3. **Pergunte.** Nunca chute e nunca use "Equipe SigmaCX" como saída.

O nome tem que existir em `content/authors.json`. Se não existir, avise e
pergunte se deve acrescentar — junto com o cargo nos três idiomas e a foto. Não
acrescente sozinho.

**Corpo.** Todo o resto, sem a linha de título nem a assinatura.

---

## 3. Formatar como os outros artigos

Abra um artigo existente e siga a forma dele:

```
content/blog/qual-a-diferenca-entre-chatbots-e-agentes-de-ia/pt.json
```

Cada arquivo de idioma é um objeto:

```json
{
  "title": "…",
  "lang": "pt",
  "date": "2026-09-08T12:00:00+00:00",
  "description": "…",
  "cover": "/media/blog/<slug>.webp",
  "blocks": [ … ]
}
```

Só existem quatro tipos de bloco, e `src/lib/blog.ts` não entende mais nenhum:

| bloco | forma |
|---|---|
| subtítulo | `{ "t": "h", "lvl": 2, "text": "…" }` |
| parágrafo | `{ "t": "html", "html": "<p>…</p>" }` |
| imagem | `{ "t": "img", "src": "/media/blog/….webp", "alt": "" }` |
| vídeo | `{ "t": "video", "src": "…" }` |

**Regras do corpo, tiradas dos artigos que já estão publicados:**

- Um parágrafo por bloco `html`. Não junte a matéria inteira num bloco só.
- Negrito e itálico vão dentro do HTML (`<strong>`, `<em>`). Nada de `**`.
- Aspas curvas, travessões e reticências do original ficam como estão.
- `lvl` é sempre `2`. Os artigos existentes não usam h3.
- Nada de `<h1>` no corpo: o título da página já é o `title`.

### A virada de assunto vira subtítulo

Texto colado costuma vir sem subtítulo nenhum. Quando o assunto virar, crie um
bloco `h`. É o que dá ritmo à leitura e o que a lateral do artigo usa. Um
subtítulo a cada 3–5 parágrafos é o ritmo dos artigos atuais.

### O fim do artigo tem uma ordem fixa

Depois do último parágrafo do corpo, sempre nesta sequência:

```json
{ "t": "img",  "src": "<foto do autor>", "alt": "" },
{ "t": "html", "html": "<p>Autor</p>" },
{ "t": "html", "html": "<p>Murillo Melo</p>" },
{ "t": "html", "html": "<p>CEO</p>" },
{ "t": "h",    "lvl": 2, "text": "FAQ" },
{ "t": "html", "html": "<p><strong>1.  Pergunta?</strong></p><p>Resposta.</p>" }
```

⚠️ **Essa sequência de quatro blocos é como `readArticle()` reconhece o autor**
(`src/lib/blog.ts`): imagem, depois um parágrafo com exatamente `Autor`, depois
o nome, depois o cargo. Trocar a ordem ou o rótulo faz o cartão de autor sumir
do site sem erro nenhum no build. Em inglês o rótulo é `Author`; em espanhol,
`Autor`.

O FAQ vem depois do autor, com 3 a 5 perguntas. Cada par pergunta/resposta é um
bloco `html` só, com a pergunta em `<strong>` numerada.

---

## 4. Decidir

**Slug.** Do título em português: minúsculas, sem acento, hífens no lugar dos
espaços, sem palavra de ligação solta no fim. Confira que não existe:

```
ls content/blog/
```

**Categoria.** Uma das três de `content/authors.json` — `agentes-de-ia`,
`dados-e-insights`, `produtos`. **Não crie categoria nova**; ela teria de ser
declarada em `CATEGORIES` no `src/lib/blog.ts` e não apareceria no filtro.

**Data.** Agora, em ISO com fuso: `2026-09-08T12:00:00+00:00`.

**`description`.** Uma frase, até ~190 caracteres — é o que aparece no card da
listagem. Se ficar vazia, `excerptOf()` cai no primeiro parágrafo, o que quase
sempre fica pior.

**Tradução.** Escreva `en.json` e `es.json` traduzindo de verdade, não só o
título. Mesmos blocos, mesma ordem, mesmas imagens. O cargo do autor muda de
idioma (está em `authors.json`); o nome, não.

---

## 5. Converter a foto

Se veio imagem na pasta:

```
node .claude/skills/publicar-post/preparar-imagem.mjs "_novos-posts/<arquivo>" "<slug>"
```

Ele imprime o caminho público no stdout — use exatamente esse valor em `cover`
e no bloco `img`. Se sair com erro, **pare**: um artigo apontando para imagem
que não existe só aparece quebrado no navegador.

Sem imagem na pasta, reaproveite uma capa que já exista em `public/media/blog/`
e diga ao usuário qual escolheu.

A capa entra em dois lugares: no campo `cover` dos três idiomas e na entrada do
`index.json`. Uma segunda imagem, se houver, vira um bloco `img` no meio do
texto — depois do primeiro ou segundo subtítulo, nunca logo no começo.

---

## 6. Gravar

Crie `content/blog/<slug>/` com `pt.json`, `en.json` e `es.json`.

Depois acrescente a entrada em `content/blog/index.json`:

```json
{
  "slug": "…",
  "category": "…",
  "date": "…",
  "cover": "/media/blog/….webp",
  "titles": { "pt": "…", "en": "…", "es": "…" }
}
```

⚠️ **Sem essa entrada o artigo não aparece em lugar nenhum.** Os arquivos de
idioma são carregados por `import.meta.glob`, mas a listagem, a home do blog e a
contagem por categoria leem só o `index.json`. A ordem dentro do arquivo não
importa — `POSTS` ordena por data.

---

## 7. Conferir e limpar

```
npx tsc --noEmit
npx vite build
```

O build tem que passar. JSON malformado quebra o import e aparece aqui.

Depois confira no navegador, com o dev server de pé, que:

- o artigo aparece na listagem `/blog`;
- abre em `/blog/<slug>`;
- o cartão de autor aparece com foto, nome e cargo;
- `/en/blog/<slug>` e `/es/blog/<slug>` abrem traduzidos.

Só então apague o texto e a imagem de `_novos-posts/` — mantendo o `LEIA-ME.md`.

---

## 8. Fechar

Diga o que foi publicado: slug, categoria, autor, e onde a imagem entrou.
Diga também o que você **decidiu sozinho** — categoria, resumo, perguntas do
FAQ, onde a foto caiu no meio do texto — para o usuário poder discordar.

**Não dê `git push`.** Nem commit sem o usuário pedir.

---

## Nunca

- Inventar autor, ou usar um nome que não está em `content/authors.json`.
- Criar categoria fora das três declaradas em `src/lib/blog.ts`.
- Publicar sem entrada no `index.json`.
- Trocar a ordem dos quatro blocos do cartão de autor.
- Reescrever o argumento do texto. Corrigir digitação e pontuação, sim;
  melhorar o que a pessoa quis dizer, não.
- Apagar `_novos-posts/` antes do build passar.
- Deixar travessão (—) no texto publicado, em qualquer idioma. Troque por
  vírgula, dois-pontos ou ponto final, conforme a frase pedir. O time acha que
  ele deixa o texto com cara de gerado por IA.
