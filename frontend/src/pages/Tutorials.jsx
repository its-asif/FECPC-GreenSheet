import React from 'react';
import { Link } from 'react-router-dom';

export default function Tutorials() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Page Header */}
      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1e1b4b, #111827)', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#818cf8' }}>Educational Tutorials</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
          Welcome to the FECPC educational resources portal. Browse curated courses and tutorials below.
        </p>
      </div>

      {/* Private Tutorial Section */}
      <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(17, 24, 39, 0.6)' }}>
        <h2 style={{ fontSize: '24px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          🔒 Private Tutorial
        </h2>
        <p style={{ color: '#fca5a5', fontSize: '13px', fontStyle: 'italic', margin: '0 0 20px 0', letterSpacing: '0.5px' }}>
          "due to piracy issue - keep it a secret"
        </p>

        {/* Section: From Shahjalal Shohag */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#e2e8f0', borderBottom: '1px solid #2e3752', paddingBottom: '8px', marginBottom: '16px' }}>
            From Shahjalal Shohag
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <Link 
              to="/tutorial/number-theory" 
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="card" 
                style={{ 
                  margin: 0,
                  background: 'rgba(31, 38, 63, 0.4)', 
                  border: '1px solid #2e3752', 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#2e3752';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🔢</span>
                  <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: '11px', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    Active
                  </span>
                </div>
                <h4 style={{ fontSize: '18px', color: '#e2e8f0', marginBottom: '8px' }}>1.0 Number Theory</h4>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
                  Master divisors, primality tests, sieves, modular arithmetic, and advanced number theory concepts for CP.
                </p>
              </div>
            </Link>

            <Link 
              to="/tutorial/basic-number-theory" 
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="card" 
                style={{ 
                  margin: 0,
                  background: 'rgba(31, 38, 63, 0.4)', 
                  border: '1px solid #2e3752', 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#2e3752';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🧮</span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '11px', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    Active
                  </span>
                </div>
                <h4 style={{ fontSize: '18px', color: '#e2e8f0', marginBottom: '8px' }}>2.0 Basic Number Theory</h4>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
                  Learn divisibility properties, Legendre's formula, trailing zeros, factorials, and prime summation tricks.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
