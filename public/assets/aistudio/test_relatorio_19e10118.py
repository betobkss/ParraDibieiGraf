from email.message import EmailMessage

from troubleshoot.relatorio import validar_eml


def _eml(tmp_path, subject, body, images):
    message = EmailMessage()
    message["Subject"] = subject
    message["X-Unsent"] = "1"
    message.set_content("Relatorio HTML")
    message.add_alternative(body, subtype="html")
    html = message.get_payload()[-1]
    for cid in images:
        html.add_related(b"png", maintype="image", subtype="png", cid=f"<{cid}>")
    path = tmp_path / "relatorio.eml"
    path.write_bytes(message.as_bytes())
    return path


def _hc_html(label="09h56", end="09h56", count=13):
    images = "".join(f'<img src="cid:i{i}" alt="painel {i}">' for i in range(count))
    return (f"<html><body><p>DD/MM/AAAA - {label} (janela HH:MM a {end})</p>"
            f"{images}</body></html>")


def _containment_html(missing=None, draft=False):
    parts = ["<html><body>"]
    cids = []
    for index in range(1, 9):
        parts.append(f"<h3>2.{index} Evidencia</h3>")
        if index != missing:
            cid = f"s{index}"
            cids.append(cid)
            parts.append(f'<img src="cid:{cid}" alt="evidencia {index}">')
    if draft:
        parts.append("<p>RASCUNHO para revisao</p>")
    parts.append("</body></html>")
    return "".join(parts), cids


def test_healthcheck_valido_tem_13_imagens_e_janela_coerente(tmp_path):
    path = _eml(tmp_path, "Health Check Gravity", _hc_html(), [f"i{i}" for i in range(13)])
    result = validar_eml(path)
    assert result["tipo"] == "healthcheck"
    assert result["erros"] == [] and result["avisos"] == []


def test_healthcheck_detecta_rotulo_de_horario_divergente(tmp_path):
    path = _eml(tmp_path, "Health Check Gravity", _hc_html("09h00"), [f"i{i}" for i in range(13)])
    result = validar_eml(path)
    assert any("horario do cabecalho" in warning for warning in result["avisos"])
    strict = validar_eml(path, final=True)
    assert any("horario do cabecalho" in error for error in strict["erros"])


def test_healthcheck_nao_e_classificado_como_contencao_pelo_corpo(tmp_path):
    body = _hc_html().replace("</body>", "<p>bloqueios &gt; 5 s</p></body>")
    path = _eml(tmp_path, "Health Check - Banco de dados - Gravity - DD/MM/AAAA - 09h", body,
                [f"i{i}" for i in range(13)])
    assert validar_eml(path)["tipo"] == "healthcheck"


def test_healthcheck_exige_treze_imagens(tmp_path):
    path = _eml(tmp_path, "Health Check Gravity", _hc_html(count=12), [f"i{i}" for i in range(12)])
    result = validar_eml(path)
    assert any("13 imagens" in error for error in result["erros"])


def test_contencao_exige_evidencia_visual_nas_oito_secoes(tmp_path):
    body, cids = _containment_html(missing=8)
    path = _eml(tmp_path, "Gravity Contencao", body, cids)
    result = validar_eml(path)
    assert any("secao 2.8 sem imagem" in warning for warning in result["avisos"])
    strict = validar_eml(path, final=True)
    assert any("secao 2.8 sem imagem" in error for error in strict["erros"])


def test_rascunho_e_aviso_ate_modo_final(tmp_path):
    body, cids = _containment_html(draft=True)
    path = _eml(tmp_path, "Gravity Contencao", body, cids)
    assert any("RASCUNHO" in warning for warning in validar_eml(path)["avisos"])
    assert any("RASCUNHO" in error for error in validar_eml(path, final=True)["erros"])


def test_cid_sem_anexo_e_erro(tmp_path):
    path = _eml(tmp_path, "Health Check Gravity", _hc_html(), [f"i{i}" for i in range(12)])
    result = validar_eml(path)
    assert result["cid_quebrados"] == 1
    assert any("CID(s)" in error for error in result["erros"])