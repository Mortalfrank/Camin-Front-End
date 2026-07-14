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
import bottomLeft from '../assets/camin/bottom-left-cropped.png';
import bottomRight from '../assets/camin/bottom-right-cropped.png';
import smallLook from '../assets/camin/frame6-small-look.png';

const seriesItems = [
  { productId: 1, name: 'Fade In', image: seriesLeopard },
  { productId: 2, name: 'After Party', image: seriesSpeckle },
  { productId: 3, name: 'Foreign Body', image: seriesCow },
  { productId: 4, name: 'Skin On Skin', image: seriesZebra },
  { productId: 5, name: 'Light Denim', image: seriesLightDenim },
  { productId: 6, name: 'Dark Denim', image: seriesDarkDenim },
];

const featuredProducts = [
  {
    productId: 1,
    code: '02 THE FADE IN (TAN)',
    model: 'Leica M6',
    price: '$49.00',
    image: seriesLeopard,
  },
  {
    productId: 2,
    code: '03 THE AFTER PARTY',
    model: 'Ricoh Gr3',
    price: '$49.00',
    image: seriesSpeckle,
  },
  {
    productId: 3,
    code: '03 THE FOREIGN BODY',
    model: 'Fuji X100T',
    price: '$49.00',
    image: seriesCow,
  },
  {
    productId: 4,
    code: '03 SKIN ON SKIN',
    model: 'Ricoh Gr3',
    price: '$49.00',
    image: seriesZebra,
  },
  {
    productId: 5,
    code: '04 LIGHT DENIM',
    model: 'Ricoh Gr3',
    price: '$59.00',
    image: seriesLightDenim,
  },
  {
    productId: 6,
    code: '05 DARK DENIM',
    model: 'Ricoh Gr3',
    price: '$59.00',
    image: seriesDarkDenim,
  },
];

const brandNotes = [
  {
    title: 'Made for carried cameras',
    body: 'CAM_IN skins are cut for compact bodies that move through daily outfits, shoots, trips, and late-night streets.',
  },
  {
    title: 'Limited visual runs',
    body: 'Each texture is treated like a small series. When a run sells through, the archive moves on.',
  },
];

const cameraBodies = [
  { name: 'Leica M6', image: modelLeica },
  { name: 'Ricoh Gr3', image: modelRicoh },
  { name: 'Fuji X100T', image: modelFuji },
];

const processNotes = [
  {
    title: 'Choose your camera model',
    detail: 'Start with the body you actually carry. The skin works best when the fit is exact.',
    tag: 'MODEL LOCK',
  },
  {
    title: 'Pick a texture from the current series',
    detail: 'Match the skin to the way you shoot: quiet denim, animal print, or loud archive energy.',
    tag: 'TEXTURE SELECT',
  },
  {
    title: 'Apply with clean hands and slow pressure',
    detail: 'Line up the edges first, then press from the center out. Slow installation keeps the finish clean.',
    tag: 'SURFACE CHECK',
  },
  {
    title: 'Carry the camera as part of the fit',
    detail: 'The final object should feel less like gear and more like something you meant to wear.',
    tag: 'OUTSIDE READY',
  },
];

export default function Home() {
  const visibleCount = 3;
  const [seriesStart, setSeriesStart] = useState(0);
  const [activeProcess, setActiveProcess] = useState(0);
  const [activeSkin, setActiveSkin] = useState(0);
  const [activeBody, setActiveBody] = useState(1);
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
            <Link to={`/products/${item.productId}`} className="series-card" key={item.name}>
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
        <h2>/PRODUCTS</h2>
      </section>

      <section className="model-grid product-preview-grid" aria-label="Featured CAM_IN products">
        {featuredProducts.map((item, index) => (
          <Link to={`/products/${item.productId}`} className="model-card" key={`${item.code}-${index}`}>
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

      <section className="skin-studio" aria-label="CAM_IN skin fitting room">
        <div className="skin-studio-copy">
          <span>/FITTING ROOM</span>
          <h2>TRY THE SKIN ON THE BODY</h2>
          <p>
            Pick a camera body, then switch textures like a tiny dress-up game.
            The preview keeps the product big so the print stays easy to judge.
          </p>
          <div className="body-picker" aria-label="Choose camera body">
            {cameraBodies.map((body, index) => (
              <button
                type="button"
                className={activeBody === index ? 'active' : ''}
                key={body.name}
                onClick={() => setActiveBody(index)}
              >
                {body.name}
              </button>
            ))}
          </div>
        </div>

        <div className="skin-stage" aria-live="polite">
          <img className="skin-stage-base" src={cameraBodies[activeBody].image} alt="" />
          <Link to={`/products/${featuredProducts[activeSkin].productId}`} className="skin-stage-product">
            <img src={featuredProducts[activeSkin].image} alt={featuredProducts[activeSkin].code} />
          </Link>
          <div className="skin-stage-meta">
            <span>{featuredProducts[activeSkin].code}</span>
            <span>{cameraBodies[activeBody].name}</span>
          </div>
        </div>

        <div className="skin-rail" aria-label="Choose texture">
          {featuredProducts.map((item, index) => (
            <button
              type="button"
              className={activeSkin === index ? 'active' : ''}
              key={item.code}
              onClick={() => setActiveSkin(index)}
              aria-label={`Try ${item.code}`}
            >
              <img src={item.image} alt="" />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="brand-info-grid" aria-label="About CAM_IN">
        {brandNotes.map((note) => (
          <article key={note.title}>
            <span>/NOTE</span>
            <h2>{note.title}</h2>
            <p>{note.body}</p>
          </article>
        ))}
      </section>

      <section className="process-stack" aria-label="How CAM_IN works">
        <div className="process-heading">
          <span>/HOW IT WORKS</span>
          <Link to="/products">SHOP SERIES</Link>
        </div>
        <ol>
          {processNotes.map((note, index) => (
            <li key={note.title}>
              <button
                type="button"
                className={activeProcess === index ? 'active' : ''}
                onClick={() => setActiveProcess(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{note.title}</p>
              </button>
            </li>
          ))}
        </ol>
        <div className="process-detail" aria-live="polite">
          <span>{processNotes[activeProcess].tag}</span>
          <p>{processNotes[activeProcess].detail}</p>
        </div>
      </section>
    </div>
  );
}
