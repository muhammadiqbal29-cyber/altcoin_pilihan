// GET /api/news?q=SOL,ZEC,...  -> [{t,l,d}] dari RSS Cointelegraph, difilter koin + makro
const MACRO = /\b(sec|fed|inflation|etf|cftc|rate cut|tariff|bitcoin|btc)\b/i;
const dec = s => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&#8217;|&#039;/g, "'").replace(/&quot;/g, '"').trim();
module.exports = async (req, res) => {
  try {
    const syms = String(req.query.q || '').split(',').filter(s => /^[A-Za-z]{2,10}$/.test(s));
    const coin = syms.length ? new RegExp('\\b(' + syms.join('|') + ')\\b', 'i') : null;
    const r = await fetch('https://cointelegraph.com/rss');
    if (!r.ok) throw new Error('RSS ' + r.status);
    const xml = await r.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => {
      const g = t => (m[1].match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || '';
      return { t: dec(g('title')), l: dec(g('link')), d: dec(g('pubDate')).slice(0, 16) };
    }).filter(i => i.t && i.l.startsWith('https://') && ((coin && coin.test(i.t)) || MACRO.test(i.t)));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(items.slice(0, 12));
  } catch (e) { res.status(502).json({ error: String(e) }); }
};
