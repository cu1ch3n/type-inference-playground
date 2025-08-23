export const cleanUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('algorithm');
  url.searchParams.delete('program');
  url.searchParams.delete('variant');
  url.searchParams.delete('algorithms');
  url.searchParams.delete('expressions');
  window.history.replaceState({}, '', url.toString());
};

export const getParamsFromUrl = () => {
  if (typeof window === 'undefined') return { algorithm: '', expression: '', variant: '' };
  
  const url = new URL(window.location.href);
  const algorithm = url.searchParams.get('algorithm') || '';
  const expression = url.searchParams.get('program') ? decodeURIComponent(url.searchParams.get('program')!) : '';
  const variant = url.searchParams.get('variant') || '';
  
  return { algorithm, expression, variant };
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

export const shareCompareState = async (algorithms: string[], expressions: string[]) => {
  const url = new URL(window.location.href);
  url.searchParams.set('compare', 'true');
  
  if (algorithms.length > 0) {
    url.searchParams.set('algorithms', algorithms.join(','));
  } else {
    url.searchParams.delete('algorithms');
  }
  
  if (expressions.length > 0) {
    url.searchParams.set('expressions', expressions.map(expr => encodeURIComponent(expr.trim())).join(','));
  } else {
    url.searchParams.delete('expressions');
  }
  
  const shareUrl = url.toString();
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    return { success: true, url: shareUrl };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, url: shareUrl, error };
  }
};

export const shareCurrentState = async (algorithm: string, expression: string, variant?: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('algorithm', algorithm);
  url.searchParams.set('program', encodeURIComponent(expression.trim()));
  
  if (variant) {
    url.searchParams.set('variant', variant);
  } else {
    url.searchParams.delete('variant');
  }
  
  const shareUrl = url.toString();
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    return { success: true, url: shareUrl };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, url: shareUrl, error };
  }
};