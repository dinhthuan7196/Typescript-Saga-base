export const BACKEND = (() => {
  if (process.env.REACT_APP_STAGE === 'development') return 'http://localhost:5005';
  if (process.env.REACT_APP_STAGE === 'qa') return 'https://services.xbot.com.vn:1269';
  if (window.location.href.indexOf('pgddakglong') !== -1) return 'https://fbot.backend.pgddakglong.edu.vn:1239';
  if (window.location.href.indexOf('esoft.edu.vn') !== -1) return 'https://services.esoft.edu.vn:1239';
  return 'https://services.xbot.com.vn:1239';
})();

export const COMPANY = (() => {
  if (window.location.href.indexOf('esoft.edu.vn') !== -1) return 'esoft';
  return 'xbot';
})();

export const NOTIFICATIONS = 'https://services.xbot.com.vn:1252/api/notifications';
export const RESOURCES = 'https://services.xbot.com.vn:1251';
