import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="home-shell">
      <section className="hero-placeholder">
        <div className="hero-frame">
          <p className="hero-tag">/SERIES</p>
          <p className="hero-note">Reserved space for campaign visuals</p>
        </div>
      </section>

      <section className="carousel-block">
        <div className="carousel-track">
          <div className="camera-slot large">Feature Slot</div>
          <div className="camera-slot large">Feature Slot</div>
        </div>
        <div className="thumb-row">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="camera-thumb">Item</div>
          ))}
        </div>
      </section>

      <section className="explore-banner">
        <div className="explore-panel">SS26 · EXPLORE</div>
        <div className="explore-panel alt">SS26 · EXPLORE</div>
      </section>

      <section className="sketch-grid">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="sketch-card">CAMIN SKETCH</div>
        ))}
      </section>

      <section className="gallery-row">
        <div className="gallery-tile">Gallery Placeholder</div>
        <div className="gallery-tile">Gallery Placeholder</div>
      </section>

      <section className="footer-strip">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="footer-thumb">Thumb</div>
        ))}
      </section>
    </div>
  );
}