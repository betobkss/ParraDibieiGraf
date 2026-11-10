"""CLI local para validar um relatorio .eml sem tocar no banco ou no arquivo."""
from troubleshoot.relatorio import main


if __name__ == "__main__":
    raise SystemExit(main())