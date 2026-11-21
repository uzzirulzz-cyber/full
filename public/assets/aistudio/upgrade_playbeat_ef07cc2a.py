# -*- coding: utf-8 -*-
"""Upgrade Playbeat_Digital_Storefront.html: prices + real checkout (PayPal / Rapid / Manual)."""
import io

SRC = 'Playbeat_Digital_Storefront.html'
html = io.open(SRC, encoding='utf-8').read()

# ── 1. Prices on the 7 product cards ──────────────────────────
prices = {
    'Netflix': 7.99, 'YouTube Premium': 6.49, 'Prime Video': 5.99,
    'ChatGPT Pro': 9.99, 'CapCut Pro': 7.49, 'Xbox Game Pass': 8.99,
    'Microsoft Office': 12.99,
}
for name, price in prices.items():
    old = '<button type="button" data-buy="%s"' % name
    assert html.count(old) == 1, name
    new = ('<p style="color:#ffd958;font-weight:800;font-size:14px;margin:0 0 8px">$%.2f'
           '<span style="color:#c8d3ea;font-weight:500;font-size:10px"> /mo</span></p>'
           '<button type="button" data-buy="%s" data-price="%.2f"') % (price, name, price)
    html = html.replace(old, new)

# ── 2. Checkout modal + payment logic (read from sibling file) ─
checkout = io.open('playbeat_checkout_snippet.html', encoding='utf-8').read()

tail = '</body></html>'
assert html.rstrip().endswith(tail)
html = html.rstrip()[:-len(tail)] + checkout

io.open(SRC, 'w', encoding='utf-8').write(html)
print('upgraded OK, new size:', len(html))
