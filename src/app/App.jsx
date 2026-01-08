import { useEffect, useMemo, useState } from 'react'
import { fetchMarketData } from '../shared/lib/api.js'
import { buildBg } from '../shared/lib/artwork.js'
import { conditionLabel, tabs } from '../shared/lib/constants.js'
import { formatPrice } from '../shared/lib/format.js'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabs,
  Textarea,
  Toast,
} from '../shared/ui/index.js'
import './App.css'

function PriceChart({ data }) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 240 + 20
      const y = 90 - ((value - min) / range) * 70 + 10
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg className="price-chart" viewBox="0 0 280 110" aria-hidden="true">
      <polyline points={points} />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 240 + 20
        const y = 90 - ((value - min) / range) * 70 + 10
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="3" />
      })}
    </svg>
  )
}

const orderStatusLabel = {
  paid: '결제 완료',
  shipped: '발송 완료',
  delivered: '배송 완료',
  completed: '거래 완료',
  dispute: '분쟁',
}

const myTabs = [
  { id: 'offers', label: '내 오퍼' },
  { id: 'favorites', label: '관심목록' },
  { id: 'listings', label: '내 판매글' },
  { id: 'orders', label: '내 주문' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('market')
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState(null)
  const [selectedListing, setSelectedListing] = useState(null)
  const [myTab, setMyTab] = useState('offers')
  const [offers, setOffers] = useState([])
  const [orders, setOrders] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [offerPrice, setOfferPrice] = useState('16500')
  const [counterPrice, setCounterPrice] = useState('17500')
  const [sortBy, setSortBy] = useState('latest')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [filters, setFilters] = useState({ query: '', group: 'all', member: 'all', category: 'all' })
  const [checkoutState, setCheckoutState] = useState({ open: false, listing: null })
  const [buyerNote, setBuyerNote] = useState('')
  const [trackingEdits, setTrackingEdits] = useState({})

  useEffect(() => {
    let alive = true
    setStatus('loading')
    fetchMarketData()
      .then((payload) => {
        if (!alive) return
        setData(payload)
        setSelectedListing(payload.listings[0] || null)
        setOffers(payload.offers)
        setOrders(payload.orders)
        setStatus('success')
      })
      .catch(() => {
        if (!alive) return
        setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [])

  const listings = data?.listings ?? []
  const variants = data?.variants ?? []
  const goodsMasters = data?.goodsMasters ?? []
  const priceIndex = data?.priceIndex ?? []
  const priceHistory = data?.priceHistory ?? {}
  const shippingPolicies = data?.shippingPolicies ?? {}
  const sellers = data?.sellers ?? []
  const currentUserId = 'u-1'

  const groups = useMemo(
    () => ['all', ...new Set(goodsMasters.map((item) => item.group))],
    [goodsMasters],
  )

  const members = useMemo(
    () => ['all', ...new Set(variants.map((item) => item.member))],
    [variants],
  )

  const categories = useMemo(
    () => ['all', ...new Set(goodsMasters.map((item) => item.merchType))],
    [goodsMasters],
  )

  const tagSuggestions = useMemo(() => {
    const tags = goodsMasters.flatMap((item) => item.tags)
    return [...new Set(tags)].slice(0, 6)
  }, [goodsMasters])

  const selectedVariant = useMemo(() => {
    if (!selectedListing) return null
    return variants.find((item) => item.id === selectedListing.variantId)
  }, [selectedListing, variants])

  const selectedGoods = useMemo(() => {
    if (!selectedVariant) return null
    return goodsMasters.find((item) => item.id === selectedVariant.goodsMasterId)
  }, [selectedVariant, goodsMasters])

  const selectedSeller = useMemo(() => {
    if (!selectedListing) return null
    return sellers.find((item) => item.id === selectedListing.sellerId)
  }, [selectedListing, sellers])

  const selectedShipping = selectedListing
    ? shippingPolicies[selectedListing.shippingPolicyId]
    : null

  const selectedPriceIndexes = useMemo(() => {
    if (!selectedListing) return []
    return priceIndex.filter((item) => item.variantId === selectedListing.variantId)
  }, [priceIndex, selectedListing])

  const trendData = selectedListing ? priceHistory[selectedListing.variantId] || [] : []

  const variantListings = useMemo(() => {
    if (!selectedListing) return []
    return listings.filter((item) => item.variantId === selectedListing.variantId)
  }, [listings, selectedListing])

  const filteredVariantListings = useMemo(() => {
    if (conditionFilter === 'all') return variantListings
    return variantListings.filter((item) => item.conditionGrade === conditionFilter)
  }, [variantListings, conditionFilter])

  const lowestListing = useMemo(() => {
    if (!filteredVariantListings.length) return null
    return filteredVariantListings.reduce((min, item) => (item.price < min.price ? item : min), filteredVariantListings[0])
  }, [filteredVariantListings])

  const filteredListings = useMemo(() => {
    const normalized = filters.query.trim().toLowerCase()
    const matchQuery = (goods, variant) => {
      if (!normalized) return true
      const tagMatch = goods.tags?.some((tag) => tag.toLowerCase().includes(normalized))
      return (
        goods.title.toLowerCase().includes(normalized) ||
        goods.artist.toLowerCase().includes(normalized) ||
        goods.eraOrAlbum.toLowerCase().includes(normalized) ||
        goods.merchType.toLowerCase().includes(normalized) ||
        (variant?.member || '').toLowerCase().includes(normalized) ||
        tagMatch
      )
    }

    return listings
      .filter((listing) => {
        const variant = variants.find((item) => item.id === listing.variantId)
        const goods = goodsMasters.find((item) => item.id === variant?.goodsMasterId)
        if (!variant || !goods) return false
        if (filters.group !== 'all' && goods.group !== filters.group) return false
        if (filters.member !== 'all' && variant.member !== filters.member) return false
        if (filters.category !== 'all' && goods.merchType !== filters.category) return false
        return matchQuery(goods, variant)
      })
      .sort((a, b) => {
        if (sortBy === 'lowest') return a.price - b.price
        if (sortBy === 'volume') {
          const countA = priceIndex.find((item) => item.variantId === a.variantId)?.tradeCount ?? 0
          const countB = priceIndex.find((item) => item.variantId === b.variantId)?.tradeCount ?? 0
          return countB - countA
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [filters, listings, variants, goodsMasters, sortBy, priceIndex])

  const resetFilters = () => {
    setFilters({ query: '', group: 'all', member: 'all', category: 'all' })
    setSortBy('latest')
  }

  const pushToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2200)
  }

  const toggleFavorite = (listingId) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(listingId)) {
        next.delete(listingId)
        pushToast('관심에서 제거했습니다.')
      } else {
        next.add(listingId)
        pushToast('관심에 추가했습니다.')
      }
      return next
    })
  }

  const placeOffer = () => {
    if (!selectedListing) return
    setOffers((prev) => [
      {
        id: `of-${Date.now()}`,
        listingId: selectedListing.id,
        buyerId: 'me',
        price: Number(offerPrice),
        status: '대기',
      },
      ...prev,
    ])
    pushToast('가격 오퍼가 제출되었습니다.')
  }

  const acceptOffer = (offerId) => {
    setOffers((prev) =>
      prev.map((offer) => (offer.id === offerId ? { ...offer, status: '수락' } : offer)),
    )
    pushToast('오퍼가 수락되었습니다.')
  }

  const counterOffer = (offerId) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId ? { ...offer, status: `카운터 ${counterPrice}원` } : offer,
      ),
    )
    pushToast('카운터 제안을 보냈습니다.')
  }

  const createOrder = (listing, price) => {
    const shipping = shippingPolicies[listing.shippingPolicyId]
    const platformFee = Math.round(price * 0.05)
    setOrders((prev) => [
      {
        id: `o-${Date.now()}`,
        listingId: listing.id,
        buyerId: 'me',
        finalPrice: price,
        platformFee,
        shippingFee: shipping.fee,
        status: 'paid',
        trackingNumber: '',
        timestamps: { paid: '지금' },
        buyerNote,
      },
      ...prev,
    ])
    setBuyerNote('')
    setCheckoutState({ open: false, listing: null })
    setActiveTab('orders')
    pushToast('결제가 완료되었습니다. 판매자 발송을 기다립니다.')
  }

  const openCheckout = (listing) => {
    setCheckoutState({ open: true, listing })
  }

  const closeCheckout = () => {
    setCheckoutState({ open: false, listing: null })
  }

  const updateTracking = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, trackingNumber: trackingEdits[orderId] || order.trackingNumber, status: 'shipped' }
          : order,
      ),
    )
    pushToast('송장 정보가 저장되었습니다.')
  }

  const myOffers = offers.filter((offer) => offer.buyerId === 'me')
  const myListings = listings.filter((listing) => listing.sellerId === currentUserId)
  const myOrders = orders.filter((order) => order.buyerId === 'me')

  const checkoutListing = checkoutState.listing
  const checkoutShipping = checkoutListing ? shippingPolicies[checkoutListing.shippingPolicyId] : null
  const checkoutFee = checkoutListing ? Math.round(checkoutListing.price * 0.05) : 0
  const checkoutTotal = checkoutListing
    ? checkoutListing.price + checkoutFee + (checkoutShipping?.fee || 0)
    : 0

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">EVALUATION</div>
        <Tabs items={tabs} value={activeTab} onChange={setActiveTab} ariaLabel="주요 메뉴" />
        <div className="top-actions">
          <Input
            className="search-input"
            placeholder="아티스트, 포카, 특전 검색"
            aria-label="검색"
            value={filters.query}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, query: event.target.value }))
            }
          />
          <Button variant="ghost">로그인</Button>
          <Button variant="primary">판매 등록</Button>
        </div>
      </header>

      <main className="page">
        {activeTab === 'market' && (
          <>
            <section className="market-header">
              <div>
                <p className="eyebrow">검색</p>
                <h1>아이돌 굿즈 거래플랫폼, Evaluation</h1>
                <p className="lede">멤버/버전/특전별로 원하는 굿즈를 빠르게 찾을 수 있어요.</p>
                <div className="tag-row">
                  {tagSuggestions.map((tag) => (
                    <Button key={tag} variant="ghost" size="sm" onClick={() => setFilters((prev) => ({ ...prev, query: tag }))}>
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="market-actions">
                <Badge variant="strong">리스트</Badge>
              </div>
            </section>

            <section className="market-filters">
              <Select
                label="그룹"
                value={filters.group}
                onChange={(event) => setFilters((prev) => ({ ...prev, group: event.target.value }))}
              >
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group === 'all' ? '전체' : group}
                  </option>
                ))}
              </Select>
              <Select
                label="멤버"
                value={filters.member}
                onChange={(event) => setFilters((prev) => ({ ...prev, member: event.target.value }))}
              >
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member === 'all' ? '전체' : member}
                  </option>
                ))}
              </Select>
              <Select
                label="카테고리"
                value={filters.category}
                onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? '전체' : category}
                  </option>
                ))}
              </Select>
              <Select label="정렬" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="latest">최신</option>
                <option value="volume">거래량</option>
                <option value="lowest">최저가</option>
              </Select>
              <div className="filter-actions">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  필터 초기화
                </Button>
              </div>
            </section>

            <section className="market-layout">
              <div>
                {status === 'error' && <ErrorState />}

                {status === 'loading' && (
                  <section className="section results grid">
                    {[...Array(4)].map((_, idx) => (
                      <Card key={idx} className="card">
                        <Skeleton height={160} />
                        <div className="card-body">
                          <Skeleton height={18} width="70%" />
                          <Skeleton height={14} width="50%" />
                          <Skeleton height={16} width="40%" />
                        </div>
                      </Card>
                    ))}
                  </section>
                )}

                {status === 'success' && (
                  <section className="section results list">
                    <div className="results-meta">
                      <strong>{filteredListings.length}개 결과</strong>
                      <span className="muted">
                        정렬: {sortBy === 'latest' ? '최신' : sortBy === 'volume' ? '거래량' : '최저가'}
                      </span>
                    </div>
                    {filteredListings.length === 0 ? (
                      <EmptyState message="조건에 맞는 결과가 없어요. 필터를 줄여보세요." />
                    ) : (
                      filteredListings.map((listing) => {
                        const variant = variants.find((item) => item.id === listing.variantId)
                        const goods = goodsMasters.find((item) => item.id === variant?.goodsMasterId)
                        return (
                          <Card
                            key={listing.id}
                            className={`card ${listing.id === selectedListing?.id ? 'active' : ''}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={listing.id === selectedListing?.id}
                            onClick={() => {
                              setSelectedListing(listing)
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                setSelectedListing(listing)
                              }
                            }}
                          >
                            <div className="thumb" style={{ backgroundImage: buildBg(listing.photos[0]) }} />
                            <div className="card-body">
                              <div className="card-row">
                                <h3>{goods?.title}</h3>
                                <Badge variant="strong">{listing.saleType === 'fixed' ? '즉시' : '오퍼'}</Badge>
                              </div>
                              <p className="muted">
                                {goods?.artist} · {variant?.member} · {variant?.version}
                              </p>
                              <div className="meta">
                                <strong>{formatPrice(listing.price)}</strong>
                                <Badge>{conditionLabel[listing.conditionGrade]}</Badge>
                              </div>
                              <div className="card-actions">
                                <Button
                                  variant={favorites.has(listing.id) ? 'primary' : 'ghost'}
                                  size="sm"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    toggleFavorite(listing.id)
                                  }}
                                >
                                  관심
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    openCheckout(listing)
                                  }}
                                >
                                  구매
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )
                      })
                    )}
                  </section>
                )}
              </div>

              <aside className="detail-stack">
                {!selectedListing && <EmptyState title="판매글을 선택해 주세요." />}

                {selectedListing && selectedVariant && (
                  <Card className="detail-panel">
                    <p className="eyebrow">Variant & 판매글 상세</p>
                    <h2>{selectedGoods?.title}</h2>
                    <p className="muted">
                      {selectedGoods?.artist} · {selectedVariant.member} · {selectedVariant.version} ·{' '}
                      {selectedVariant.releaseRound}
                    </p>
                    <div className="gallery">
                      <div className="hero-media" style={{ backgroundImage: buildBg(selectedListing.photos[0]) }} />
                    </div>
                    <div className="variant-grid">
                      {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                        <div key={key} className="variant-item">
                          <span>{key}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="chip-row">
                      <Button
                        variant={conditionFilter === 'all' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setConditionFilter('all')}
                      >
                        전체
                      </Button>
                      {Object.keys(conditionLabel).map((grade) => (
                        <Button
                          key={grade}
                          variant={conditionFilter === grade ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setConditionFilter(grade)}
                        >
                          {grade}
                        </Button>
                      ))}
                    </div>
                    <div className="price-block">
                      <div>
                        <p className="muted">판매가</p>
                        <strong>{formatPrice(selectedListing.price)}</strong>
                      </div>
                      <div>
                        <p className="muted">수수료</p>
                        <strong>{formatPrice(Math.round(selectedListing.price * 0.05))}</strong>
                      </div>
                      <div>
                        <p className="muted">배송비</p>
                        <strong>{formatPrice(selectedShipping?.fee || 0)}</strong>
                      </div>
                      <div>
                        <p className="muted">결제 예상</p>
                        <strong>
                          {formatPrice(
                            selectedListing.price +
                              Math.round(selectedListing.price * 0.05) +
                              (selectedShipping?.fee || 0),
                          )}
                        </strong>
                      </div>
                    </div>
                    <div className="detail-actions">
                      <Button variant="primary" onClick={() => openCheckout(selectedListing)}>
                        구매하기
                      </Button>
                      <Button variant="ghost" onClick={() => setActiveTab('offer')}>
                        가격 제안
                      </Button>
                    </div>
                    <div className="chart-card">
                      <div className="chart-head">
                        <div>
                          <p className="muted">7일 시세 추이</p>
                          <strong>
                            {trendData.length
                              ? formatPrice(trendData[trendData.length - 1])
                              : formatPrice(selectedListing.price)}
                          </strong>
                        </div>
                        <Badge>최근 거래가</Badge>
                      </div>
                      <PriceChart data={trendData} />
                    </div>
                    <div className="stat-grid">
                      {selectedPriceIndexes.map((item) => (
                        <div key={item.period} className="stat-card">
                          <span className="muted">{item.period.toUpperCase()}</span>
                          <strong>{formatPrice(item.medianPrice)}</strong>
                          <span className="muted">거래 {item.tradeCount}건</span>
                        </div>
                      ))}
                    </div>
                    {lowestListing && (
                      <div className="list-item">
                        <div>
                          <strong>현재 최저가 판매글</strong>
                          <p className="muted">
                            {lowestListing.saleType === 'fixed' ? '즉시 구매' : '오퍼 가능'} · 재고{' '}
                            {lowestListing.quantity}개
                          </p>
                        </div>
                        <Badge variant="strong">{formatPrice(lowestListing.price)}</Badge>
                      </div>
                    )}
                    <div className="list">
                      <div className="list-item">
                        <div>
                          <strong>구성품 포함</strong>
                          <p className="muted">
                            {selectedListing.includes.albumInclusions.join(', ')}
                          </p>
                        </div>
                        <Badge>POB {selectedListing.includes.pob ? '포함' : '미포함'}</Badge>
                      </div>
                      <div className="list-item">
                        <div>
                          <strong>상세 하자</strong>
                          <p className="muted">{selectedListing.conditionDetails.join(' · ')}</p>
                        </div>
                        <Badge>{selectedListing.status}</Badge>
                      </div>
                      {selectedSeller && (
                        <div className="list-item">
                          <div>
                            <strong>판매자 {selectedSeller.nickname}</strong>
                            <p className="muted">
                              평점 {selectedSeller.rating} · 거래 {selectedSeller.totalTrades}건 · 분쟁 {selectedSeller.disputeRate}%
                            </p>
                          </div>
                          <Badge>{selectedSeller.status === 'active' ? '정상' : '제한'}</Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </aside>
            </section>
          </>
        )}

        {activeTab === 'offer' && status === 'success' && selectedListing && (
          <section className="section offer">
            <Card className="offer-panel">
              <div>
                <h2>가격 오퍼</h2>
                <p className="muted">판매글 {selectedGoods?.title}에 대한 오퍼를 제출합니다.</p>
              </div>
              <div className="form">
                <Input
                  label="오퍼 금액"
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
                <Button variant="primary" onClick={placeOffer}>
                  오퍼 제출
                </Button>
              </div>
              <div className="offer-list">
                {offers.filter((offer) => offer.listingId === selectedListing.id).length === 0 ? (
                  <EmptyState title="등록된 오퍼가 없어요." />
                ) : (
                  offers
                    .filter((offer) => offer.listingId === selectedListing.id)
                    .map((offer) => (
                      <div key={offer.id} className="list-item">
                        <div>
                          <strong>오퍼 {offer.id}</strong>
                          <p className="muted">구매자 {offer.buyerId}</p>
                        </div>
                        <div className="list-meta">
                          <span>{formatPrice(offer.price)}</span>
                          <Badge>{offer.status}</Badge>
                        </div>
                        <div className="offer-actions">
                          <Button variant="ghost" size="sm" onClick={() => acceptOffer(offer.id)}>
                            수락
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => counterOffer(offer.id)}>
                            카운터
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
              <div className="counter">
                <Input
                  label="카운터 제안 금액"
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                />
              </div>
            </Card>
          </section>
        )}

        {activeTab === 'orders' && status === 'success' && (
          <section className="section orders">
            <div className="section-head">
              <h2>거래/주문 상태</h2>
              <p className="muted">에스크로 및 배송 흐름을 확인합니다.</p>
            </div>
            <div className="list">
              {orders.length === 0 ? (
                <EmptyState title="주문 내역이 없어요." />
              ) : (
                orders.map((order) => {
                  const listing = listings.find((item) => item.id === order.listingId)
                  const variant = variants.find((item) => item.id === listing?.variantId)
                  const goods = goodsMasters.find((item) => item.id === variant?.goodsMasterId)
                  return (
                    <div key={order.id} className="list-item order-item">
                      <div>
                        <strong>{goods?.title}</strong>
                        <p className="muted">
                          결제 {formatPrice(order.finalPrice)} · 수수료 {formatPrice(order.platformFee)} · 배송{' '}
                          {formatPrice(order.shippingFee)}
                        </p>
                      </div>
                      <div className="list-meta">
                        <Badge variant="strong">{orderStatusLabel[order.status]}</Badge>
                        <span className="muted">송장 {order.trackingNumber || '-'}</span>
                      </div>
                      <div className="timeline">
                        <span className={order.timestamps.paid ? 'dot active' : 'dot'}>결제</span>
                        <span className={order.timestamps.shipped ? 'dot active' : 'dot'}>발송</span>
                        <span className={order.status === 'delivered' || order.status === 'completed' ? 'dot active' : 'dot'}>
                          배송
                        </span>
                        <span className={order.status === 'completed' ? 'dot active' : 'dot'}>완료</span>
                      </div>
                      <div className="tracking-row">
                        <Input
                          label="송장 입력"
                          placeholder="택배사 송장번호"
                          value={trackingEdits[order.id] || ''}
                          onChange={(event) =>
                            setTrackingEdits((prev) => ({ ...prev, [order.id]: event.target.value }))
                          }
                        />
                        <Button variant="ghost" onClick={() => updateTracking(order.id)}>
                          송장 저장
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )}

        {activeTab === 'price' && status === 'success' && (
          <section className="section price">
            <div className="section-head">
              <h2>Variant 시세</h2>
              <p className="muted">최근 거래 데이터 기반 시세 정보</p>
            </div>
            <div className="price-grid">
              {selectedPriceIndexes.length === 0 ? (
                <EmptyState title="시세 데이터가 없어요." />
              ) : (
                selectedPriceIndexes.map((item) => (
                  <div key={`${item.variantId}-${item.period}`} className="price-card">
                    <h3>{conditionLabel[item.conditionGrade]}</h3>
                    <p className="muted">{item.period.toUpperCase()} 기준</p>
                    <div className="price-row">
                      <span>중앙값</span>
                      <strong>{formatPrice(item.medianPrice)}</strong>
                    </div>
                    <div className="price-row">
                      <span>평균가</span>
                      <strong>{formatPrice(item.averagePrice)}</strong>
                    </div>
                    <div className="price-row">
                      <span>최근 거래가</span>
                      <strong>{formatPrice(item.lastTradePrice)}</strong>
                    </div>
                    <div className="price-row">
                      <span>거래량</span>
                      <strong>{item.tradeCount}건</strong>
                    </div>
                    <div className="sparkline">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'mypage' && status === 'success' && (
          <section className="section mypage">
            <div className="section-head">
              <div>
                <h2>마이페이지</h2>
                <p className="muted">내 오퍼/관심/판매/주문을 한 곳에서 관리합니다.</p>
              </div>
              <Tabs items={myTabs} value={myTab} onChange={setMyTab} ariaLabel="마이페이지 탭" />
            </div>

            {myTab === 'offers' && (
              <div className="list">
                {myOffers.length === 0 ? (
                  <EmptyState title="등록된 오퍼가 없어요." />
                ) : (
                  myOffers.map((offer) => (
                    <div key={offer.id} className="list-item">
                      <div>
                        <strong>오퍼 {offer.id}</strong>
                        <p className="muted">판매글 {offer.listingId}</p>
                      </div>
                      <div className="list-meta">
                        <span>{formatPrice(offer.price)}</span>
                        <Badge>{offer.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {myTab === 'favorites' && (
              <div className="list">
                {[...favorites].length === 0 ? (
                  <EmptyState title="관심 목록이 비었습니다." />
                ) : (
                  [...favorites].map((id) => {
                    const listing = listings.find((item) => item.id === id)
                    const variant = variants.find((item) => item.id === listing?.variantId)
                    const goods = goodsMasters.find((item) => item.id === variant?.goodsMasterId)
                    if (!listing || !goods) return null
                    return (
                      <div key={id} className="list-item">
                        <div>
                          <strong>{goods.title}</strong>
                          <p className="muted">{goods.artist}</p>
                        </div>
                        <div className="list-meta">
                          <span>{formatPrice(listing.price)}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {myTab === 'listings' && (
              <div className="list">
                {myListings.length === 0 ? (
                  <EmptyState title="등록한 판매글이 없어요." />
                ) : (
                  myListings.map((listing) => (
                    <div key={listing.id} className="list-item">
                      <div>
                        <strong>{listing.id}</strong>
                        <p className="muted">상태 {listing.status} · 수량 {listing.quantity}개</p>
                      </div>
                      <div className="list-meta">
                        <span>{formatPrice(listing.price)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {myTab === 'orders' && (
              <div className="list">
                {myOrders.length === 0 ? (
                  <EmptyState title="내 주문이 없어요." />
                ) : (
                  myOrders.map((order) => (
                    <div key={order.id} className="list-item">
                      <div>
                        <strong>주문 {order.id}</strong>
                        <p className="muted">결제 {formatPrice(order.finalPrice)}</p>
                      </div>
                      <div className="list-meta">
                        <Badge>{orderStatusLabel[order.status]}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <div>
          <h4>EVALUATION</h4>
          <p className="muted">K-POP 굿즈 C2C 거래 플랫폼 (검수 제외)</p>
        </div>
        <div className="footer-links">
          <a href="#">회사소개</a>
          <a href="#">이용약관</a>
          <a href="#">개인정보 처리방침</a>
          <a href="#">고객센터</a>
        </div>
      </footer>

      <Modal
        open={checkoutState.open}
        title="결제 확인"
        onClose={closeCheckout}
        footer={
          <>
            <Button variant="ghost" onClick={closeCheckout}>
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => checkoutListing && createOrder(checkoutListing, checkoutListing.price)}
            >
              결제하기
            </Button>
          </>
        }
      >
        {checkoutListing && (
          <div className="checkout-body">
            <div className="checkout-summary">
              <div>
                <strong>상품</strong>
                <p className="muted">{selectedGoods?.title}</p>
              </div>
              <div>
                <strong>판매가</strong>
                <p>{formatPrice(checkoutListing.price)}</p>
              </div>
              <div>
                <strong>수수료</strong>
                <p>{formatPrice(checkoutFee)}</p>
              </div>
              <div>
                <strong>배송비</strong>
                <p>{formatPrice(checkoutShipping?.fee || 0)}</p>
              </div>
              <div className="checkout-total">
                <strong>총 결제</strong>
                <p>{formatPrice(checkoutTotal)}</p>
              </div>
            </div>
            <Textarea
              label="요청 사항"
              placeholder="판매자에게 요청할 내용을 입력하세요."
              value={buyerNote}
              onChange={(event) => setBuyerNote(event.target.value)}
            />
            <div className="checkout-note">
              결제는 에스크로 방식으로 보관되며, 배송 완료 후 정산됩니다.
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
