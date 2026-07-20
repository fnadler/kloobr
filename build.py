#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py — Gerador das páginas de serviço do canal KlooBR.

Fonte de layout:  servico.template.html  (blocos compartilhados = fonte única)
Fonte de dados:   data/servicos.json     (copy por serviço)
Saída:            servico-<slug>.html     (uma por serviço)

Uso:  python3 build.py
Sem dependências externas (Python 3.8+). A saída é HTML estático.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(ROOT, "servico.template.html")
DATA = os.path.join(ROOT, "data", "servicos.json")
BASE_URL = "https://kloobr.com.br"  # ajuste para o domínio real antes de publicar

# ---------------------------------------------------------------------------
# Biblioteca de ícones (apenas os <path>/<shape> internos, viewBox 0 0 24 24).
# São embrulhados com tamanho/traço conforme o contexto (howai 24/1.6, deliv 26/1.5).
# ---------------------------------------------------------------------------
ICONS = {
    "text-lines": '<path d="M4 6h16M4 10h10M4 14h16M4 18h7"/><path d="M18 13l3 3-3 3" opacity=".55"/>',
    "target": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/>',
    "grade": '<path d="M4 16.5L8.5 5h1L14 16.5"/><path d="M5.6 12.5h6.8"/><path d="M15.5 14.2l2 2 3.5-4"/>',
    "scissors": '<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.7 8.6L20 16M8.7 15.4L20 8"/>',
    "doc-rules": '<path d="M5 4.5h9l5 5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z"/><path d="M14 4.5V9h5" opacity=".55"/><path d="M8 13h6M8 16h4"/>',
    "file-doc": '<path d="M6 2.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V4a1.5 1.5 0 0 1 0-1.5z"/><path d="M14 2.5V7h4" opacity=".55"/><path d="M9 12l1.5 4 1.5-3 1.5 3L16 12"/>',
    "sheet": '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9.5h16M4 15h16M9.5 4v16M14.5 4v16" opacity=".7"/>',
    "shield": '<path d="M12 3l7 3v5.5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6z"/><path d="M9 12l2 2 4-4.2"/>',
    "globe": '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.5 2.3 3.9 5.4 3.9 8.5s-1.4 6.2-3.9 8.5c-2.5-2.3-3.9-5.4-3.9-8.5S9.5 5.8 12 3.5z"/>',
    "tablet": '<rect x="5.5" y="2.5" width="13" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    "megaphone": '<path d="M4 10.5v3a1 1 0 0 0 1 1h2l5 3.5v-15L7 10.5H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
    "heart": '<path d="M20.8 5.6a5.4 5.4 0 0 0-7.7 0l-1.1 1.1-1.1-1.1a5.4 5.4 0 1 0-7.7 7.7l1.1 1.1L12 21l7.7-6.6 1.1-1.1a5.4 5.4 0 0 0 0-7.7z"/>',
    "book-check": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7.5l1.6 1.6L14 5.8"/>',
    "chart": '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8.5 20v-6M12.5 20V9M16.5 20v-4"/>',
    "sparkles": '<path d="M12 3l1.7 4.6L18.5 9l-4.8 1.4L12 15l-1.7-4.6L5.5 9l4.8-1.4z"/><path d="M18.5 14.5l.7 1.9 1.9.6-1.9.7-.7 1.8-.7-1.8-1.9-.7 1.9-.6z"/>',
    "star": '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
    "layers": '<path d="M12 3.5 3.5 8 12 12.5 20.5 8z"/><path d="M3.5 12 12 16.5 20.5 12"/><path d="M3.5 16 12 20.5 20.5 16"/>',
    "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    "pen": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    "store": '<path d="M4 9l1-4.5h14L20 9"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M4 9a2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4 0"/>',
    "compass": '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    "quote": '<path d="M8 7c-2 1-3 3-3 5v5h5v-5H6"/><path d="M18 7c-2 1-3 3-3 5v5h5v-5h-4"/>',
}


def icon_svg(key, size, stroke):
    inner = ICONS.get(key, ICONS["text-lines"])
    return (f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" '
            f'stroke="currentColor" stroke-width="{stroke}" stroke-linecap="round" '
            f'stroke-linejoin="round">{inner}</svg>')


