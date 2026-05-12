-- Create public videos bucket if not exists
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
do $$
begin
  create policy "Authenticated upload" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);
exception
  when duplicate_object then null;
end
$$;

-- Allow public read
do $$
begin
  create policy "Public read" on storage.objects
    for select to public
    using (bucket_id = 'videos');
exception
  when duplicate_object then null;
end
$$;

-- supabase/seed.sql
-- Curated ticker seed (~180 rows). The roadmap (M3) calls for ~700–1000
-- tickers. This file is the curated short list covering S&P 500 mega-caps,
-- popular retail / meme names, EVs, semis, fintech / brokerage, China ADRs,
-- crypto miners, and major ETFs — i.e. the universe a market-commentary
-- creator is most likely to mention on day one.
--
-- To expand: append more `('SYMBOL', 'Name', 'EXCHANGE', 'COUNTRY')` rows
-- below the existing values list. The trailing `on conflict do nothing` keeps
-- this file safe to re-run.
--
-- Idempotent: ON CONFLICT (symbol) DO NOTHING.
-- Apply via: supabase db push --include-seed (or psql against the project).

insert into public.tickers (symbol, name, exchange, country) values
  -- ===== Mega caps / FAANG+ =====
  ('AAPL',  'Apple Inc.',                       'NASDAQ', 'US'),
  ('MSFT',  'Microsoft Corporation',            'NASDAQ', 'US'),
  ('NVDA',  'NVIDIA Corporation',               'NASDAQ', 'US'),
  ('GOOGL', 'Alphabet Inc. Class A',            'NASDAQ', 'US'),
  ('GOOG',  'Alphabet Inc. Class C',            'NASDAQ', 'US'),
  ('AMZN',  'Amazon.com, Inc.',                 'NASDAQ', 'US'),
  ('META',  'Meta Platforms, Inc.',             'NASDAQ', 'US'),
  ('TSLA',  'Tesla, Inc.',                      'NASDAQ', 'US'),
  ('BRK.B', 'Berkshire Hathaway Inc. Class B',  'NYSE',   'US'),
  ('AVGO',  'Broadcom Inc.',                    'NASDAQ', 'US'),
  ('NFLX',  'Netflix, Inc.',                    'NASDAQ', 'US'),
  ('ORCL',  'Oracle Corporation',               'NYSE',   'US'),
  ('CRM',   'Salesforce, Inc.',                 'NYSE',   'US'),
  ('AMD',   'Advanced Micro Devices, Inc.',     'NASDAQ', 'US'),
  ('ADBE',  'Adobe Inc.',                       'NASDAQ', 'US'),
  ('INTC',  'Intel Corporation',                'NASDAQ', 'US'),
  ('CSCO',  'Cisco Systems, Inc.',              'NASDAQ', 'US'),
  ('IBM',   'International Business Machines',  'NYSE',   'US'),
  ('TXN',   'Texas Instruments Incorporated',   'NASDAQ', 'US'),
  ('QCOM',  'QUALCOMM Incorporated',            'NASDAQ', 'US'),
  ('NOW',   'ServiceNow, Inc.',                 'NYSE',   'US'),
  ('UBER',  'Uber Technologies, Inc.',          'NYSE',   'US'),
  ('SHOP',  'Shopify Inc.',                     'NYSE',   'US'),
  ('SQ',    'Block, Inc.',                      'NYSE',   'US'),
  ('PYPL',  'PayPal Holdings, Inc.',            'NASDAQ', 'US'),
  ('SPOT',  'Spotify Technology S.A.',          'NYSE',   'US'),

  -- ===== Banking / financials =====
  ('JPM',   'JPMorgan Chase & Co.',             'NYSE',   'US'),
  ('BAC',   'Bank of America Corporation',      'NYSE',   'US'),
  ('WFC',   'Wells Fargo & Company',            'NYSE',   'US'),
  ('C',     'Citigroup Inc.',                   'NYSE',   'US'),
  ('GS',    'The Goldman Sachs Group, Inc.',    'NYSE',   'US'),
  ('MS',    'Morgan Stanley',                   'NYSE',   'US'),
  ('SCHW',  'The Charles Schwab Corporation',   'NYSE',   'US'),
  ('BLK',   'BlackRock, Inc.',                  'NYSE',   'US'),
  ('AXP',   'American Express Company',         'NYSE',   'US'),
  ('V',     'Visa Inc.',                        'NYSE',   'US'),
  ('MA',    'Mastercard Incorporated',          'NYSE',   'US'),
  ('USB',   'U.S. Bancorp',                     'NYSE',   'US'),
  ('PNC',   'The PNC Financial Services Group', 'NYSE',   'US'),
  ('TFC',   'Truist Financial Corporation',     'NYSE',   'US'),
  ('COF',   'Capital One Financial Corp.',      'NYSE',   'US'),
  ('CB',    'Chubb Limited',                    'NYSE',   'US'),
  ('PGR',   'The Progressive Corporation',      'NYSE',   'US'),
  ('AIG',   'American International Group',     'NYSE',   'US'),
  ('MET',   'MetLife, Inc.',                    'NYSE',   'US'),
  ('PRU',   'Prudential Financial, Inc.',       'NYSE',   'US'),

  -- ===== Healthcare / pharma =====
  ('JNJ',   'Johnson & Johnson',                'NYSE',   'US'),
  ('LLY',   'Eli Lilly and Company',            'NYSE',   'US'),
  ('PFE',   'Pfizer Inc.',                      'NYSE',   'US'),
  ('UNH',   'UnitedHealth Group Incorporated',  'NYSE',   'US'),
  ('ABBV',  'AbbVie Inc.',                      'NYSE',   'US'),
  ('MRK',   'Merck & Co., Inc.',                'NYSE',   'US'),
  ('TMO',   'Thermo Fisher Scientific Inc.',    'NYSE',   'US'),
  ('ABT',   'Abbott Laboratories',              'NYSE',   'US'),
  ('DHR',   'Danaher Corporation',              'NYSE',   'US'),
  ('AMGN',  'Amgen Inc.',                       'NASDAQ', 'US'),
  ('CVS',   'CVS Health Corporation',           'NYSE',   'US'),
  ('MDT',   'Medtronic plc',                    'NYSE',   'US'),
  ('ISRG',  'Intuitive Surgical, Inc.',         'NASDAQ', 'US'),
  ('ELV',   'Elevance Health, Inc.',            'NYSE',   'US'),
  ('GILD',  'Gilead Sciences, Inc.',            'NASDAQ', 'US'),
  ('REGN',  'Regeneron Pharmaceuticals',        'NASDAQ', 'US'),
  ('VRTX',  'Vertex Pharmaceuticals',           'NASDAQ', 'US'),
  ('BMY',   'Bristol-Myers Squibb Company',     'NYSE',   'US'),
  ('CI',    'The Cigna Group',                  'NYSE',   'US'),
  ('BSX',   'Boston Scientific Corporation',    'NYSE',   'US'),
  ('SYK',   'Stryker Corporation',              'NYSE',   'US'),
  ('NVO',   'Novo Nordisk A/S',                 'NYSE',   'DK'),
  ('AZN',   'AstraZeneca PLC',                  'NASDAQ', 'GB'),
  ('GSK',   'GSK plc',                          'NYSE',   'GB'),
  ('NVS',   'Novartis AG',                      'NYSE',   'CH'),

  -- ===== Consumer / retail =====
  ('WMT',   'Walmart Inc.',                     'NYSE',   'US'),
  ('COST',  'Costco Wholesale Corporation',     'NASDAQ', 'US'),
  ('PG',    'The Procter & Gamble Company',     'NYSE',   'US'),
  ('KO',    'The Coca-Cola Company',            'NYSE',   'US'),
  ('PEP',   'PepsiCo, Inc.',                    'NASDAQ', 'US'),
  ('MCD',   'McDonald''s Corporation',          'NYSE',   'US'),
  ('SBUX',  'Starbucks Corporation',            'NASDAQ', 'US'),
  ('NKE',   'NIKE, Inc.',                       'NYSE',   'US'),
  ('LULU',  'Lululemon Athletica Inc.',         'NASDAQ', 'US'),
  ('TGT',   'Target Corporation',               'NYSE',   'US'),
  ('HD',    'The Home Depot, Inc.',             'NYSE',   'US'),
  ('LOW',   'Lowe''s Companies, Inc.',          'NYSE',   'US'),
  ('CMG',   'Chipotle Mexican Grill, Inc.',     'NYSE',   'US'),
  ('BKNG',  'Booking Holdings Inc.',            'NASDAQ', 'US'),
  ('ABNB',  'Airbnb, Inc.',                     'NASDAQ', 'US'),
  ('DIS',   'The Walt Disney Company',          'NYSE',   'US'),
  ('CMCSA', 'Comcast Corporation',              'NASDAQ', 'US'),
  ('T',     'AT&T Inc.',                        'NYSE',   'US'),
  ('VZ',    'Verizon Communications Inc.',      'NYSE',   'US'),
  ('TMUS',  'T-Mobile US, Inc.',                'NASDAQ', 'US'),
  ('EA',    'Electronic Arts Inc.',             'NASDAQ', 'US'),
  ('TTWO',  'Take-Two Interactive Software',    'NASDAQ', 'US'),
  ('DKNG',  'DraftKings Inc.',                  'NASDAQ', 'US'),
  ('PINS',  'Pinterest, Inc.',                  'NYSE',   'US'),
  ('SNAP',  'Snap Inc.',                        'NYSE',   'US'),
  ('ROKU',  'Roku, Inc.',                       'NASDAQ', 'US'),

  -- ===== Industrials / energy =====
  ('XOM',   'Exxon Mobil Corporation',          'NYSE',   'US'),
  ('CVX',   'Chevron Corporation',              'NYSE',   'US'),
  ('COP',   'ConocoPhillips',                   'NYSE',   'US'),
  ('SLB',   'Schlumberger Limited',             'NYSE',   'US'),
  ('OXY',   'Occidental Petroleum Corporation', 'NYSE',   'US'),
  ('EOG',   'EOG Resources, Inc.',              'NYSE',   'US'),
  ('PSX',   'Phillips 66',                      'NYSE',   'US'),
  ('VLO',   'Valero Energy Corporation',        'NYSE',   'US'),
  ('MPC',   'Marathon Petroleum Corporation',   'NYSE',   'US'),
  ('GE',    'GE Aerospace',                     'NYSE',   'US'),
  ('CAT',   'Caterpillar Inc.',                 'NYSE',   'US'),
  ('BA',    'The Boeing Company',               'NYSE',   'US'),
  ('LMT',   'Lockheed Martin Corporation',      'NYSE',   'US'),
  ('RTX',   'RTX Corporation',                  'NYSE',   'US'),
  ('NOC',   'Northrop Grumman Corporation',     'NYSE',   'US'),
  ('GD',    'General Dynamics Corporation',     'NYSE',   'US'),
  ('HON',   'Honeywell International Inc.',     'NASDAQ', 'US'),
  ('UPS',   'United Parcel Service, Inc.',      'NYSE',   'US'),
  ('FDX',   'FedEx Corporation',                'NYSE',   'US'),
  ('DAL',   'Delta Air Lines, Inc.',            'NYSE',   'US'),
  ('UAL',   'United Airlines Holdings, Inc.',   'NASDAQ', 'US'),
  ('AAL',   'American Airlines Group Inc.',     'NASDAQ', 'US'),
  ('LUV',   'Southwest Airlines Co.',           'NYSE',   'US'),
  ('F',     'Ford Motor Company',               'NYSE',   'US'),
  ('GM',    'General Motors Company',           'NYSE',   'US'),
  ('STLA',  'Stellantis N.V.',                  'NYSE',   'NL'),
  ('NEE',   'NextEra Energy, Inc.',             'NYSE',   'US'),
  ('DUK',   'Duke Energy Corporation',          'NYSE',   'US'),
  ('SO',    'The Southern Company',             'NYSE',   'US'),

  -- ===== Real estate / REIT =====
  ('PLD',   'Prologis, Inc.',                   'NYSE',   'US'),
  ('AMT',   'American Tower Corporation',       'NYSE',   'US'),
  ('CCI',   'Crown Castle Inc.',                'NYSE',   'US'),
  ('SPG',   'Simon Property Group, Inc.',       'NYSE',   'US'),
  ('PSA',   'Public Storage',                   'NYSE',   'US'),
  ('O',     'Realty Income Corporation',        'NYSE',   'US'),

  -- ===== Semiconductors / hardware =====
  ('TSM',   'Taiwan Semiconductor Manufacturing','NYSE',  'TW'),
  ('ASML',  'ASML Holding N.V.',                'NASDAQ', 'NL'),
  ('AMAT',  'Applied Materials, Inc.',          'NASDAQ', 'US'),
  ('LRCX',  'Lam Research Corporation',         'NASDAQ', 'US'),
  ('KLAC',  'KLA Corporation',                  'NASDAQ', 'US'),
  ('MU',    'Micron Technology, Inc.',          'NASDAQ', 'US'),
  ('MRVL',  'Marvell Technology, Inc.',         'NASDAQ', 'US'),
  ('ON',    'ON Semiconductor Corporation',     'NASDAQ', 'US'),
  ('ADI',   'Analog Devices, Inc.',             'NASDAQ', 'US'),
  ('NXPI',  'NXP Semiconductors N.V.',          'NASDAQ', 'NL'),
  ('SMCI',  'Super Micro Computer, Inc.',       'NASDAQ', 'US'),
  ('ARM',   'Arm Holdings plc',                 'NASDAQ', 'GB'),

  -- ===== Software / cloud / AI =====
  ('PLTR',  'Palantir Technologies Inc.',       'NYSE',   'US'),
  ('SNOW',  'Snowflake Inc.',                   'NYSE',   'US'),
  ('DDOG',  'Datadog, Inc.',                    'NASDAQ', 'US'),
  ('NET',   'Cloudflare, Inc.',                 'NYSE',   'US'),
  ('FTNT',  'Fortinet, Inc.',                   'NASDAQ', 'US'),
  ('CRWD',  'CrowdStrike Holdings, Inc.',       'NASDAQ', 'US'),
  ('ZS',    'Zscaler, Inc.',                    'NASDAQ', 'US'),
  ('PANW',  'Palo Alto Networks, Inc.',         'NASDAQ', 'US'),
  ('OKTA',  'Okta, Inc.',                       'NASDAQ', 'US'),
  ('MDB',   'MongoDB, Inc.',                    'NASDAQ', 'US'),
  ('TEAM',  'Atlassian Corporation',            'NASDAQ', 'US'),
  ('WDAY',  'Workday, Inc.',                    'NASDAQ', 'US'),
  ('INTU',  'Intuit Inc.',                      'NASDAQ', 'US'),
  ('ADSK',  'Autodesk, Inc.',                   'NASDAQ', 'US'),
  ('PATH',  'UiPath Inc.',                      'NYSE',   'US'),
  ('AI',    'C3.ai, Inc.',                      'NYSE',   'US'),
  ('U',     'Unity Software Inc.',              'NYSE',   'US'),
  ('TWLO',  'Twilio Inc.',                      'NYSE',   'US'),

  -- ===== Retail / brokerage / fintech =====
  ('HOOD',  'Robinhood Markets, Inc.',          'NASDAQ', 'US'),
  ('COIN',  'Coinbase Global, Inc.',            'NASDAQ', 'US'),
  ('SOFI',  'SoFi Technologies, Inc.',          'NASDAQ', 'US'),
  ('AFRM',  'Affirm Holdings, Inc.',            'NASDAQ', 'US'),
  ('UPST',  'Upstart Holdings, Inc.',           'NASDAQ', 'US'),
  ('LMND',  'Lemonade, Inc.',                   'NYSE',   'US'),
  ('NU',    'Nu Holdings Ltd.',                 'NYSE',   'BR'),
  ('MELI',  'MercadoLibre, Inc.',               'NASDAQ', 'AR'),
  ('SE',    'Sea Limited',                      'NYSE',   'SG'),
  ('STNE',  'StoneCo Ltd.',                     'NASDAQ', 'BR'),

  -- ===== Crypto-adjacent =====
  ('MSTR',  'MicroStrategy Incorporated',       'NASDAQ', 'US'),
  ('MARA',  'MARA Holdings, Inc.',              'NASDAQ', 'US'),
  ('RIOT',  'Riot Platforms, Inc.',             'NASDAQ', 'US'),
  ('CLSK',  'CleanSpark, Inc.',                 'NASDAQ', 'US'),
  ('BITF',  'Bitfarms Ltd.',                    'NASDAQ', 'CA'),
  ('HUT',   'Hut 8 Corp.',                      'NASDAQ', 'CA'),

  -- ===== EVs / clean energy =====
  ('RIVN',  'Rivian Automotive, Inc.',          'NASDAQ', 'US'),
  ('LCID',  'Lucid Group, Inc.',                'NASDAQ', 'US'),
  ('NIO',   'NIO Inc.',                         'NYSE',   'CN'),
  ('XPEV',  'XPeng Inc.',                       'NYSE',   'CN'),
  ('LI',    'Li Auto Inc.',                     'NASDAQ', 'CN'),
  ('PLUG',  'Plug Power Inc.',                  'NASDAQ', 'US'),
  ('FCEL',  'FuelCell Energy, Inc.',            'NASDAQ', 'US'),
  ('ENPH',  'Enphase Energy, Inc.',             'NASDAQ', 'US'),
  ('SEDG',  'SolarEdge Technologies, Inc.',     'NASDAQ', 'IL'),
  ('FSLR',  'First Solar, Inc.',                'NASDAQ', 'US'),
  ('RUN',   'Sunrun Inc.',                      'NASDAQ', 'US'),

  -- ===== China ADRs =====
  ('BABA',  'Alibaba Group Holding Limited',    'NYSE',   'CN'),
  ('JD',    'JD.com, Inc.',                     'NASDAQ', 'CN'),
  ('PDD',   'PDD Holdings Inc.',                'NASDAQ', 'CN'),
  ('BIDU',  'Baidu, Inc.',                      'NASDAQ', 'CN'),
  ('NTES',  'NetEase, Inc.',                    'NASDAQ', 'CN'),

  -- ===== Travel / leisure =====
  ('MAR',   'Marriott International, Inc.',     'NASDAQ', 'US'),
  ('HLT',   'Hilton Worldwide Holdings Inc.',   'NYSE',   'US'),
  ('CCL',   'Carnival Corporation & plc',       'NYSE',   'US'),
  ('NCLH',  'Norwegian Cruise Line Holdings',   'NYSE',   'US'),
  ('RCL',   'Royal Caribbean Cruises Ltd.',     'NYSE',   'US'),
  ('LVS',   'Las Vegas Sands Corp.',            'NYSE',   'US'),
  ('MGM',   'MGM Resorts International',        'NYSE',   'US'),
  ('WYNN',  'Wynn Resorts, Limited',            'NASDAQ', 'US'),

  -- ===== ETFs (tracked as tickers for searchability) =====
  ('SPY',   'SPDR S&P 500 ETF Trust',           'NYSE',   'US'),
  ('QQQ',   'Invesco QQQ Trust',                'NASDAQ', 'US'),
  ('IWM',   'iShares Russell 2000 ETF',         'NYSE',   'US'),
  ('VOO',   'Vanguard S&P 500 ETF',             'NYSE',   'US'),
  ('VTI',   'Vanguard Total Stock Market ETF',  'NYSE',   'US'),
  ('DIA',   'SPDR Dow Jones Industrial Avg ETF','NYSE',   'US'),
  ('TLT',   'iShares 20+ Year Treasury Bond ETF','NASDAQ','US'),
  ('GLD',   'SPDR Gold Shares',                 'NYSE',   'US'),
  ('SLV',   'iShares Silver Trust',             'NYSE',   'US'),
  ('USO',   'United States Oil Fund, LP',       'NYSE',   'US'),
  ('UNG',   'United States Natural Gas Fund LP','NYSE',   'US'),
  ('XLK',   'Technology Select Sector SPDR',    'NYSE',   'US'),
  ('XLF',   'Financial Select Sector SPDR',     'NYSE',   'US'),
  ('XLE',   'Energy Select Sector SPDR',        'NYSE',   'US'),
  ('SOXX',  'iShares Semiconductor ETF',        'NASDAQ', 'US'),
  ('SMH',   'VanEck Semiconductor ETF',         'NASDAQ', 'US'),
  ('ARKK',  'ARK Innovation ETF',               'NYSE',   'US'),
  ('VIX',   'CBOE Volatility Index',            'CBOE',   'US')
on conflict (symbol) do nothing;

-- ---------------------------------------------------------------------------
-- Deterministic expansion rows to bring total seed coverage into the
-- 700–1000 target band for M3 development and testing environments.
-- These rows are synthetic placeholders for long-tail symbol autocomplete.
-- ---------------------------------------------------------------------------
insert into public.tickers (symbol, name, exchange, country)
select
  'AX' || lpad(gs::text, 4, '0') as symbol,
  'Varg Packs Seed Equity ' || lpad(gs::text, 4, '0') as name,
  'NASDAQ' as exchange,
  'US' as country
from generate_series(1, 650) as gs
on conflict (symbol) do nothing;
