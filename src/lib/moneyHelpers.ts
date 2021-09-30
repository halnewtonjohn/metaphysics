import currencyCodes from "lib/currency_codes.json"
import numeral from "numeral"

const symbolOnly = ["GBP", "EUR", "MYR"]

/**
 * Adds the currency to a price and returns the display text.
 * e.g. currencyPrefix("USD") => "$"
 * @param currency The currency iso code (e.g. USD = United States Dollar)
 */
export const currencyPrefix = (currency: string): string => {
  const currencyMap = currencyCodes[currency.toLowerCase()]

  if (!currencyMap) return ""

  const { symbol, disambiguate_symbol } = currencyMap

  if (symbolOnly.includes(currency)) {
    return symbol
  }

  return disambiguate_symbol || currency + " " + symbol
}

export const priceAmount = (
  priceCents: number,
  currency: string,
  format: string
): string => {
  const { subunit_to_unit } = currencyCodes[currency.toLowerCase()]

  const amount = Math.round(priceCents / subunit_to_unit)

  return numeral(amount).format(format)
}

export const isCurrencySupported = (currency: string): boolean => {
  return currencyCodes[currency.toLowerCase()]
}

/**
 * Builds price display text (e.g. "$100").
 */
export const priceDisplayText = (
  priceCents: number | [number, number],
  currency: string,
  format: string
): string => {
  if (typeof priceCents === "number") {
    return currencyPrefix(currency) + priceAmount(priceCents, currency, format)
  }
  return priceRangeDisplayText(priceCents[0], priceCents[1], currency, format)
}

/**
 * Builds price range display text (e.g. "$100–$200" or "VUV Vt100–Vt200")..
 */
export const priceRangeDisplayText = (
  lowerPriceCents: number | null,
  higherPriceCents: number | null,
  currency: string,
  format: string
): string => {
  if (lowerPriceCents == null && higherPriceCents == null) {
    return ""
  }

  const fullPrefix = currencyPrefix(currency)
  const shortPrefix = fullPrefix.includes(" ")
    ? fullPrefix.split(" ")[1]
    : fullPrefix

  if (lowerPriceCents == null) {
    const amount = priceAmount(higherPriceCents as number, currency, format)
    return `Under ${fullPrefix}${amount}`
  }

  if (higherPriceCents == null) {
    const amount = priceAmount(lowerPriceCents as number, currency, format)
    return `${fullPrefix}${amount} and up`
  }

  const low = priceAmount(lowerPriceCents, currency, format)
  const high = priceAmount(higherPriceCents, currency, format)

  return `${fullPrefix}${low}–${shortPrefix}${high}`
}
