import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../Utils/Axios'
import Product from './include/Product'
import { toast } from 'react-toastify'
import { trackStoreView, initScrollTracking } from '../services/trackingService'
import { useAuth } from '../hooks/useAuth'

export default function StoreDetail() {
  const { storeId } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [storeReviews, setStoreReviews] = useState([])
  const [newStoreReview, setNewStoreReview] = useState({ rating: 5, review: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [avgRating, setAvgRating] = useState(0)
  const { isLoggedIn, token } = useAuth()

  const fetchStoreReviews = async () => {
    try {
      const res = await api.get(`/api/ratings/store/${storeId}/`)
      const list = Array.isArray(res.data) ? res.data : (res.data.results || [])
      setStoreReviews(list)
      if (list.length) {
        const avg = list.reduce((a, b) => a + b.rating, 0) / list.length
        setAvgRating(avg.toFixed(1))
      }
    } catch (err) {
      console.log("Store reviews error:", err)
    }
  }

  useEffect(() => {
    fetchStoreAndProducts()
    fetchStoreReviews()
    if (storeId) {
      trackStoreView(storeId)
      const cleanup = initScrollTracking(null, storeId)
      return cleanup
    }
  }, [storeId])


  const fetchStoreAndProducts = async () => {
    try {
      const [storeRes, productsRes] = await Promise.all([
        api.get(`/api/stores/${storeId}/`),
        api.get(`/api/products/?store=${storeId}`)
      ])
      setStore(storeRes.data)
      setProducts(productsRes.data?.results || productsRes.data || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitStoreReview = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to submit a review')
      return
    }
    setSubmittingReview(true)
    try {
      await api.post(`/api/ratings/store/${storeId}/`, newStoreReview, {
        headers: { Authorization: `Token ${token}` }
      })
      toast.success('Review submitted!')
      setNewStoreReview({ rating: 5, review: '' })
      await fetchStoreReviews()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>
  if (!store) return <div style={{padding:'40px',textAlign:'center'}}>Store not found</div>

  return (
    <div style={{maxWidth:'1200px',margin:'0 auto',padding:'24px'}}>
      {/* Store Header */}
      <div style={{background:'#fff',borderRadius:'14px',padding:'24px',marginBottom:'24px',border:'1px solid #eee',display:'flex',alignItems:'center',gap:'20px'}}>
        <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#f0f9e0', border:'3px solid #6aaa00', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {store.logo_url
            ? <img src={store.logo_url} alt={store.name}
                style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                onError={e => { e.target.style.display='none' }} />
            : <span style={{fontSize:'28px', fontWeight:'700', color:'#6aaa00'}}>{store.name?.[0]}</span>
          }
        </div>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
            <h2 style={{margin:0,fontSize:'22px',fontWeight:'700'}}>{store.name}</h2>
            <span style={{background: store.is_open ? '#e8f5e9' : '#ffebee', color: store.is_open ? '#2e7d32' : '#c62828', padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>
              {store.is_open ? 'Open' : 'Closed'}
            </span>
            <span style={{background:'#e3f2fd',color:'#1565c0',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>
              {store.seller_type === 'online' ? 'Online' : 'Physical'}
            </span>
          </div>
          <p style={{margin:'0 0 4px',fontSize:'14px',color:'#555'}}>📍 {store.address}, {store.city}</p>
          <p style={{margin:'0 0 4px',fontSize:'14px',color:'#555'}}>📞 {store.phone}</p>
          <p style={{margin:0,fontSize:'13px',color:'#888'}}>🕐 {store.opening_hours}</p>
        </div>
      </div>

      {/* Products Grid */}
      <h3 style={{fontSize:'18px',fontWeight:'700',marginBottom:'16px'}}>Products ({products.length})</h3>
      {products.length === 0
        ? <div style={{textAlign:'center',padding:'60px',color:'#bbb'}}>No products in this store yet</div>
        : <div className="row g-4">
            {products.map(p => (
              <Product key={p.id} item={p} />
            ))}
          </div>
      }

      {/* Store Ratings & Reviews Section */}
      <div style={{background:'#fff', borderRadius:'14px', padding:'24px', marginTop:'24px', border:'1px solid #eee'}}>
        <h3 style={{fontSize:'16px', fontWeight:'700', color:'#222', marginBottom:'20px', paddingBottom:'10px', borderBottom:'1px solid #f0f0f0'}}>
          Ratings & Reviews
        </h3>

        {/* Rating Summary */}
        <div style={{display:'flex', gap:'32px', marginBottom:'24px', padding:'20px', background:'#f8fdf2', borderRadius:'12px', border:'1px solid #e8f0d8'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'48px', fontWeight:'700', color:'#222', lineHeight:1}}>{avgRating || 0}</div>
            <div style={{color:'#f0a500', fontSize:'20px', margin:'6px 0'}}>
              {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            </div>
            <div style={{fontSize:'13px', color:'#888'}}>{storeReviews.length} Reviews</div>
          </div>
          <div style={{flex:1}}>
            {[5,4,3,2,1].map(star => {
              const count = storeReviews.filter(r => r.rating === star).length
              return (
                <div key={star} style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                  <span style={{fontSize:'12px', color:'#888', width:'20px'}}>{star}★</span>
                  <div style={{flex:1, background:'#e0e0e0', borderRadius:'4px', height:'8px'}}>
                    <div style={{width:`${storeReviews.length ? (count/storeReviews.length*100) : 0}%`, background:'#6aaa00', height:'8px', borderRadius:'4px'}} />
                  </div>
                  <span style={{fontSize:'12px', color:'#888', width:'16px'}}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Write Review Form */}
        {!isLoggedIn ? (
          <div style={{padding:'20px',background:'#f8fdf2',borderRadius:'12px',textAlign:'center',border:'1px solid #c0dd97'}}>
            <p style={{fontSize:'13px',fontWeight:'500',color:'#3b7000',marginBottom:'4px'}}>Want to rate this store?</p>
            <p style={{fontSize:'12px',color:'#888',marginBottom:'14px'}}>Please login to submit a review</p>
            <button onClick={() => document.getElementById('signInBtn')?.click()} style={{padding:'8px 24px',background:'#6aaa00',color:'#fff',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>
              Login to Review
            </button>
          </div>
        ) : (
          <div style={{marginBottom:'24px', padding:'20px', border:'1px solid #e8f0d8', borderRadius:'12px'}}>
            <h4 style={{fontSize:'14px', fontWeight:'700', color:'#222', marginBottom:'12px'}}>Write a Review</h4>
            <div style={{display:'flex', gap:'6px', marginBottom:'12px'}}>
              {[1,2,3,4,5].map(s => (
                <span
                  key={s}
                  onClick={() => setNewStoreReview(p => ({...p, rating: s}))}
                  style={{fontSize:'32px', cursor:'pointer', color: s <= newStoreReview.rating ? '#f0a500' : '#ddd', transition:'color 0.15s'}}
                >★</span>
              ))}
            </div>
            <textarea
              value={newStoreReview.review}
              onChange={e => setNewStoreReview(p => ({...p, review: e.target.value}))}
              placeholder="Share your experience with this store..."
              rows={3}
              style={{width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:'8px', fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', marginBottom:'12px'}}
            />
            <button
              onClick={handleSubmitStoreReview}
              disabled={submittingReview}
              style={{padding:'10px 24px', background:'#6aaa00', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'13px', cursor: submittingReview ? 'not-allowed' : 'pointer', opacity: submittingReview ? 0.7 : 1}}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Reviews List */}
        {storeReviews.length === 0
          ? <p style={{textAlign:'center', color:'#bbb', padding:'20px'}}>No reviews yet — be the first to review this store!</p>
          : storeReviews.map((review, i) => (
            <div key={i} style={{padding:'16px 0', borderBottom: i < storeReviews.length-1 ? '1px solid #f5f5f5' : 'none'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#f0f9e0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', color:'#6aaa00', fontSize:'13px'}}>
                    {(review.user_name || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{fontSize:'13px', fontWeight:'600', color:'#222'}}>{review.user_name || 'User'}</span>
                </div>
                <span style={{fontSize:'12px', color:'#aaa'}}>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{color:'#f0a500', fontSize:'14px', marginBottom:'6px'}}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <p style={{fontSize:'13px', color:'#555', margin:0, lineHeight:'1.6'}}>{review.review || ''}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}
