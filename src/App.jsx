import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function App() {
  const [type, setType] = useState('offer');
  const [comment, setComment] = useState('');
  const [nftJson, setNftJson] = useState('');
  const [offers, setOffers] = useState([]);
  const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (tgUser) {
      setUserId(tgUser.id);
      setUsername(tgUser.username || '');
    }
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setOffers(data);
  };

  const submitOffer = async () => {
    try {
      const nft = nftJson ? JSON.parse(nftJson) : null;
      const { error } = await supabase.from('offers').insert([{ type, comment, telegram_user_id: userId, telegram_username: username, nft_json: nft }]);
      if (error) alert('❌ ' + error.message);
      else {
        alert('✅ Offer created!');
        setComment('');
        setNftJson('');
        fetchOffers();
      }
    } catch (err) {
      alert('Invalid NFT JSON!');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto' }}>
      <h1>TONbox 🎁</h1>
      <div style={{ fontSize: 14, marginBottom: 20 }}>Logged in as <strong>@{username || 'unknown'}</strong> (ID: {userId})</div>
      <label>Type:</label><br />
      <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
        <option value="offer">Offer</option>
        <option value="request">Request</option>
      </select>
      <br /><br />
      <label>Comment:</label><br />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} style={{ width: '100%' }} />
      <br /><br />
      {type === 'offer' && (
        <>
          <label>NFT JSON:</label><br />
          <textarea value={nftJson} onChange={(e) => setNftJson(e.target.value)} rows={4} style={{ width: '100%' }} />
          <br /><br />
        </>
      )}
      <button onClick={submitOffer} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Create Offer</button>
      <hr style={{ margin: '40px 0' }} />
      <h2>🎯 Active Offers & Requests</h2>
      {offers.length === 0 ? <p>No offers yet.</p> : offers.map((o) => (
        <div key={o.id} style={{ border: '1px solid #ccc', borderRadius: 10, padding: 15, marginBottom: 15, background: '#fafafa' }}>
          <strong>{o.type.toUpperCase()}</strong> from @{o.telegram_username || 'user'} (ID: {o.telegram_user_id})
          <br /><em>{o.comment}</em>
          {o.nft_json && (
            <div style={{ marginTop: 10 }}>
              <strong>NFT:</strong> {o.nft_json.name}<br />
              {o.nft_json.image && <img src={o.nft_json.image} alt={o.nft_json.name} style={{ maxWidth: '100px', marginTop: 5 }} />}
            </div>
          )}
          <div style={{ fontSize: 12, marginTop: 5, color: '#888' }}>
            {new Date(o.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
