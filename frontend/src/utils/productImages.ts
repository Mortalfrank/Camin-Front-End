import { Product } from '../types';
import seriesLeopard from '../assets/camin/products/series-leopard.png';
import seriesSpeckle from '../assets/camin/products/series-speckle.png';
import seriesCow from '../assets/camin/products/series-cow.png';
import seriesZebra from '../assets/camin/products/series-zebra.png';
import seriesLightDenim from '../assets/camin/products/series-light-denim.png';
import seriesDarkDenim from '../assets/camin/products/series-dark-denim.png';

const fallbackProductImages = [
  seriesLeopard,
  seriesSpeckle,
  seriesCow,
  seriesZebra,
  seriesLightDenim,
  seriesDarkDenim,
];

export function getFallbackProductImage(product: Product, index = 0) {
  const stableIndex = Number.isFinite(product.id) ? product.id - 1 : index;
  return fallbackProductImages[Math.abs(stableIndex) % fallbackProductImages.length];
}
