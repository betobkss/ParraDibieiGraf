#!/usr/bin/env python3
"""CLI local para validar um relatorio .eml sem tocar no banco ou na rede.
Uso:
    python3 VALIDAR_RELATORIO.py relatorio.eml
    python3 VALIDAR_RELATORIO.py --final relatorio.eml
"""
import sys
from troubleshoot.relatorio import main

if __name__ == "__main__":
    raise SystemExit(main())
