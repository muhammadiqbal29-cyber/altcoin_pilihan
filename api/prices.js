module.exports = async (req, res) => {
  try {
    const syms = String(req.query.symbols || '').toUpperCase().split(',').filter(Boolean);
    if (!syms.length) return res.status(400).json({ error: 'symbols kosong' });
    
    // Fetch all prices from MEXC (very fast, single call)
    const r = await fetch('https://api.mexc.com/api/v3/ticker/price');
    if (!r.ok) throw new Error('MEXC ' + r.status);
    
    const data = await r.json();
    const result = {};
    
    // Convert array to object { "SOL": 120.5, "BTC": 60000.5 }
    data.forEach(item => {
      // item.symbol is like "SOLUSDT"
      if (item.symbol.endsWith('USDT')) {
        const coinSymbol = item.symbol.replace('USDT', '');
        result[coinSymbol] = parseFloat(item.price);
      }
    });
    
    // Filter only requested symbols to save bandwidth
    const filteredResult = {};
    syms.forEach(s => {
      if (result[s]) filteredResult[s] = result[s];
    });
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(filteredResult);
  } catch (e) { res.status(502).json({ error: String(e) }); }
};