# ---------------------------------------------------------------------------
# Renderizadores de blocos
# ---------------------------------------------------------------------------
def render_howai(cards):
    out = []
    for c in cards:
        items = "\n".join(f"            <li>{li}</li>" for li in c["items"])
        out.append(
            '        <li class="howai__card glass">\n'
            '          <div class="howai__head">\n'
            f'            <span class="howai__ico" aria-hidden="true">{icon_svg(c["icon"], 24, "1.6")}</span>\n'
            f'            <h3 class="howai__title">{c["title"]}</h3>\n'
            '          </div>\n'
            '          <ul class="howai__list">\n'
            f'{items}\n'
            '          </ul>\n'
            '        </li>'
        )
    return "\n\n".join(out)


def render_deliverables(items):
    out = []
    for d in items:
        tag_cls = "delivery-box__tag delivery-box__tag--muted" if d.get("muted") else "delivery-box__tag"
        out.append(
            '        <div class="delivery-box glass">\n'
            f'          <span class="{tag_cls}">{d["tag"]}</span>\n'
            f'          <span class="delivery-box__ico" aria-hidden="true">{icon_svg(d["icon"], 26, "1.5")}</span>\n'
            f'          <h3>{d["title"]}</h3>\n'
            f'          <p>{d["desc"]}</p>\n'
            '        </div>'
        )
    return "\n".join(out)


def render_compare(rows):
    out = []
    for crit, kloobr, mercado in rows:
        out.append(
            f'            <tr><th scope="row" class="service-name">{crit}</th>'
            f'<td class="col-kloobr" data-label="KlooBR">{kloobr}</td>'
            f'<td data-label="Mercado">{mercado}</td></tr>'
        )
    return "\n".join(out)


def render_testimonials(items):
    out = []
    total = len(items)
    for i, t in enumerate(items, 1):
        out.append(
            f'            <li class="testimonial-carousel__slide" role="group" aria-roledescription="depoimento" aria-label="{i} de {total}">\n'
            '              <figure class="quote-card">\n'
            '                <span class="quote-card__mark" aria-hidden="true">”</span>\n'
            '                <div class="quote-card__stars" role="img" aria-label="Avaliação 5 de 5 estrelas">★★★★★</div>\n'
            f'                <blockquote class="quote-card__text">{t["quote"]}</blockquote>\n'
            '                <figcaption class="quote-card__author">\n'
            f'                  <span class="quote-card__avatar" aria-hidden="true">{t["initials"]}</span>\n'
            f'                  <span class="quote-card__meta"><cite>{t["name"]}</cite><span>{t["meta"]}</span></span>\n'
            '                </figcaption>\n'
            '              </figure>\n'
            '            </li>'
        )
    return "\n".join(out)


def render_faq(items):
    out = []
    for f in items:
        out.append(
            '        <details>\n'
            f'          <summary>{f["q"]}</summary>\n'
            f'          <div class="faq__answer">{f["a"]}</div>\n'
            '        </details>'
        )
    return "\n".join(out)


def render_crosssell(slugs, by_slug):
    out = []
    for slug in slugs:
        s = by_slug[slug]
        out.append(
            f'        <a class="xs-card" href="servico-{slug}.html" aria-label="Conhecer o serviço de {s["plainName"]}">\n'
            '          <span class="xs-card__media">\n'
            f'            <img class="xs-card__img" src="assets/img/{s["card"]}" alt="" aria-hidden="true" loading="lazy">\n'
            '          </span>\n'
            '          <span class="xs-card__body">\n'
            f'            <span class="xs-card__name">{s["name"]}</span>\n'
            f'            <span class="xs-card__desc">{s["xsDesc"]}</span>\n'
            '            <span class="xs-card__foot">\n'
            f'              <span class="xs-card__price">R$ {s["price"]}</span>\n'
            '              <span class="xs-card__cta">Ver serviço →</span>\n'
            '            </span>\n'
            '          </span>\n'
            '        </a>'
        )
    return "\n\n".join(out)


