// GET /api/prices?ids=solana,zcash  -> { solana:{usd:..}, ... } (proxy CoinGecko, cache 60 dtk)
module.exports = async (req, res) => {
  try {
    const ids = String(req.query.ids || '').replace(/[^a-z0-9,\-]/g, '');
    if (!ids) return res.status(400).json({ error: 'ids kosong' });
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
    if (!r.ok) throw new Error('CoinGecko ' + r.status);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(await r.json());
  } catch (e) { res.status(502).json({ error: String(e) }); }
};
