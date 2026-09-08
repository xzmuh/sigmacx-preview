# Artigos novos entram por aqui

Jogue nesta pasta **um arquivo de texto** (`.txt` ou `.md`) e, se tiver, **uma
foto** (`.jpg`, `.png`, `.webp`). Depois, no Claude Code:

```
/publicar-post
```

Pronto. Ele cria a pasta do artigo com os três idiomas, converte a foto, coloca
o artigo no índice, roda o build e esvazia esta pasta. Falta só `git push` para
ir ao ar.

Cada publicação vira uma pasta com o nome dela:

```
content/blog/meu-artigo/     pt.json  en.json  es.json
public/media/blog/           a imagem convertida
```

E uma linha nova em `content/blog/index.json`, que é o índice que a listagem lê.

## Como o texto pode vir

Do jeito que estiver. Colado do Word, do e-mail, do Google Docs, com ou sem
formatação. Não há gabarito para seguir.

Se quiser cravar alguma coisa, basta escrever numa linha própria:

```
Título: O futuro do atendimento é conversa
Autor: Murillo Melo
```

Sem a linha `Título:`, ele usa a primeira linha do arquivo. Sem a linha
`Autor:`, ele procura uma assinatura no fim do texto — e **pergunta** se não
achar, em vez de chutar um nome.

## O que ele decide sozinho

Slug da URL, tradução para inglês e espanhol, categoria (entre as três que já
existem), o resumo que aparece no card, as perguntas frequentes do fim e onde a
foto entra no meio do texto. Ele conta o que decidiu quando termina, para você
poder discordar.

## O que ele não faz

Não inventa autor. Não cria categoria nova. Não dá `git push` — isso é seu.

---

O elenco de autores e a lista de categorias ficam em `content/authors.json`.
Autor novo na equipe: acrescente lá (com a foto em `public/media/blog/`) antes
de publicar o primeiro artigo dele.

As categorias são três — `agentes-de-ia`, `dados-e-insights` e `produtos`. Criar
uma quarta não é só editar o JSON: ela precisa ser declarada em `CATEGORIES`, no
`src/lib/blog.ts`, senão não aparece no filtro da listagem.
