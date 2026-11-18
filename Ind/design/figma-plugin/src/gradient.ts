/** CR15: explicit sRGB interpolation, shared by Figma and the browser preview. */
import {tokens} from './tokens.generated';
export const gradientPalettes = tokens.gradient;
export type GradientMode = 'original' | 'full' | 'headings';
export function rgbFromHex(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255];
}
export function luminance(rgb: readonly number[]): number {
  return rgb.map(v=>v<=0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4)).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
}
export function contrast(a: readonly number[],b: readonly number[]): number {
  const la=luminance(a),lb=luminance(b);
  return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05);
}
export function paletteForBackground(background: string) {
  return luminance(rgbFromHex(background))<0.2 ? gradientPalettes.light : gradientPalettes.dark;
}
export function minimumContrast(palette: readonly string[],background: string,steps=1000): number {
  let minimum=21;
  const bg=rgbFromHex(background);
  for(let part=0;part<palette.length-1;part++) {
    const a=rgbFromHex(palette[part]),b=rgbFromHex(palette[part+1]);
    for(let i=0;i<=steps;i++) minimum=Math.min(minimum,contrast(a.map((v,c)=>v+(b[c]-v)*i/steps),bg));
  }
  return minimum;
}
// Main content includes headings, prose, metadata and prices. Navigation,
// controls, entered values, validation feedback and the footer keep their colors.
export function isControlOrChrome(name: string): boolean {
  return /^(header|footer|navigation|button[. /]|icon[. /]|input[. /]|field$|brand$|it\.school$|menu header|menu items|link \/)/i.test(name);
}
export function isHeading(size: number, weight: string): boolean {
  return size>=24 && /bold|medium/i.test(weight);
}
