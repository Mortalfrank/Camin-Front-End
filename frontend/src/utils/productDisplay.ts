import { Product } from '../types';
import { getFallbackProductImage } from './productImages';

export const caminCatalogItems = [
  {
    name: '02 THE FADE IN (TAN)',
    brand: 'CAM_IN',
    model: 'Leica M6',
    series: 'SS26',
    texture: 'Leopard faux fur',
    description: 'A warm leopard camera skin for daily carry and loud fits.',
  },
  {
    name: '03 THE AFTER PARTY',
    brand: 'CAM_IN',
    model: 'Ricoh Gr3',
    series: 'SS26',
    texture: 'Speckled faux fur',
    description: 'A compact speckled skin for cameras that stay out after dark.',
  },
  {
    name: '03 THE FOREIGN BODY',
    brand: 'CAM_IN',
    model: 'Fuji X100T',
    series: 'SS26',
    texture: 'Cow faux fur',
    description: 'A high-contrast cow print skin for a camera that wants attention.',
  },
  {
    name: '03 SKIN ON SKIN',
    brand: 'CAM_IN',
    model: 'Ricoh Gr3',
    series: 'SS26',
    texture: 'Zebra faux fur',
    description: 'A monochrome zebra skin cut for pocket cameras and hard flash nights.',
  },
  {
    name: '04 LIGHT DENIM',
    brand: 'CAM_IN',
    model: 'Ricoh Gr3',
    series: 'SS26',
    texture: 'Light denim',
    description: 'A pale blue denim skin for softer outfits and everyday carry.',
  },
  {
    name: '05 DARK DENIM',
    brand: 'CAM_IN',
    model: 'Ricoh Gr3',
    series: 'SS26',
    texture: 'Dark denim',
    description: 'A deep denim skin with a quiet utilitarian finish.',
  },
];

export function getProductDisplay(product: Product, index = 0): Product {
  const stableIndex = Number.isFinite(product.id) ? product.id - 1 : index;
  const catalogItem = caminCatalogItems[Math.abs(stableIndex) % caminCatalogItems.length];

  return {
    ...product,
    ...catalogItem,
    mainImageUrl: product.mainImageUrl || getFallbackProductImage(product, index),
  };
}
