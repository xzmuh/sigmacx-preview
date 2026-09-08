/**
 * Foto solta -> `public/media/blog/<nome>.webp`.
 *
 * E a unica parte de publicar um artigo que nao da para fazer lendo e
 * escrevendo texto: reencodar a imagem. O resto (titulo, traducao, categoria,
 * resumo, FAQ) e decidido pela skill.
 *
 *   node .claude/skills/publicar-post/preparar-imagem.mjs <arquivo> <slug> [sufixo]
 *
 * Imprime o caminho publico — o valor que vai para `cover` e para o bloco
 * `{"t":"img"}` do corpo. Sai com codigo 1 e uma mensagem em caso de erro,
 * nunca em silencio: senao a skill grava um artigo apontando para uma imagem
 * que nao existe, e isso so aparece no navegador.
 *
 * 1400px e a largura que o import do WordPress ja usa nas imagens deste blog,
 * e o dobro da coluna de leitura — o que uma tela retina precisa. Imagem menor
 * que isso nao e ampliada: esticar nao cria detalhe, so peso.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const LARGURA_MAX = 1400;
const DESTINO = "public/media/blog";

const [, , origem, slug, sufixo = ""] = process.argv;

if (!origem || !slug) {
  console.error("uso: node preparar-imagem.mjs <arquivo> <slug> [sufixo]");
  process.exit(1);
}
if (!fs.existsSync(origem)) {
  console.error(`nao encontrei o arquivo: ${origem}`);
  process.exit(1);
}

/* O nome sai do slug, nao do arquivo de origem: o que cai em _novos-posts/
   costuma vir como "WhatsApp Image 2026-09-08 at 14.32.11.jpeg", e esse nome
   viraria uma URL publica. */
const nome = `${slug}${sufixo ? `-${sufixo}` : ""}.webp`;
const saida = path.join(DESTINO, nome);

if (!fs.existsSync(DESTINO)) fs.mkdirSync(DESTINO, { recursive: true });

try {
  const img = sharp(origem);
  const meta = await img.metadata();
  if (!meta.width || !meta.height) {
    console.error(`nao consegui ler as dimensoes de ${origem} — arquivo corrompido ou formato nao suportado`);
    process.exit(1);
  }

  await img
    .rotate() // respeita o EXIF: foto de celular deitada chega em pe
    .resize({ width: Math.min(meta.width, LARGURA_MAX), withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(saida);

  const kb = Math.round(fs.statSync(saida).size / 1024);
  console.error(`ok: ${meta.width}x${meta.height} -> ${Math.min(meta.width, LARGURA_MAX)}px, ${kb} kB`);
  // O stdout carrega SO o caminho, para a skill poder capturar direto.
  console.log(`/media/blog/${nome}`);
} catch (erro) {
  console.error(`falhei ao converter ${origem}: ${erro.message}`);
  process.exit(1);
}
