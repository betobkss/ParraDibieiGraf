"""Validacao offline dos contratos dos relatorios .eml."""
from __future__ import annotations

import argparse
import re
import sys
from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
from pathlib import Path


class _HTML(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.text: list[str] = []
        self.images: list[tuple[str, str]] = []
        self.sections: dict[str, int] = {}
        self.section = ""
        self._tag = ""
        self._parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag == "img":
            src = attrs_dict.get("src") or ""
            if src.lower().startswith("cid:"):
                self.images.append((self.section, src[4:].strip("<>")))
            return
        if tag in ("h1", "h2", "h3", "p", "li"):
            self._tag = tag
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._tag:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag != self._tag:
            return
        text = re.sub(r"\s+", " ", " ".join(self._parts)).strip()
        if text:
            self.text.append(text)
            if tag in ("h2", "h3"):
                match = re.match(r"(2\.[1-8])\b", text)
                if match:
                    self.section = match.group(1)
                elif re.match(r"[134]\.", text):
                    self.section = ""
        self._tag = ""
        self._parts = []


def _cid(value: str | None) -> str:
    return (value or "").strip().strip("<>").lower()


def _tipo(subject: str, html: str) -> str:
    assunto = subject.lower()
    if "health check" in assunto:
        return "healthcheck"
    if "conten" in assunto or "bloqueios" in assunto:
        return "contencao"
    text = f"{subject} {html}".lower()
    if "conten" in text or "bloqueios" in text:
        return "contencao"
    return "healthcheck"


def validar_eml(path: str | Path, tipo: str = "auto", final: bool = False) -> dict:
    """Retorna erros e avisos sem alterar o arquivo validado."""
    errors: list[str] = []
    warnings: list[str] = []
    try:
        message = BytesParser(policy=policy.default).parsebytes(Path(path).read_bytes())
    except (OSError, ValueError) as exc:
        return {"tipo": tipo, "erros": [f"nao foi possivel ler o EML: {exc}"],
                "avisos": [], "imagens": 0, "cid_quebrados": 0}

    html_part = next((p for p in message.walk()
                      if p.get_content_type() == "text/html"), None)
    if html_part is None:
        return {"tipo": tipo, "erros": ["parte text/html ausente"],
                "avisos": [], "imagens": 0, "cid_quebrados": 0}

    html = html_part.get_content()
    parsed_html = _HTML()
    parsed_html.feed(html)
    visible_text = " ".join(parsed_html.text)
    subject = str(message.get("Subject") or "")
    report_type = _tipo(subject, visible_text) if tipo == "auto" else tipo
    image_parts = [p for p in message.walk()
                   if p.get_content_maintype() == "image"]
    embedded_cids = {_cid(p.get("Content-ID")) for p in image_parts}
    referenced_cids = {_cid(cid) for _, cid in parsed_html.images}
    broken = referenced_cids - embedded_cids
    if broken:
        errors.append(f"{len(broken)} CID(s) referenciado(s) sem imagem embutida")

    if "RASCUNHO" in visible_text.upper():
        target = errors if final else warnings
        target.append("o corpo ainda esta marcado como RASCUNHO")

    if report_type == "healthcheck":
        if len(image_parts) != 13:
            errors.append(f"Health Check deve conter 13 imagens; encontrado: {len(image_parts)}")
        if len(parsed_html.images) != 13:
            errors.append(f"Health Check deve referenciar 13 imagens; encontrado: {len(parsed_html.images)}")
        window = re.search(
            r"janela\s+(\d{1,2})h(\d{2})\s*(?:a|[-\u2013])\s*(\d{1,2})h(\d{2})",
            visible_text, re.IGNORECASE)
        label = re.search(
            r"\b\d{1,2}/\d{1,2}/\d{4}\s*[-\u2013]\s*(\d{1,2})h(\d{2})",
            visible_text, re.IGNORECASE)
        if window and label:
            end_time = (int(window.group(3)), int(window.group(4)))
            report_time = (int(label.group(1)), int(label.group(2)))
            if end_time != report_time:
                target = errors if final else warnings
                target.append("horario do cabecalho difere do fim da janela declarada")
    elif report_type == "contencao":
        for index in range(1, 9):
            section = f"2.{index}"
            if section not in re.findall(r"2\.[1-8]", visible_text):
                target = errors if final else warnings
                target.append(f"secao {section} ausente")
            elif not any(current == section for current, _ in parsed_html.images):
                target = errors if final else warnings
                target.append(f"secao {section} sem imagem de evidencia")
    else:
        errors.append(f"tipo de relatorio invalido: {report_type}")

    return {"tipo": report_type, "erros": errors, "avisos": warnings,
            "imagens": len(image_parts), "cid_quebrados": len(broken)}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Valida contratos de relatorios EML sem conexao ao banco")
    parser.add_argument("eml", help="arquivo .eml a validar")
    parser.add_argument("--tipo", choices=("auto", "healthcheck", "contencao"),
                        default="auto")
    parser.add_argument("--final", action="store_true",
                        help="promove avisos de entrega a erros")
    args = parser.parse_args(argv)
    result = validar_eml(args.eml, args.tipo, args.final)
    print(f"Tipo: {result['tipo']} | imagens: {result['imagens']} | CID sem imagem: {result['cid_quebrados']}")
    for warning in result["avisos"]:
        print(f"[AVISO] {warning}")
    for error in result["erros"]:
        print(f"[ERRO] {error}")
    if not result["avisos"] and not result["erros"]:
        print("[OK] contrato do relatorio valido")
    return 1 if result["erros"] else 0


if __name__ == "__main__":
    raise SystemExit(main())