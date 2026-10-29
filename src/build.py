"""Собирает update-flow/client.html — окно обновления ПО в клиенте TRASSIR.

Базовые токены, компоненты и значки берутся из прототипа настроек (device-settings-dialog/src/template.html),
как в его modals.html: копий руками нет, прототип не меняется.
Запуск: python3 update-flow/src/build.py
"""
from pathlib import Path

SRC = Path(__file__).resolve().parent
TPL = SRC.parents[1] / 'device-settings-dialog' / 'src' / 'template.html'
OUT = SRC.parent / 'client.html'

tpl = TPL.read_text(encoding='utf-8')
base_css = tpl[tpl.index('<style>') + len('<style>'):tpl.index('</style>')]
i0 = tpl.index('const ICON = {'); icons = tpl[i0:tpl.index('\n};', i0) + 3]

html = ((SRC / 'client.html').read_text(encoding='utf-8')
        .replace('/*__BASECSS__*/', base_css)
        .replace('/*__UCSS__*/', (SRC / 'client.css').read_text(encoding='utf-8'))
        .replace('/*__ICONS__*/', icons)
        .replace('/*__UJS__*/', (SRC / 'client.js').read_text(encoding='utf-8')))
OUT.write_text(html, encoding='utf-8')
print(f'Собрано: {OUT} ({OUT.stat().st_size // 1024} КБ)')
