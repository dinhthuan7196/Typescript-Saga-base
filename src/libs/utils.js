export const getYear = (storeType, overwrite = '') => {
  if (['year', 'document'].includes(storeType)) {
    return overwrite || new Date().getFullYear();
  }
  return 0;
};
