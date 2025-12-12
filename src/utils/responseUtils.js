/**
 * Backend'den gelen response'ları parse etmek için utility fonksiyonları
 * Backend ResponseMessage ve DataResponseMessage formatlarını destekler
 */

/**
 * Response'un başarılı olup olmadığını kontrol eder
 * Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
 * @param {Object} response - Backend'den gelen response
 * @returns {boolean} - Response başarılı mı?
 */
export const isResponseSuccess = (response) => {
  if (!response) return false;
  // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
  return response.success !== undefined ? response.success : (response.isSuccess !== undefined ? response.isSuccess : false);
};

/**
 * Response'dan mesajı alır
 * @param {Object} response - Backend'den gelen response
 * @returns {string} - Response mesajı
 */
export const getResponseMessage = (response) => {
  if (!response) return 'Bilinmeyen hata';
  return response.message || response.error || 'İşlem tamamlandı';
};

/**
 * Response'dan data'yı alır (DataResponseMessage için)
 * @param {Object} response - Backend'den gelen response
 * @returns {any} - Response data
 */
export const getResponseData = (response) => {
  if (!response) return null;
  return response.data || response;
};

