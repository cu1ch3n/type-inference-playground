export const cleanUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('algorithm');
  url.searchParams.delete('program');
  url.searchParams.delete('algorithms');
  url.searchParams.delete('expressions');
  window.history.replaceState({}, '', url.toString());
};

export const getParamsFromUrl = () => {
  if (typeof window === 'undefined') return { algorithm: '', expression: '' };
  
  const url = new URL(window.location.href);
  const algorithm = url.searchParams.get('algorithm') || '';
  const expression = url.searchParams.get('program') ? decodeURIComponent(url.searchParams.get('program')!) : '';
  
  return { algorithm, expression };
};

export const getCompareParamsFromUrl = () => {
  if (typeof window === 'undefined') return { algorithms: [], expressions: [] };
  
  const url = new URL(window.location.href);
  const algorithmsParam = url.searchParams.get('algorithms');
  const expressionsParam = url.searchParams.get('expressions');
  
  const algorithms = algorithmsParam ? algorithmsParam.split(',') : [];
  const expressions = expressionsParam ? 
    expressionsParam.split(',').map(expr => decodeURIComponent(expr)) : [];
  
  return { algorithms, expressions };
};

export const shareCurrentState = async (algorithm: string, expression: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('algorithm', algorithm);
  url.searchParams.set('program', encodeURIComponent(expression.trim()));
  
  const shareUrl = url.toString();
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    return { success: true, url: shareUrl };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, url: shareUrl, error };
  }
};