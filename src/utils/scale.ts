import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ✅ Base dimensions (iPhone X / Figma design size)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Scale based on width
const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;

// Scale based on height
const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;

// ✅ Choose the smaller scale to keep UI balanced
const scale = Math.min(scaleWidth, scaleHeight);

// ---------- UNIVERSAL SCALERS ----------

// ✅ For horizontal sizes (width, marginHorizontal, paddingHorizontal)
export const sw = (size: number) =>
  PixelRatio.roundToNearestPixel(size * scaleWidth);

// ✅ For vertical sizes (height, marginVertical, paddingVertical)
export const sh = (size: number) =>
  PixelRatio.roundToNearestPixel(size * scaleHeight);

// ✅ For font size (most important)
export const sf = (size: number) =>
  PixelRatio.roundToNearestPixel(size * scale);

// ✅ For borderRadius, icons, mixed usage
export const s = (size: number) =>
  PixelRatio.roundToNearestPixel(size * scale);
