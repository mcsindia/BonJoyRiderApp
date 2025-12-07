import { fontFamilies } from "../constants/fonts";

export const getFontFamily = (
    weight: 'thin' | 'extraLight' | 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold' | 'black',
  ) => {
    const selectedFontFamily = fontFamilies.POPPINS;
    return selectedFontFamily[weight];
  };