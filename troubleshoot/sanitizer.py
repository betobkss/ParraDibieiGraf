# -*- coding: utf-8 -*-
"""Sanitização e Mascaramento de Dados Sensíveis (LGPD / GDPR)"""
import re

def mask_text(text, mask_literals=True):
    if not text: return text
    # CPF
    text = re.sub(r'\d{3}\.\d{3}\.\d{3}-\d{2}', '***.***.***-**', text)
    # Email
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '***@masked.domain', text)
    if mask_literals:
        text = re.sub(r'=\s*'[^']+'', "= ':masked_literal'", text)
    return text
