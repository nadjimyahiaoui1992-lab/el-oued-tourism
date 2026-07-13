"use client";
import { useState } from 'react';

export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      background: '#f3f4f6', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* رأس الصفحة الاحترافي */}
      <header style={{ 
        background: '#064e3b', 
        color: 'white', 
        padding: '2rem', 
        textAlign: 'center',
        borderRadius: '0 0 2rem 2rem'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>اكتشف سوف AI</h1>
        <p>مرحبا بك في دليلك الذكي</p>
      </header>

      {/* منطقة المحتوى */}
      <main style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '1rem', 
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
        }}>
          <h2>مرحباً بك!</h2>
          <p>استخدم القائمة أدناه لاستكشاف الوادي بذكاء.</p>
        </div>
      </main>
    </div>
  );
}