def default_steps(step_input):
    # Fluxo padrão do canal (com amostra grátis). Serviços que fogem disso
    # definem "steps" próprio no servicos.json (ex.: Conversão para E-book).
    return [
        {"title": "Envie seu arquivo", "text": step_input},
        {"title": "Receba uma amostra grátis", "text": "Veja a IA revisar um trecho do seu livro, sem pagar nada."},
        {"title": "Aprove e pague online", "text": "Gostou? Conclua a compra de forma rápida e segura."},
        {"title": "Receba em até 24h", "text": "Seu arquivo final chega com o relatório de todos os ajustes."},
    ]


def render_steps(steps):
    out = []
    for i, s in enumerate(steps, 1):
        out.append(
            '        <li class="step-card">\n'
            f'          <div class="step-number">{i:02d}</div>\n'
            f'          <h3>{s["title"]}</h3>\n'
            f'          <p>{s["text"]}</p>\n'
            '        </li>'
        )
    return "\n".join(out)


def build():
    with open(TEMPLATE, encoding="utf-8") as f:
        template = f.read()
    with open(DATA, encoding="utf-8") as f:
        services = json.load(f)
    by_slug = {s["slug"]: s for s in services}

    written = []
    for s in services:
        slug = s["slug"]
        og = s.get("ogImage") or f"{BASE_URL}/assets/img/{s['card']}"
        tokens = {
            "TITLE": s["title"],
            "META_DESC": s["metaDesc"],
            "CANONICAL": f"{BASE_URL}/servico-{slug}.html",
            "OG_IMAGE": og,
            "NAV_PHASE": s["phase"],
            "NAV_NAME": s["name"],
            "HERO_IMG": s["heroImg"],
            "HERO_PHASE": s["heroPhase"],
            "HERO_NAME": s["name"],
            "PROMISE": s["promise"],
            "FLOW_URL": s.get("flowUrl", "fluxo.html"),
            "PRICE": s["price"],
            "SAVE_PCT": str(s["savePct"]),
            "MARKET_TEXT": s["marketText"],
            "ARIA_TESTAR": s["ariaTestar"],
            "CTA_LABEL": s.get("ctaLabel", "Testar grátis"),
            "DOCK_NOTE": s.get("dockNote", "teste grátis antes de pagar"),
            "STEPS": render_steps(s.get("steps") or default_steps(s["stepInput"])),
            "HOWAI_EYEBROW": s["howaiEyebrow"],
            "HOWAI_TITLE": s["howaiTitle"],
            "HOWAI_LEAD": s["howaiLead"],
            "HOWAI_CARDS": render_howai(s["howaiCards"]),
            "DELIVERABLES": render_deliverables(s["deliverables"]),
            "SERVICE_NAME": s["plainName"],
            "COMPARE_ROWS": render_compare(s["compareRows"]),
            "PROOF_TITLE": s["proofTitle"],
            "TESTIMONIALS": render_testimonials(s["testimonials"]),
            "FAQ": render_faq(s["faq"]),
            "XS_EYEBROW": s["xsEyebrow"],
            "XS_TITLE": s["xsTitle"],
            "XS_LEAD": s["xsLead"],
            "XS_CARDS": render_crosssell(s["crossSell"], by_slug),
            "CTA_TITLE": s["ctaTitle"],
            "CTA_TEXT": s["ctaText"],
        }
        page = template
        for k, v in tokens.items():
            page = page.replace("{{" + k + "}}", v)

        # Estado ativo no menu-drawer e no rodapé (item do serviço atual).
        page = page.replace(f'data-svc="{slug}"', f'data-svc="{slug}" aria-current="page"')

        left = re.findall(r"{{[A-Z_]+}}", page)
        if left:
            sys.exit(f"ERRO: tokens não resolvidos em {slug}: {sorted(set(left))}")

        out_path = os.path.join(ROOT, f"servico-{slug}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(page)
        written.append(os.path.basename(out_path))

    print(f"OK — {len(written)} páginas geradas:")
    for w in written:
        print("  ·", w)


if __name__ == "__main__":
    build()
