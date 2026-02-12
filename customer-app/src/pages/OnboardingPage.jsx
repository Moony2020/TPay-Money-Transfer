import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const slides = [
  {
    title: "Welcome to",
    highlight: "TPay",
    description: "Experience the next generation of digital finance. Simple, fast, and designed to move with your life.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1600", // Human family connection
    color: "#E15E4B"
  },
  {
    title: "Effortless",
    highlight: "Payments",
    description: "Send money across the globe or across the street in seconds. Zero stress, maximum speed, every time.",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1600", // Real human payment interaction
    color: "#E15E4B"
  },
  {
    title: "Your Security",
    highlight: "is our Goal",
    description: "Join thousands of users protected by bank-grade encryption and 24/7 monitoring systems.",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&q=80&w=1600", // Trust behavior/smile
    color: "#E15E4B"
  },
  {
    title: "Growth Without",
    highlight: "Limits",
    description: "Empowering every dream with the support and tools it needs to thrive and grow.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600", // Vibrant human connection/community
    color: "#E15E4B"
  }
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    navigate('/register');
  };

  return (
    <div className="page onboarding-page" style={{ padding: 0, position: 'relative', background: '#000000', color: '#FFFFFF', overflow: 'hidden', height: '100dvh' }}>
      
      {/* Immersive Background Layer with Ken Burns Effect */}
      {slides.map((slide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentSlide ? 1 : 0,
            zIndex: 1,
            transform: index === currentSlide ? 'scale(1.15)' : 'scale(1)',
            transition: 'opacity 1.5s ease-in-out, transform 12s cubic-bezier(0.1, 0, 0, 1)'
          }}
        >
          {/* Multi-layered cinematic overlay - slightly darker for better text contrast */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.95) 100%)'
          }} />
        </div>
      ))}

      {/* Interface Layer */}
      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Branding & Control */}
        <div className="flex-between w-full" style={{ padding: '40px 32px 0' }}>
          <Logo size="sm" light />
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              fontSize: '0.85rem', 
              color: '#FFFFFF', 
              fontWeight: 700,
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 18px',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}
          >
            Skip
          </button>
        </div>

        {/* Dynamic Text Content - Perfectly Balanced Centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ width: '100%', position: 'relative', height: '220px' }}>
            {slides.map((slide, index) => (
              <div
                key={index}
                style={{ 
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  width: '100%',
                  transform: index === currentSlide ? 'translateY(-50%)' : 'translateY(20px)',
                  opacity: index === currentSlide ? 1 : 0,
                  transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: index === currentSlide ? 'auto' : 'none'
                }}
              >
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.04em', lineHeight: 1.1, color: '#FFFFFF', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  {slide.title} <br />
                  <span style={{ color: slide.color }}>{slide.highlight}</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.95)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5, fontSize: '1.1rem', fontWeight: 500, letterSpacing: '-0.01em', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          {/* Progress Indicators (Dots) */}
          <div className="flex-center gap-sm" style={{ marginTop: '40px' }}>
            {slides.map((_, index) => (
              <div 
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{ 
                  width: index === currentSlide ? 32 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: index === currentSlide ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>

        {/* Global Navigation Footer */}
        <div className="onboarding-footer" style={{ padding: '0 32px 64px' }}>
          <div className="flex-col gap-sm">
            <button 
              className="btn" 
              onClick={handleStart}
              style={{ 
                height: '64px', // Standard premium button height
                borderRadius: '32px', 
                fontSize: '1.2rem', 
                fontWeight: 800,
                background: '#E15E4B',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 16px 36px rgba(225,94,75,0.35)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '-0.03em',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>
            
            <Link 
              to="/login" 
              style={{ 
                fontWeight: 700, 
                color: 'rgba(255,255,255,0.85)', 
                marginTop: '16px', 
                fontSize: '1.1rem', 
                textDecoration: 'none', 
                textAlign: 'center',
                display: 'block',
                textShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
