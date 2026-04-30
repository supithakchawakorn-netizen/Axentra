import csv
import urllib.request

SOURCE_URL = "https://raw.githubusercontent.com/Ate329/top-us-stock-tickers/main/tickers/all.csv"
TARGET_TOTAL = 900
ALREADY_CURATED = 220


def clean_symbol(symbol: str) -> str:
    return symbol.strip().upper()


def valid_symbol(symbol: str) -> bool:
    if not symbol:
        return False
    if len(symbol) > 8:
        return False
    for ch in ("^", "/", "="):
        if ch in symbol:
            return False
    return True


def main() -> None:
    raw = urllib.request.urlopen(SOURCE_URL).read().decode("utf-8").splitlines()
    rows = list(csv.DictReader(raw))

    seen: set[str] = set()
    out: list[tuple[str, str]] = []
    for row in rows:
        symbol = clean_symbol(row.get("symbol", ""))
        name = row.get("name", "").strip()
        if not valid_symbol(symbol) or not name:
            continue
        if symbol in seen:
            continue
        seen.add(symbol)
        out.append((symbol, name.replace("'", "''")))
        if len(out) >= TARGET_TOTAL:
            break

    print(f"-- generated_rows={len(out)}")
    for symbol, name in out[ALREADY_CURATED:]:
        print(f"  ('{symbol}',   '{name}',   'NASDAQ', 'US'),")


if __name__ == "__main__":
    main()
