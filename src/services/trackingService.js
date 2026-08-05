import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

const getSessionId = () => {
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('session_id', sid)
  }
  return sid
}

export const trackStoreView = async (storeId) => {
  if (!storeId) return
  try {
    await axios.post(`${BASE_URL}/api/track/store-view/`, {
      store_id: storeId,
      session_id: getSessionId()
    })
    console.log('Store view tracked:', storeId)
  } catch (err) {
    console.log('Track store view error:', err)
  }
}

export const trackProductView = async (productId) => {
  if (!productId) return
  try {
    await axios.post(`${BASE_URL}/api/track/product-view/`, {
      product_id: productId,
      session_id: getSessionId()
    })
    console.log('Product view tracked:', productId)
  } catch (err) {
    console.log('Track product view error:', err)
  }
}

export const trackJourney = async (step, productId, storeId) => {
  if (!step) return
  try {
    await axios.post(`${BASE_URL}/api/track/journey/`, {
      step: step,
      product_id: productId,
      store_id: storeId,
      session_id: getSessionId()
    })
    console.log('Journey tracked:', step)
  } catch (err) {
    console.log('Track journey error:', err)
  }
}

export const trackHeatmap = async (section, depth, productId = null, storeId = null) => {
  try {
    await axios.post(`${BASE_URL}/api/track/heatmap/`, {
      section: section,
      depth: depth,
      product_id: productId,
      store_id: storeId,
      session_id: getSessionId()
    })
  } catch (err) {
    console.log('Track heatmap error:', err)
  }
}

// Scroll tracking — call this on product/store pages:
export const initScrollTracking = (productId = null, storeId = null) => {
  const sections = [
    { name: 'images', threshold: 10 },
    { name: 'price', threshold: 25 },
    { name: 'description', threshold: 50 },
    { name: 'reviews', threshold: 75 },
    { name: 'related', threshold: 90 },
  ]
  const tracked = new Set()
  let debounceTimer = null

  const handleScroll = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const scrollPct = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      sections.forEach(({ name, threshold }) => {
        if (scrollPct >= threshold && !tracked.has(name)) {
          tracked.add(name)
          trackHeatmap(name, scrollPct, productId, storeId)
        }
      })
    }, 1000)
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}
