import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import App from './App.jsx'
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
} from '../shared/lib/mockData.js'

vi.mock('../shared/lib/api.js', () => ({
  fetchMarketData: async () => ({
    goodsMasters,
    variants,
    listings,
    offers,
    orders,
    priceHistory,
    priceIndex,
    shippingPolicies,
    sellers,
  }),
}))

describe('App', () => {
  it('renders and completes a checkout flow', async () => {
    render(<App />)

    expect(await screen.findByText('음반 거래 플랫폼, Evaluation')).toBeInTheDocument()

    const buyButtons = screen.getAllByText('구매')
    fireEvent.click(buyButtons[0])

    expect(await screen.findByText('결제 확인')).toBeInTheDocument()
    fireEvent.click(screen.getByText('결제하기'))

    expect(await screen.findByText('거래/주문 상태')).toBeInTheDocument()
  })
})
