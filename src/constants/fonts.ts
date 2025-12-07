import {Platform} from 'react-native';

export const fontFamilies = {
  POPPINS: {    
    thin: Platform.OS == 'ios' ? 'Poppins-Thin' : 'PoppinsThin',
    extraLight: Platform.OS == 'ios' ? 'Poppins-ExtraLight' : 'PoppinsExtraLight',
    light: Platform.OS == 'ios' ? 'Poppins-Light' : 'PoppinsLight',
    regular: Platform.OS == 'ios' ? 'Poppins-Regular' : 'PoppinsRegular',
    medium: Platform.OS == 'ios' ? 'Poppins-Medium' : 'PoppinsMedium',
    semiBold: Platform.OS == 'ios' ? 'Poppins-SemiBold' : 'PoppinsSemiBold',
    bold: Platform.OS == 'ios' ? 'Poppins-Bold' : 'PoppinsBold',
    extraBold: Platform.OS == 'ios' ? 'Poppins-ExtraBold' : 'PoppinsExtraBold',
    black: Platform.OS == 'ios' ? 'Poppins-Black' : 'PoppinsBlack',
  },
  
};