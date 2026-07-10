import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import heroLeft from '../assets/camin/hero-left.gif';
import heroRight from '../assets/camin/hero-right.gif';
import seriesLeopard from '../assets/camin/products/series-leopard.png';
import seriesSpeckle from '../assets/camin/products/series-speckle.png';
import seriesCow from '../assets/camin/products/series-cow.png';
import seriesZebra from '../assets/camin/products/series-zebra.png';
import seriesLightDenim from '../assets/camin/products/series-light-denim.png';
import seriesDarkDenim from '../assets/camin/products/series-dark-denim.png';
import featureLeft from '../assets/camin/ss26-left.jpg';
import featureRight from '../assets/camin/ss26-right.jpg';
import ss26Explore from '../assets/camin/ss26-explore.png';
import modelLeica from '../assets/camin/model-leica.png';
import modelRicoh from '../assets/camin/model-ricoh.png';
import modelFuji from '../assets/camin/frame6-model-fuji.png';
import bottomLeft from '../assets/camin/bottom-left.png';
import bottomRight from '../assets/camin/bottom-right.png';
import smallLook from '../assets/camin/frame6-small-look.png';

const seriesItems = [
  { name: 'Fade In', image: seriesLeopard },
  { name: 'After Party', image: seriesSpeckle },
  { name: 'Foreign Body', image: seriesCow },
  { name: 'Skin On Skin', image: seriesZebra },
  { name: 'Light Denim', image: seriesLightDenim },
  { name: 'Dark Denim', image: seriesDarkDenim },
];

const cameraModels = [
  {
    code: '02 THE FADE IN (TAN)',
    model: 'Leica M6',
    price: '',
    image: modelLeica,
  },
  {
    code: '03 THE AFTER PARTY',
    model: 'Ricoh Gr3',
    price: '',
    image: modelRicoh,
  },
  {
    code: '03 THE FOREIGN BODY',
    model: 'Fuji X100T',
    price: '',
    image: modelFuji,
  },
  {
    code: '03 SKIN ON SKIN',
    model: '',
    price: '$49.00',
    image: modelRicoh,
  },
  {
    code: '02 THE FADE IN (TAN)',
    model: 'Leica M6',
    price: '',
    image: modelRicoh,
  },
  {
    code: '03 THE AFTER PARTY',
    model: 'Ricoh Gr3',
    price: '',
    image: modelLeica,
  },
  {
    code: '03 THE FOREIGN BODY',
    model: '',
    price: '$29.00',
    image: modelRicoh,
  },
  {
    code: '03 SKIN ON SKIN',
    model: '',
    price: '$49.00',
    image: modelLeica,
  },
];

export default function Home() {
  const visibleCount = 3;
  const [seriesStart, setSeriesStart] = useState(0);
  const maxSeriesStart = Math.max(seriesItems.length - visibleCount, 0);

  const visibleSeries = useMemo(
    () => seriesItems.slice(seriesStart, seriesStart + visibleCount),
    [seriesStart],
  );

  const showPreviousSeries = () => {
    setSeriesStart((current) => Math.max(current - 1, 0));
  };

  const showNextSeries = () => {
    setSeriesStart((current) => Math.min(current + 1, maxSeriesStart));
  };

  const showSeriesItem = (index: number) => {
    setSeriesStart(Math.min(Math.max(index, 0), maxSeriesStart));
  };

  return (
    <div className="camin-home">
      <section className="camin-hero split" aria-label="CAM_IN series campaign">
        <img src={heroLeft} alt="CAM_IN red mark detail in a graffiti tunnel" />
        <img src={heroRight} alt="CAM_IN lookbook figure walking through grass" />
      </section>

      <section className="camin-section-label">
        <h1>/SERIES</h1>
      </section>

      <section className="series-strip" aria-label="Series 1 camera skins">
        <button
          className="series-arrow"
          aria-label="Previous series"
          onClick={showPreviousSeries}
          disabled={seriesStart === 0}
        >
          &lsaquo;
        </button>
        <div className="series-grid">
          {visibleSeries.map((item) => (
            <Link to="/products" className="series-card" key={item.name}>
              <img src={item.image} alt={item.name} />
            </Link>
          ))}
        </div>
        <button
          className="series-arrow"
          aria-label="Next series"
          onClick={showNextSeries}
          disabled={seriesStart === maxSeriesStart}
        >
          &rsaquo;
        </button>
        <div className="series-thumbs" aria-label="Series product thumbnails">
          {seriesItems.map((item, index) => (
            <button
              type="button"
              className={`series-thumb ${index >= seriesStart && index < seriesStart + visibleCount ? 'active' : ''}`}
              key={item.name}
              onClick={() => showSeriesItem(index)}
              aria-label={`Show ${item.name}`}
            >
              <img src={item.image} alt={item.name} />
            </button>
          ))}
          <Link to="/products" className="product-view-link">PRODUCT VIEW</Link>
        </div>
      </section>

      <section className="campaign-pair" aria-label="CAM_IN editorial images">
        <div className="campaign-frame campaign-frame-left">
          <img src={featureLeft} alt="CAM_IN editorial shoot in a graffiti tunnel" />
        </div>
        <div className="campaign-frame campaign-frame-right">
          <img src={featureRight} alt="CAM_IN camera portrait in a graffiti tunnel" />
        </div>
        <div className="ss26-overlay" aria-hidden="true">
          <img src={ss26Explore} alt="" />
          <img src={ss26Explore} alt="" />
          <img src={ss26Explore} alt="" />
        </div>
      </section>

      <section className="camin-section-label">
        <h2>/CAMERA MODELS</h2>
      </section>

      <section className="model-grid" aria-label="Camera model product grid">
        {cameraModels.map((item, index) => (
          <Link to="/products" className="model-card" key={`${item.code}-${index}`}>
            <div className="model-image-wrap">
              <img src={item.image} alt={item.code} />
            </div>
            <div className="model-copy">
              <p>{item.code}</p>
              {item.model && <span>{item.model}</span>}
              {item.price && <span>{item.price}</span>}
            </div>
          </Link>
        ))}
      </section>

      <section className="lookbook-pair" aria-label="CAM_IN lookbook">
        <img src={bottomLeft} alt="CAM_IN lookbook portrait by the water" />
        <img src={bottomRight} alt="CAM_IN lookbook sunset climbing scene" />
      </section>

      <section className="post-lookbook">
        <img src={smallLook} alt="CAM_IN vertical lookbook detail" />
      </section>

      <section className="blank-grid" aria-hidden="true">
        <div />
        <div />
      </section>

      <section className="rule-stack" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </section>
    </div>
  );
}
