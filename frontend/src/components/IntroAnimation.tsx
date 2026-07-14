import { useEffect, useState } from 'react';
import skinLeopard from '../assets/camin/products/series-leopard.png';
import skinSpeckle from '../assets/camin/products/series-speckle.png';
import skinCow from '../assets/camin/products/series-cow.png';
import skinZebra from '../assets/camin/products/series-zebra.png';
import skinLightDenim from '../assets/camin/products/series-light-denim.png';
import heroDetail from '../assets/camin/frame6-small-look.png';
import './IntroAnimation.css';

const previewSkins = [
  { code: '02', name: 'THE FADE IN', image: skinLeopard },
  { code: '03', name: 'THE AFTER PARTY', image: skinSpeckle },
  { code: '03', name: 'THE FOREIGN BODY', image: skinCow },
  { code: '03', name: 'SKIN ON SKIN', image: skinZebra },
  { code: '04', name: 'LIGHT DENIM', image: skinLightDenim },
];

export default function IntroAnimation() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const finishTimer = window.setTimeout(() => {
      setClosing(true);
    }, 5200);

    return () => window.clearTimeout(finishTimer);
  }, []);

  useEffect(() => {
    if (!closing) return undefined;

    const closeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 700);

    return () => window.clearTimeout(closeTimer);
  }, [closing]);

  const skipIntro = () => {
    setClosing(true);
  };

  if (!visible) return null;

  return (
    <section className={`intro-animation ${closing ? 'closing' : ''}`} aria-label="CAM_IN opening animation">
      <div className="intro-grid" aria-hidden="true" />

      <div className="intro-header">
        <span>CAM_IN</span>
        <span>OPENING FILE / SS26</span>
      </div>

      <div className="intro-contact-sheet" aria-hidden="true">
        {previewSkins.map((skin, index) => (
          <figure className={`intro-sheet-card intro-sheet-card-${index + 1}`} key={skin.name}>
            <img src={skin.image} alt="" />
            <figcaption>
              <span>{skin.code}</span>
              <span>{skin.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="intro-hero-card" aria-hidden="true">
        <div className="intro-hero-media">
          <img src={heroDetail} alt="" />
        </div>
        <div className="intro-hero-meta">
          <span>/TEXTURE TEST</span>
          <span>FRAME 06</span>
        </div>
      </div>

      <div className="intro-copy">
        <p>/CAM_IN</p>
        <h1>SKINS FOR CARRIED CAMERAS</h1>
        <span>FIT THE CAMERA. CARRY THE IMAGE.</span>
      </div>

      <div className="intro-scan-line" aria-hidden="true" />
      <div className="intro-progress" aria-hidden="true" />

      <button className="intro-skip" type="button" onClick={skipIntro}>
        SKIP
      </button>
    </section>
  );
}
