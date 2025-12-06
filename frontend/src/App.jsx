import React from 'react'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', color: '#4a5568', marginBottom: '20px' }}>
          🎓 EduPathfinder
        </h1>
        <p style={{ fontSize: '20px', color: '#718096', marginBottom: '30px' }}>
          Your Education Discovery Platform is Running!
        </p>
        
        <div style={{
          background: '#f7fafc',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h3>✅ Frontend Status: Running on port 3000</h3>
          <p>Go to <a href="http://localhost:5000" target="_blank">http://localhost:5000</a> for backend</p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {['College Search', 'Compare Colleges', 'Admission Predictor', 'Exam Prep'].map((feature, i) => (
            <div key={i} style={{
              background: '#4299e1',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}>
              {feature}
            </div>
          ))}
        </div>
        
        <button style={{
          background: '#48bb78',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          fontSize: '18px',
          borderRadius: '10px',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App