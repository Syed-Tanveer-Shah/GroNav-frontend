import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../Utils/Axios'
import { toast } from 'react-toastify'
import { trackProductView, trackJourney, initScrollTracking } from '../services/trackingService'
import { useAuth } from '../hooks/useAuth'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  // eslint-disable-next-line no-unused-vars
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [storeDetails, setStoreDetails] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { isLoggedIn, token } = useAuth()

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/ratings/product/${productId}/`)
      console.log("REVIEWS:", res.data)
      const reviewList = Array.isArray(res.data) ? res.data : (res.data.results || [])
      setReviews(reviewList)
    } catch (err) {
      console.log("Reviews error:", err.response?.data)
    }
  }

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    if (productId) {
      trackProductView(productId)
      trackJourney('view', productId, product?.store_id || storeDetails?.store_id)
      const cleanup = initScrollTracking(productId, null)
      return cleanup
    }
  }, [productId, product?.store_id, storeDetails?.store_id])


  const fetchProduct = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/products/${productId}/`)
      setProduct(res.data)
      // Fetch store details
      const storeRes = await api.get(`/api/product/${productId}/store/`)
      setStoreDetails(storeRes.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }
    trackJourney('cart', productId, storeDetails?.store_id)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.product_id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ product_id: product.id, name: product.name, price: product.price, image: product.image, quantity })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success('Added to cart!')
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }
    trackJourney('checkout', productId, storeDetails?.store_id)
    navigate('/delivery', {
      state: {
        product: product,
        quantity: quantity,
      },
    })
  }


  const handleSubmitReview = async () => {
    if (!isLoggedIn) { toast.error('Please login to submit a review'); return }
    setSubmittingReview(true)
    try {
      await api.post(`/api/ratings/product/${productId}/`, newReview, {
        headers: { Authorization: `Token ${token}` }
      })
      toast.success('Review submitted!')
      setNewReview({ rating: 5, comment: '' })
      await fetchReviews()
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }


  if (loading) return <div style={{padding:'60px',textAlign:'center',color:'#888'}}>Loading product...</div>
  if (!product) return <div style={{padding:'60px',textAlign:'center',color:'#888'}}>Product not found</div>

  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0
  const ratingCounts = [5,4,3,2,1].map(r => ({ stars: r, count: reviews.filter(rv => rv.rating === r).length }))

  return (
    <div style={{maxWidth:'1200px', margin:'0 auto', padding:'24px 16px'}}>

      {/* Breadcrumb */}
      <div style={{fontSize:'13px', color:'#888', marginBottom:'16px'}}>
        <span style={{cursor:'pointer', color:'#6aaa00'}} onClick={() => navigate('/')}>Home</span>
        {' > '}
        <span style={{cursor:'pointer', color:'#6aaa00'}} onClick={() => navigate('/product-list')}>{product.category_name}</span>
        {' > '}
        <span>{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="product-detail-main-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', background:'#fff', borderRadius:'14px', padding:'28px', marginBottom:'24px', border:'1px solid #eee'}}>

        {/* Left — Images */}
        <div>
          <div style={{width:'100%', height:'380px', background:'#f8f8f8', borderRadius:'12px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <img src={product.image} alt={product.name}
              loading="lazy"
              width="380"
              height="380"
              style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain', display:'block'}}
              onError={(e) => { e.target.src = '/placeholder.png'; }} />
          </div>
          {/* Thumbnails */}
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
            <div style={{width:'60px', height:'60px', border:'2px solid #6aaa00', borderRadius:'8px', overflow:'hidden', cursor:'pointer'}}>
              <img src={product.image || '/placeholder.png'} alt="" 
                loading="lazy"
                width="60"
                height="60"
                style={{width:'100%', height:'100%', objectFit:'cover'}} 
                onError={e => e.target.src='/placeholder.png'} />
            </div>
          </div>
        </div>

        {/* Right — Details */}
        <div>
          {/* Store name */}
          {storeDetails && (
            <p style={{fontSize:'13px', color:'#6aaa00', marginBottom:'6px', cursor:'pointer'}} onClick={() => navigate(`/store/${storeDetails.store_id}`)}>
              Store: {storeDetails.store_name}
            </p>
          )}

          <h1 style={{fontSize:'22px', fontWeight:'700', color:'#222', marginBottom:'12px', lineHeight:'1.3'}}>{product.name}</h1>

          {/* Rating summary */}
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px'}}>
            <div style={{color:'#f0a500', fontSize:'16px'}}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5-Math.round(avgRating))}</div>
            <span style={{fontSize:'13px', color:'#888'}}>{avgRating}/5 · {reviews.length} Ratings</span>
          </div>

          {/* Price */}
          <div style={{marginBottom:'16px'}}>
            {product.discount_active && product.discount_percentage ? (
              <>
                <div style={{fontSize:'26px', fontWeight:'700', color:'#e53935'}}>Rs. {Math.round(product.price * (1 - product.discount_percentage/100))}</div>
                <div style={{fontSize:'14px', color:'#888', textDecoration:'line-through'}}>Rs. {product.price}</div>
                <div style={{display:'inline-block', background:'#ffebee', color:'#e53935', fontSize:'12px', padding:'2px 8px', borderRadius:'4px', fontWeight:'600'}}>{product.discount_percentage}% OFF</div>
              </>
            ) : (
              <div style={{fontSize:'26px', fontWeight:'700', color:'#222'}}>Rs. {product.price}</div>
            )}
          </div>

          {/* Stock */}
          <div style={{marginBottom:'16px'}}>
            {product.stock > 0
              ? <span style={{color:'#2e7d32', fontWeight:'600', fontSize:'13px'}}>✓ In Stock ({product.stock} available)</span>
              : <span style={{color:'#e53935', fontWeight:'600', fontSize:'13px'}}>✗ Out of Stock</span>
            }
          </div>

          {/* Delivery info */}
          <div style={{background:'#f8fdf2', borderRadius:'10px', padding:'14px', marginBottom:'16px', border:'1px solid #e8f0d8'}}>
            <p style={{fontSize:'13px', fontWeight:'600', color:'#333', marginBottom:'8px'}}>Delivery Options</p>
            {storeDetails && <p style={{fontSize:'12px', color:'#555', margin:'0 0 4px'}}>📍 {storeDetails.city}</p>}
            <p style={{fontSize:'12px', color:'#555', margin:'0 0 4px'}}>🚚 Standard Delivery</p>
            <p style={{fontSize:'12px', color:'#555', margin:0}}>💵 Cash on Delivery Available</p>
          </div>

          {/* Quantity */}
          <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px'}}>
            <span style={{fontSize:'13px', fontWeight:'600', color:'#555'}}>Quantity:</span>
            <div style={{display:'flex', alignItems:'center', border:'1px solid #ddd', borderRadius:'8px', overflow:'hidden'}}>
              <button onClick={() => setQuantity(q => Math.max(1, q-1))} style={{width:'36px', height:'36px', border:'none', background:'#f5f5f5', cursor:'pointer', fontSize:'18px', fontWeight:'700'}}>−</button>
              <span style={{width:'40px', textAlign:'center', fontWeight:'600', fontSize:'15px'}}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q+1))} style={{width:'36px', height:'36px', border:'none', background:'#f5f5f5', cursor:'pointer', fontSize:'18px', fontWeight:'700'}}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-detail-action-btns" style={{display:'flex', gap:'12px', marginBottom:'16px'}}>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              style={{flex:1, padding:'13px', background:'#6aaa00', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'14px', cursor:'pointer'}}>
              Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0}
              style={{flex:1, padding:'13px', background:'#ff6f00', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'14px', cursor:'pointer'}}>
              Buy Now
            </button>
          </div>

          {/* Store info */}
          {storeDetails && (
            <div style={{border:'1px solid #eee', borderRadius:'10px', padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <p style={{fontSize:'12px', color:'#888', margin:'0 0 4px'}}>Sold by</p>
                <p style={{fontSize:'13px', fontWeight:'600', color:'#222', margin:0, cursor:'pointer'}}
                  onClick={() => navigate(`/store/${storeDetails.store_id}`)}>
                  {storeDetails.store_name}
                </p>
              </div>
              {storeDetails.seller_type === 'physical' ? (
                <button onClick={() => window.open(storeDetails.google_maps_url, '_blank')}
                  style={{padding:'8px 16px', background:'#f0f9e0', color:'#6aaa00', border:'1px solid #6aaa00', borderRadius:'6px', fontWeight:'600', fontSize:'12px', cursor:'pointer'}}>
                  Navigate to Store
                </button>
              ) : (
                <button onClick={() => navigate(`/store/${storeDetails.store_id}`)}
                  style={{padding:'8px 16px', background:'#f0f9e0', color:'#6aaa00', border:'1px solid #6aaa00', borderRadius:'6px', fontWeight:'600', fontSize:'12px', cursor:'pointer'}}>
                  Visit Store
                </button>
              )}
            </div>
          )}


        </div>
      </div>

      {/* Product Details Section */}
      <div style={{background:'#fff', borderRadius:'14px', padding:'24px', marginBottom:'24px', border:'1px solid #eee'}}>
        <h3 style={{fontSize:'16px', fontWeight:'700', color:'#222', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #f0f0f0'}}>Product Details</h3>
        <p style={{fontSize:'13px', fontWeight:'600', color:'#888', marginBottom:'6px'}}>Product details of {product.name}</p>
        <p style={{fontSize:'14px', fontWeight:'600', color:'#222', marginBottom:'16px'}}>{product.name}</p>
        {product.description && (
          <>
            <p style={{fontSize:'13px', fontWeight:'600', color:'#888', marginBottom:'6px'}}>Description</p>
            <p style={{fontSize:'14px', color:'#555', lineHeight:'1.7', marginBottom:'16px'}}>{product.description}</p>
          </>
        )}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div style={{background:'#f8f8f8', borderRadius:'8px', padding:'12px'}}>
            <p style={{fontSize:'12px', color:'#888', margin:'0 0 4px'}}>Category</p>
            <p style={{fontSize:'13px', fontWeight:'600', color:'#222', margin:0}}>{product.category_name}</p>
          </div>
          {product.expiry_date && (
            <div style={{background:'#f8f8f8', borderRadius:'8px', padding:'12px'}}>
              <p style={{fontSize:'12px', color:'#888', margin:'0 0 4px'}}>Expiry Date</p>
              <p style={{fontSize:'13px', fontWeight:'600', color:'#222', margin:0}}>{product.expiry_date}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div style={{background:'#fff', borderRadius:'14px', padding:'24px', border:'1px solid #eee'}}>
        <h3 style={{fontSize:'16px', fontWeight:'700', color:'#222', marginBottom:'20px', paddingBottom:'10px', borderBottom:'1px solid #f0f0f0'}}>Ratings & Reviews of {product.name}</h3>

        {/* Rating Summary */}
        <div style={{display:'flex', gap:'32px', marginBottom:'24px', padding:'20px', background:'#f8fdf2', borderRadius:'12px', border:'1px solid #e8f0d8'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'48px', fontWeight:'700', color:'#222', lineHeight:1}}>{avgRating}</div>
            <div style={{color:'#f0a500', fontSize:'20px', margin:'6px 0'}}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5-Math.round(avgRating))}</div>
            <div style={{fontSize:'13px', color:'#888'}}>{reviews.length} Ratings</div>
          </div>
          <div style={{flex:1}}>
            {ratingCounts.map(({stars, count}) => (
              <div key={stars} style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                <span style={{fontSize:'12px', color:'#888', width:'20px'}}>{stars}★</span>
                <div style={{flex:1, background:'#e0e0e0', borderRadius:'4px', height:'8px'}}>
                  <div style={{width:`${reviews.length ? (count/reviews.length*100) : 0}%`, background:'#6aaa00', height:'8px', borderRadius:'4px'}} />
                </div>
                <span style={{fontSize:'12px', color:'#888', width:'16px'}}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review */}
        {!isLoggedIn ? (
          <div style={{padding:'20px',background:'#f8fdf2',borderRadius:'12px',textAlign:'center',border:'1px solid #c0dd97'}}>
            <div style={{fontSize:'24px',marginBottom:'8px'}}>⭐</div>
            <p style={{fontSize:'13px',fontWeight:'500',color:'#3b7000',marginBottom:'4px'}}>Want to review this product?</p>
            <p style={{fontSize:'12px',color:'#888',marginBottom:'14px'}}>Please login to submit a review</p>
            <button onClick={() => document.getElementById('signInBtn')?.click()} style={{padding:'8px 24px',background:'#6aaa00',color:'#fff',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>
              Login to Review
            </button>
          </div>
        ) : (
          <div style={{marginBottom:'24px', padding:'20px', border:'1px solid #e8f0d8', borderRadius:'12px'}}>
            <h4 style={{fontSize:'14px', fontWeight:'700', color:'#222', marginBottom:'12px'}}>Write a Review</h4>
            <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
              {[1,2,3,4,5].map(s => (
                <span key={s} onClick={() => setNewReview(p => ({...p, rating:s}))}
                  style={{fontSize:'28px', cursor:'pointer', color: s <= newReview.rating ? '#f0a500' : '#ddd'}}>★</span>
              ))}
            </div>
            <textarea
              value={newReview.comment}
              onChange={e => setNewReview(p => ({...p, comment: e.target.value}))}
              placeholder="Share your experience with this product..."
              rows={3}
              style={{width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:'8px', fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', marginBottom:'10px'}}
            />
            <button onClick={handleSubmitReview} disabled={submittingReview}
              style={{padding:'10px 24px', background:'#6aaa00', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'13px', cursor:'pointer'}}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0
          ? <p style={{textAlign:'center', color:'#bbb', padding:'20px'}}>No reviews yet — be the first to review!</p>
          : reviews.map((review, i) => (
            <div key={i} style={{padding:'16px 0', borderBottom:'1px solid #f5f5f5'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#f0f9e0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', color:'#6aaa00', fontSize:'13px'}}>
                    {(review.user_name || review.user?.username || review.user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{fontSize:'13px', fontWeight:'600', color:'#222'}}>
                    {review.user_name || review.user?.username || review.user?.email || 'User'}
                  </span>
                  <span style={{fontSize:'11px', background:'#e8f5e9', color:'#2e7d32', padding:'2px 8px', borderRadius:'10px', fontWeight:'600'}}>Verified Purchase</span>
                </div>
                <span style={{fontSize:'12px', color:'#aaa'}}>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{color:'#f0a500', fontSize:'14px', marginBottom:'6px'}}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</div>
              <p style={{fontSize:'13px', color:'#555', margin:0, lineHeight:'1.6'}}>
                {review.comment || review.review || review.text || ''}
              </p>
            </div>
          ))
        }
      </div>

      {showLoginPrompt && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setShowLoginPrompt(false)}>
          <div style={{background:'#fff',borderRadius:'14px',padding:'28px',maxWidth:'340px',width:'90%',textAlign:'center'}} onClick={e => e.stopPropagation()}>
            <div style={{fontSize:'36px',marginBottom:'12px'}}>🔒</div>
            <h3 style={{fontSize:'16px',fontWeight:'500',color:'#222',marginBottom:'8px'}}>Login Required</h3>
            <p style={{fontSize:'13px',color:'#888',marginBottom:'20px',lineHeight:'1.6'}}>Please login to add items to your cart or shopping list</p>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={() => setShowLoginPrompt(false)} style={{flex:1,padding:'10px',border:'1px solid #e0e0e0',borderRadius:'8px',background:'#fff',cursor:'pointer',fontSize:'13px',color:'#555'}}>
                Cancel
              </button>
              <button onClick={() => { setShowLoginPrompt(false); document.getElementById('signInBtn')?.click() }} style={{flex:1,padding:'10px',border:'none',borderRadius:'8px',background:'#6aaa00',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'500'}}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
