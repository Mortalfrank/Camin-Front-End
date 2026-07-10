import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const serviceItems = [
  { code: '01', label: 'Complimentary shipping' },
  { code: '02', label: 'Secure checkout' },
  { code: '03', label: 'Limited camera skins' },
  { code: '04', label: 'Gift-ready packaging' },
];

const supportLinks = [
  { label: 'Contact', to: '/profile' },
  { label: 'Shipping', to: '/orders' },
  { label: 'Returns', to: '/orders' },
  { label: 'Order history', to: '/orders' },
];

const aboutLinks = [
  { label: 'Our story', to: '/' },
  { label: 'Collections', to: '/products' },
  { label: 'Explore', to: '/products' },
  { label: 'Account', to: '/profile' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(email.trim() ? 'Subscribed. CAM_IN updates will land here first.' : 'Enter an email to subscribe.');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section className="footer-service-row" aria-label="Store services">
          {serviceItems.map((item) => (
            <div className="footer-service" key={item.code}>
              <span>{item.code}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </section>

        <section className="footer-main">
          <div className="footer-column">
            <h2>Orders and support</h2>
            <nav aria-label="Orders and support">
              {supportLinks.map((link) => (
                <Link key={link.label} to={link.to}>{link.label}</Link>
              ))}
            </nav>
          </div>

          <div className="footer-column">
            <h2>About</h2>
            <nav aria-label="About CAM_IN">
              {aboutLinks.map((link) => (
                <Link key={link.label} to={link.to}>{link.label}</Link>
              ))}
            </nav>
          </div>

          <div className="footer-brand">
            <h2>CAM_IN</h2>
            <p>
              Camera skins and visual objects for people who carry a camera like part of the outfit.
            </p>
          </div>

          <form className="footer-subscribe" onSubmit={handleSubmit}>
            <label htmlFor="footer-email">Subscribe to CAM_IN updates</label>
            <div className="footer-subscribe-row">
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
              />
              <button type="submit">Submit</button>
            </div>
            {message && <p className="footer-message">{message}</p>}
          </form>
        </section>

        <section className="footer-bottom">
          <p>© CAM_IN 2026</p>
          <div className="footer-socials" aria-label="Social links">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">IG</a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TT</a>
            <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer">PT</a>
          </div>
        </section>
      </div>
      <button className="footer-back-top" type="button" onClick={scrollToTop} aria-label="Back to top">
        ↑
      </button>
    </footer>
  );
}
