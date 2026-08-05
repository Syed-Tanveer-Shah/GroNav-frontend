import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../Utils/Axios';
import JourneyFunnel from '../../components/seller/JourneyFunnel';
import { useTheme } from '../../context/ThemeContext';
import { Select, Table, Spin } from 'antd';

const G = '#6aaa00';
const TABS = [
  { id: 'visitors',    label: '📈 Visitors' },
  { id: 'heatmap',     label: '🌡️ Heatmap' },
  { id: 'journey',     label: '🔀 Journey' },
  { id: 'best-times',  label: '⏰ Best Times' },
  { id: 'competitors', label: '⚔️ Competitors' },
  { id: 'ratings',     label: '⭐ Ratings' },
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// All data fetched from API endpoints

export default function SellerAnalytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark-pro';
  const cardBg = isDark ? '#1e2e1e' : '#fff';
  const textColor = isDark ? '#e0ffe0' : '#222';
  const mutedText = isDark ? '#8fa88f' : '#888';
  const borderColor = isDark ? '#2a3a2a' : '#eee';

  const [tab, setTab] = useState('visitors');
  const [visitorsData, setVisitorsData] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [journeyData, setJourneyData] = useState([]);
  const [bestTimesData, setBestTimesData] = useState({grid:[], prediction:[]});
  const [competitorData, setCompetitorData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [ratingsData, setRatingsData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [storeId, setStoreId] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  // BUG 1 FIX: track the last fetch key to prevent duplicate renders from StrictMode
  const fetchKeyRef = useRef(null);
  // Analytics cache: { data, timestamp }
  const analyticsCacheRef = useRef(null);
  // Prevent duplicate concurrent analytics fetches
  const isFetchingAnalytics = useRef(false);
  const CACHE_TTL_MS = 60000; // 60 seconds

  useEffect(() => {
    if (selectedCategory === 'All Categories' || !storeId) {
      setCategoryProducts([]);
      fetchKeyRef.current = null;
      return;
    }

    // BUG 1 FIX: skip if we already fetched for this exact (category, store) pair
    const fetchKey = `${selectedCategory}::${storeId}`;
    if (fetchKeyRef.current === fetchKey) return;
    fetchKeyRef.current = fetchKey;

    let active = true;

    const fetchCategoryProducts = async () => {
      setCategoryLoading(true);
      try {
        const res = await api.get(`/api/products/?category=${encodeURIComponent(selectedCategory)}`);
        const allProducts = Array.isArray(res.data) ? res.data : (res.data?.results || []);

        if (active) {
          const myProducts = allProducts.filter(p => p.store === storeId);
          const otherProducts = allProducts.filter(p => p.store !== storeId);

          const computed = myProducts.map(myProd => {
            const comps = otherProducts.filter(
              p => p.name && myProd.name && p.name.toLowerCase().trim() === myProd.name.toLowerCase().trim()
            );
            const compStoresCount = new Set(comps.map(c => c.store).filter(Boolean)).size;

            // Use per-product market average if competitors sell same product name;
            // otherwise fall back to category-level market average from summary table
            const productMarketAvg = comps.length > 0
              ? comps.reduce((sum, c) => sum + parseFloat(c.price), 0) / comps.length
              : null;

            const categorySummary = competitorData.find(
              row => row.category && row.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
            );
            const categoryMarketAvg = categorySummary ? parseFloat(categorySummary.market_avg) : null;

            // Prefer per-product avg; fall back to category avg so status aligns with summary table
            const effectiveMarketAvg = productMarketAvg !== null ? productMarketAvg : categoryMarketAvg;

            let status = 'Competitive';
            if (effectiveMarketAvg !== null && effectiveMarketAvg > 0) {
              const myPrice = parseFloat(myProd.price);
              const margin = effectiveMarketAvg * 0.05;
              if (myPrice > effectiveMarketAvg + margin) {
                status = 'Overpriced';
              } else if (myPrice < effectiveMarketAvg - margin) {
                status = 'Underpriced';
              }
            }

            return {
              key: myProd.id,
              name: myProd.name,
              my_price: myProd.price,
              market_avg: effectiveMarketAvg !== null ? parseFloat(effectiveMarketAvg.toFixed(2)) : null,
              competitors_count: compStoresCount,
              status: status,
            };
          });

          setCategoryProducts(computed);
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
        if (active) {
          setCategoryProducts([]);
          fetchKeyRef.current = null; // allow retry on error
        }
      } finally {
        if (active) {
          setCategoryLoading(false);
        }
      }
    };

    fetchCategoryProducts();

    return () => {
      active = false;
    };
  }, [selectedCategory, storeId]);

  const categoryColumns = [
    {
      title: 'PRODUCT NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: '500', color: textColor }}>{text}</span>,
    },
    {
      title: 'MY PRICE',
      dataIndex: 'my_price',
      key: 'my_price',
      render: (val) => <span style={{ fontWeight: '700', color: textColor }}>Rs. {val}</span>,
    },
    {
      title: 'MARKET AVG PRICE',
      dataIndex: 'market_avg',
      key: 'market_avg',
      render: (val) => val !== null ? <span style={{ color: textColor }}>Rs. {val}</span> : <span style={{ color: mutedText }}>N/A</span>,
    },
    {
      title: 'COMPETITORS SELLING THIS',
      dataIndex: 'competitors_count',
      key: 'competitors_count',
      render: (val) => <span style={{ color: textColor }}>{val}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'Competitive') {
          return <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>Competitive</span>;
        } else if (status === 'Overpriced') {
          return <span style={{ background: '#ffebee', color: '#c62828', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>Overpriced</span>;
        } else {
          return <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>Underpriced</span>;
        }
      }
    }
  ];

  // Theme properties declared at the top of the component

  const fetchAllAnalytics = async (force = false) => {
    // Use cached data if fresh and not forcing a refresh
    if (!force && analyticsCacheRef.current && (Date.now() - analyticsCacheRef.current.timestamp < CACHE_TTL_MS)) {
      const d = analyticsCacheRef.current.data;
      setVisitorsData(d.visitorsData);
      setPeakHours(d.peakHours);
      setHeatmapData(d.heatmapData);
      setJourneyData(d.journeyData);
      setBestTimesData(d.bestTimesData);
      setCompetitorData(d.competitorData);
      setRatingsData(d.ratingsData);
      setTopProducts(d.topProducts);
      if (d.storeId) setStoreId(d.storeId);
      setLoading(false);
      return;
    }
    // Prevent duplicate concurrent fetches (StrictMode double-invoke guard)
    if (isFetchingAnalytics.current) return;
    isFetchingAnalytics.current = true;
    try {
      const [v, p, h, j, bt, c, r, tp, s] = await Promise.all([
        api.get('/api/seller/analytics/visitors/'),
        api.get('/api/seller/analytics/peak-hours/'),
        api.get('/api/seller/analytics/heatmap/'),
        api.get('/api/seller/analytics/journey/'),
        api.get('/api/seller/analytics/best-times/'),
        api.get('/api/seller/analytics/competitor-prices/'),
        api.get('/api/seller/analytics/ratings-breakdown/'),
        api.get('/api/seller/analytics/top-products/'),
        api.get('/api/seller/store/'),
      ]);
      const newStoreId = (s.data && s.data.id) ? s.data.id : null;
      const cached = {
        visitorsData: Array.isArray(v.data) ? v.data : [],
        peakHours: Array.isArray(p.data) ? p.data : [],
        heatmapData: Array.isArray(h.data) ? h.data : [],
        journeyData: Array.isArray(j.data) ? j.data : [],
        bestTimesData: bt.data?.grid ? bt.data : {grid:[], prediction:[]},
        competitorData: Array.isArray(c.data) ? c.data : [],
        ratingsData: Array.isArray(r.data) ? r.data : [],
        topProducts: Array.isArray(tp.data) ? tp.data : [],
        storeId: newStoreId,
      };
      analyticsCacheRef.current = { data: cached, timestamp: Date.now() };
      setVisitorsData(cached.visitorsData);
      setPeakHours(cached.peakHours);
      setHeatmapData(cached.heatmapData);
      setJourneyData(cached.journeyData);
      setBestTimesData(cached.bestTimesData);
      setCompetitorData(cached.competitorData);
      setRatingsData(cached.ratingsData);
      setTopProducts(cached.topProducts);
      if (newStoreId) setStoreId(newStoreId);
    } catch (err) {
      console.log('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      isFetchingAnalytics.current = false;
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
    const interval = setInterval(() => fetchAllAnalytics(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const uniqueCategories = [
    ...new Set(competitorData.map(row => row.category).filter(Boolean))
  ];

  const filteredCompetitors = selectedCategory === 'All Categories'
    ? competitorData
    : competitorData.filter(row => row.category === selectedCategory);

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 18px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '700',
            fontSize: '13px', transition: 'all 0.2s',
            backgroundColor: tab === t.id ? G : (isDark ? '#2a3a2a' : '#f0f0f0'),
            color: tab === t.id ? '#fff' : (isDark ? '#8fa88f' : '#555'),
            transform: tab === t.id ? 'translateY(-1px)' : 'none',
            boxShadow: tab === t.id ? '0 4px 14px rgba(106,170,0,0.35)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ background: cardBg, borderRadius: '14px', padding: '28px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none', minHeight: '420px' }}>
        {loading ? <div style={{ textAlign: 'center', padding: '80px', color: '#bbb' }}>Loading...</div> : (
          <>
            {tab === 'visitors' && (
              visitorsData.length === 0
                ? <div style={{textAlign:'center',padding:'60px',color:'#888'}}>
                    <p style={{fontWeight:'500'}}>No visitor data yet</p>
                    <p style={{fontSize:'12px',marginTop:'4px'}}>Data appears as customers visit your store</p>
                  </div>
                : <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={visitorsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{fontSize:11}} />
                      <YAxis tick={{fontSize:11}} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="visitors" stroke="#6aaa00" strokeWidth={2} name="Store Visitors" dot={false} />
                      <Line type="monotone" dataKey="product_views" stroke="#85b7eb" strokeWidth={2} name="Product Views" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
            )}

            {tab === 'heatmap' && (
              heatmapData.length === 0
                ? <div style={{textAlign:'center',padding:'60px',color:'#888'}}>
                    <p style={{fontWeight:'500'}}>No heatmap data yet</p>
                    <p style={{fontSize:'12px',marginTop:'4px'}}>Data appears as customers scroll through your products</p>
                  </div>
                : heatmapData.map((item, i) => {
                    const pct = Math.min(100, Math.round(item.avg_scroll_depth || 0))
                    const r = Math.round(26 + (pct/100)*200)
                    const g = Math.round(170 - (pct/100)*100)
                    return (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                        <span style={{fontSize:'12px',color:'#555',width:'120px',flexShrink:0}}>{item.section}</span>
                        <div style={{flex:1,height:'24px',borderRadius:'4px',background:`rgba(${r},${g+50},26,${0.3+(pct/100)*0.7})`}} />
                        <span style={{fontSize:'11px',color:'#888',width:'40px'}}>{pct}%</span>
                        <span style={{fontSize:'11px',color:'#aaa',width:'60px'}}>{item.view_count} views</span>
                      </div>
                    )
                  })
            )}

            {tab === 'journey' && (
              journeyData.length === 0
                ? <div style={{textAlign:'center',padding:'60px',color:'#888'}}>
                    <p style={{fontWeight:'500'}}>No journey data yet</p>
                    <p style={{fontSize:'12px',marginTop:'4px'}}>Data appears as customers interact with your products</p>
                  </div>
                : journeyData.map((item, i) => {
                    const maxCount = journeyData[0]?.count || 1
                    const width = Math.max(10, Math.round((item.count / maxCount) * 100))
                    return (
                      <div key={i} style={{marginBottom:'12px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px'}}>
                          <span style={{fontSize:'12px',color:'#555',width:'80px'}}>{item.step}</span>
                          <div style={{flex:1,height:'32px',borderRadius:'4px',background:'#6aaa00',width:`${width}%`,display:'flex',alignItems:'center',paddingLeft:'10px'}}>
                            <span style={{fontSize:'12px',color:'#fff',fontWeight:'500'}}>{item.count?.toLocaleString()}</span>
                          </div>
                          <span style={{fontSize:'11px',color:'#888',width:'50px'}}>{item.conversion_rate}%</span>
                        </div>
                      </div>
                    )
                  })
            )}

            {tab === 'best-times' && (
              (!bestTimesData?.grid || bestTimesData.grid.length === 0)
                ? <div style={{textAlign:'center',padding:'60px',color:'#888'}}>
                    <p style={{fontWeight:'500'}}>No timing data yet</p>
                    <p style={{fontSize:'12px',marginTop:'4px'}}>Data appears after customers visit your store</p>
                  </div>
                : <>
                    <div style={{overflowX:'auto',marginBottom:'16px'}}>
                      <div style={{display:'grid',gridTemplateColumns:'60px repeat(24,1fr)',gap:'2px',minWidth:'700px'}}>
                        <div style={{fontSize:'10px',color:'#888'}}></div>
                        {Array.from({length:24},(_,h)=>(
                          <div key={h} style={{fontSize:'9px',color:'#888',textAlign:'center'}}>{h}</div>
                        ))}
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day,d)=>(
                          <React.Fragment key={day}>
                            <div style={{fontSize:'10px',color:'#555',display:'flex',alignItems:'center'}}>{day}</div>
                            {Array.from({length:24},(_,h)=>{
                              const cell = bestTimesData.grid.find(g=>g.day_of_week===(d+1)&&g.hour===h)
                              const score = cell?.traffic_score || 0
                              const maxScore = Math.max(...bestTimesData.grid.map(g=>g.traffic_score||0),1)
                              const intensity = score/maxScore
                              return <div key={`${d}-${h}`} style={{height:'18px',borderRadius:'2px',background:`rgba(106,170,0,${0.1+intensity*0.9})`}} title={`${score} visitors`} />
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    {bestTimesData.prediction?.length > 0 && (
                      <div style={{background:'#f0f9e0',borderRadius:'8px',padding:'12px 16px',fontSize:'13px',color:'#3b7000'}}>
                        Best selling times: {bestTimesData.prediction.join(' · ')}
                      </div>
                    )}
                  </>
            )}

            {tab === 'competitors' && (
              competitorData.length === 0
                ? <div style={{textAlign:'center',padding:'60px',color:'#888'}}>
                    <p style={{fontWeight:'500'}}>No competitor data yet</p>
                    <p style={{fontSize:'12px',marginTop:'4px'}}>Data appears when other stores have products in same categories as yours</p>
                  </div>
                : <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontWeight: '600', color: textColor }}>Competitors Analysis</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: mutedText }}>Filter by Category:</span>
                        <Select
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          style={{ width: 180 }}
                          options={[
                            { value: 'All Categories', label: 'All Categories' },
                            ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
                          ]}
                        />
                      </div>
                    </div>
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                        <thead>
                          <tr style={{background:'#f8fdf2'}}>
                            {['Category','My Avg Price','Market Avg','Lowest Price','My Products','Competitors','Status'].map(h=>(
                              <th key={h} style={{padding:'10px 12px',textAlign:'left',color:'#555',fontWeight:'500',borderBottom:'1px solid #e8f0d8',fontSize:'12px'}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCompetitors.map((row,i)=>(
                            <tr key={i} style={{background: row.status==='overpriced' ? '#fff5f5' : '#f8fdf2', borderBottom:'1px solid #f0f0f0'}}>
                              <td style={{padding:'10px 12px',fontWeight:'500',color:'#222'}}>{row.category}</td>
                              <td style={{padding:'10px 12px',fontWeight:'700',color:'#222'}}>Rs. {row.my_avg_price}</td>
                              <td style={{padding:'10px 12px',color:'#555'}}>Rs. {row.market_avg}</td>
                              <td style={{padding:'10px 12px',color:'#555'}}>Rs. {row.lowest_price}</td>
                              <td style={{padding:'10px 12px',color:'#888',textAlign:'center'}}>{row.my_product_count}</td>
                              <td style={{padding:'10px 12px',color:'#888',textAlign:'center'}}>{row.competitor_count}</td>
                              <td style={{padding:'10px 12px'}}>
                                {(() => {
                                  const status = (row.status || '').toLowerCase();
                                  if (status === 'overpriced') {
                                    return <span style={{background:'#ffebee',color:'#c62828',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'500'}}>Overpriced</span>;
                                  } else if (status === 'underpriced') {
                                    return <span style={{background:'#fff8e1',color:'#e65100',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'500'}}>Underpriced</span>;
                                  } else {
                                    return <span style={{background:'#e8f5e9',color:'#2e7d32',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'500'}}>Competitive</span>;
                                  }
                                })()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {selectedCategory !== 'All Categories' && (
                      <div style={{ marginTop: '32px' }} className="custom-antd-table">
                        <style>{`
                          .custom-antd-table .ant-table {
                            background: transparent !important;
                            color: ${textColor} !important;
                          }
                          .custom-antd-table .ant-table-thead > tr > th {
                            background: ${isDark ? '#2a3a2a' : '#f8fdf2'} !important;
                            color: ${textColor} !important;
                            border-bottom: 1px solid ${isDark ? '#3a4a3a' : '#e8f0d8'} !important;
                            font-size: 12px !important;
                            font-weight: 500 !important;
                          }
                          .custom-antd-table .ant-table-tbody > tr > td {
                            border-bottom: 1px solid ${borderColor} !important;
                            background: transparent !important;
                            color: ${textColor} !important;
                          }
                          .custom-antd-table .ant-table-tbody > tr:hover > td {
                            background: ${isDark ? '#2a3a2a' : '#fafafa'} !important;
                          }
                          .custom-antd-table .ant-spin {
                            color: #6aaa00 !important;
                          }
                          .custom-antd-table .ant-spin-dot-item {
                            background-color: #6aaa00 !important;
                          }
                        `}</style>
                        <h3 style={{ fontWeight: '600', color: textColor, marginBottom: '16px', fontSize: '15px' }}>
                          Products in {selectedCategory}
                        </h3>
                        {categoryLoading ? (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                            <Spin size="large" />
                          </div>
                        ) : categoryProducts.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px', color: mutedText, fontWeight: '500' }}>
                            No products found in this category
                          </div>
                        ) : (
                          <Table
                            columns={categoryColumns}
                            dataSource={categoryProducts}
                            pagination={false}
                            rowKey="key"
                            style={{ background: 'transparent' }}
                          />
                        )}
                      </div>
                    )}
                  </>
            )}

            {tab === 'ratings' && (
              ratingsData.length === 0
                ? <div style={{textAlign:'center',padding:'60px',color:'#888'}}>
                    <p style={{fontWeight:'500'}}>No ratings yet</p>
                    <p style={{fontSize:'12px',marginTop:'4px'}}>Ratings appear after customers review your store</p>
                  </div>
                : <>
                    <div style={{display:'flex',gap:'24px',marginBottom:'20px',padding:'16px',background:'#f8fdf2',borderRadius:'10px'}}>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'36px',fontWeight:'500',color:'#222'}}>
                          {ratingsData.length > 0
                            ? (ratingsData.reduce((sum,r)=>sum+(r.stars*r.count),0) / ratingsData.reduce((sum,r)=>sum+r.count,0)).toFixed(1)
                            : '0'}
                        </div>
                        <div style={{fontSize:'12px',color:'#888',marginTop:'4px'}}>
                          {ratingsData.reduce((sum,r)=>sum+r.count,0)} reviews
                        </div>
                      </div>
                      <div style={{flex:1}}>
                        {[5,4,3,2,1].map(star=>{
                          const item = ratingsData.find(r=>r.stars===star)
                          const count = item?.count || 0
                          const total = ratingsData.reduce((sum,r)=>sum+r.count,0)
                          const pct = total > 0 ? Math.round(count/total*100) : 0
                          return (
                            <div key={star} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                              <span style={{fontSize:'11px',color:'#888',width:'20px'}}>{star}★</span>
                              <div style={{flex:1,background:'#e0e0e0',borderRadius:'3px',height:'8px'}}>
                                <div style={{width:`${pct}%`,background:'#6aaa00',height:'8px',borderRadius:'3px'}} />
                              </div>
                              <span style={{fontSize:'11px',color:'#888',width:'30px'}}>{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
