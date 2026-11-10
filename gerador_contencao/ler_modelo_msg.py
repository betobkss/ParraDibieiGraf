"""Utilitario para inspecionar e extrair assunto/corpo de arquivos .msg (Outlook OLE)."""
import os
import sys

def extrair_msg(caminho_msg):
    try:
        import olefile
    except ImportError:
        print("[ERRO] Pacote olefile nao instalado. Instale com: pip install olefile", file=sys.stderr)
        return

    if not os.path.exists(caminho_msg):
        print(f"[ERRO] Arquivo nao encontrado: {caminho_msg}", file=sys.stderr)
        return

    ole = olefile.OleFileIO(caminho_msg)

    def rd(name):
        try:
            return ole.openstream(name).read()
        except Exception:
            return None

    subj = rd('__substg1.0_0037001F')
    body = rd('__substg1.0_1000001F')
    s = subj.decode('utf-16le', errors='replace') if subj else ''
    b = body.decode('utf-16le', errors='replace') if body else ''

    print('SUBJECT:', s)
    print('BODY_LEN:', len(b))

    out_txt = os.path.join(os.path.dirname(caminho_msg), 'modelo_corpo_extraido.txt')
    with open(out_txt, 'w', encoding='utf-8') as f:
        f.write(b)
    print(f'Corpo salvo em: {out_txt}')
    print('\nPrimeiros 1000 caracteres:\n', b[:1000])

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python ler_modelo_msg.py <arquivo.msg>")
        sys.exit(1)
    extrair_msg(sys.argv[1])
