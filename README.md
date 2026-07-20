# KlooBR — Canal de serviços de IA para autores

Protótipo estático do canal próprio da **KlooBR** (empresa do Clube de Autores):
serviços de IA para autores, com página inicial, páginas de serviço e fluxos de
teste grátis/compra. Português do Brasil, sem dependências de build em runtime.

## Estrutura

| Item | Descrição |
| --- | --- |
| `home.html` | Página inicial |
| `servico-*.html` | Páginas dos serviços (geradas por `build.py`) |
| `fluxo.html`, `fluxo-*.html` | Fluxos de teste grátis/compra de cada serviço |
| `servico.html` | Redirect legado → `servico-edicao-revisao.html` |
| `assets/` | CSS (`kloobr.css`), JS (`kloobr-anim.js`), imagens e logos |
| `data/servicos.json` | Copy de cada serviço (fonte de dados das páginas) |
| `servico.template.html` | Layout com `{{slots}}` das páginas de serviço |
| `build.py` | Gerador data-driven das páginas de serviço |

## Gerar as páginas de serviço

As páginas `servico-*.html` são geradas a partir do template e do JSON:

```bash
python3 build.py
```

Sem dependências externas (Python 3.8+). A saída é HTML estático.

## Publicação

Site estático — pode ser servido por **GitHub Pages** a partir da raiz do
repositório (`home.html` como página de entrada).
