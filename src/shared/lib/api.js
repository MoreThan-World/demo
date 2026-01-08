import {
  goodsMasters,
  listings,
  offers,
  orders,
  priceHistory,
  priceIndex,
  shippingPolicies,
  variants,
  sellers,
} from './mockData.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchMarketData() {
  await delay(400)
  return {
    goodsMasters,
    variants,
    listings,
    offers,
    orders,
    priceHistory,
    priceIndex,
    shippingPolicies,
    sellers,
  }
}
