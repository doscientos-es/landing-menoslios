const names = {
  workers: 'Trabajadores',
  procurement: 'Proveedores',
  ai: 'Asistente de IA',
  mcp: 'MCP',
};
const validAmount = (value) => Number.isSafeInteger(value) && value > 0;

// Live catalogue: no fallback amounts and no private credentials in the landing.
export async function loadPricing(endpoint, fetcher = fetch) {
  const response = await fetcher(endpoint, {
    credentials: 'omit',
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error('Pricing unavailable');
  const value = await response.json();
  const base = ['base_monthly_cents', 'base_yearly_cents', 'seat_monthly_cents', 'seat_yearly_cents'];
  if (!value || !base.every((key) => validAmount(value[key])) || !Array.isArray(value.modules))
    throw new Error('Invalid catalogue');
  const modules = value.modules
    .filter((rate) => rate && Object.hasOwn(names, rate.code))
    .map((rate) => {
      if (!validAmount(rate.monthly_cents) || !validAmount(rate.yearly_cents) ||
          (rate.unit !== 'company' && rate.unit !== 'person')) throw new Error('Invalid module');
      return { ...rate, name: names[rate.code] };
    });
  return { ...value, modules };
}
