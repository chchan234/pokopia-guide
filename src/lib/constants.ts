export const typeColors: Record<string, { bg: string; text: string; light: string }> = {
  풀: { bg: '#5DAA3A', text: '#fff', light: '#E9F5E0' },
  독: { bg: '#9B6DAD', text: '#fff', light: '#F2EBF6' },
  불꽃: { bg: '#E87C4F', text: '#fff', light: '#FDF0EA' },
  물: { bg: '#5C8EC9', text: '#fff', light: '#E8F0FA' },
  전기: { bg: '#D4A832', text: '#fff', light: '#FBF4E0' },
  비행: { bg: '#8E94C8', text: '#fff', light: '#EEEFF7' },
  노말: { bg: '#9B9B85', text: '#fff', light: '#F2F2EE' },
  격투: { bg: '#BF5A52', text: '#fff', light: '#F8ECEA' },
  바위: { bg: '#AD9B5E', text: '#fff', light: '#F5F2EA' },
  땅: { bg: '#C4A96C', text: '#fff', light: '#F8F2E8' },
  벌레: { bg: '#92AD30', text: '#fff', light: '#F2F6E2' },
  고스트: { bg: '#7B6395', text: '#fff', light: '#F0ECF5' },
  강철: { bg: '#9595A8', text: '#fff', light: '#F0F0F4' },
  에스퍼: { bg: '#E07080', text: '#fff', light: '#FCE9ED' },
  얼음: { bg: '#6AADAD', text: '#fff', light: '#E6F4F4' },
  드래곤: { bg: '#6F5CC8', text: '#fff', light: '#EDEBF8' },
  악: { bg: '#7A6655', text: '#fff', light: '#F2EEEA' },
  페어리: { bg: '#D8899C', text: '#fff', light: '#FAEEF2' },
};

export const areaThemes: Record<string, { color: string; bg: string; en: string }> = {
  '메마른 황야': { color: '#8F6E47', bg: '#F2E7D8', en: 'Parched Wasteland' },
  '메마른 황야 마을': { color: '#8F6E47', bg: '#F2E7D8', en: 'Parched Wasteland Town' },
  '우중충한 해변': { color: '#4C87BD', bg: '#E8F0FA', en: 'Gloomy Beach' },
  '우중충한 해변 마을': { color: '#4C87BD', bg: '#E8F0FA', en: 'Gloomy Beach Town' },
  '울퉁불퉁 산': { color: '#C66E4A', bg: '#FCEDE6', en: 'Rocky Mountain' },
  '울퉁불퉁 산마을': { color: '#C66E4A', bg: '#FCEDE6', en: 'Rocky Mountain Town' },
  '반짝반짝 부유섬': { color: '#8C63C7', bg: '#F2EBF8', en: 'Sparkling Sky Island' },
  '반짝반짝 부유섬 마을': { color: '#8C63C7', bg: '#F2EBF8', en: 'Sparkling Sky Island Town' },
  '빈 마을': { color: '#6EBD44', bg: '#E9F5E0', en: 'Blank Town' },
  '꿈섬': { color: '#D27299', bg: '#FBEAF1', en: 'Dream Island' },
  '미상': { color: '#8E857A', bg: '#F3EFE8', en: 'Unknown' },
};

export const habitatRarityTheme: Record<string, { color: string; bg: string }> = {
  기본: { color: '#6EBD44', bg: '#E9F5E0' },
  희귀: { color: '#4C87BD', bg: '#E8F0FA' },
  '매우 희귀': { color: '#C66E4A', bg: '#FCEDE6' },
};

export const mapOrder = ['메마른 황야', '우중충한 해변', '울퉁불퉁 산', '반짝반짝 부유섬', '빈 마을', '꿈섬', '미상'];

export const recordMapOrder = ['메마른 황야 마을', '우중충한 해변 마을', '울퉁불퉁 산마을', '반짝반짝 부유섬 마을', '꿈섬'];

export const fashionCategoryOrder = ['hair', 'coords', 'tops', 'bottoms', 'hats', 'shoes', 'bags'];
