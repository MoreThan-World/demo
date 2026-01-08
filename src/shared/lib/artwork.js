export const makeDisc = (outer = '#0b0d11', inner = '#dcdfe6') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><radialGradient id="g" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="${inner}" stop-opacity="0.95"/><stop offset="45%" stop-color="${inner}" stop-opacity="0.85"/><stop offset="100%" stop-color="${outer}" stop-opacity="1"/></radialGradient></defs><rect width="640" height="640" rx="36" fill="${outer}"/><circle cx="320" cy="320" r="230" fill="url(#g)" stroke="${inner}" stroke-width="18" stroke-opacity="0.25"/><circle cx="320" cy="320" r="46" fill="${outer}" stroke="${inner}" stroke-width="12" stroke-opacity="0.6"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const makeCard = (bg = '#0b0d11', accent = '#f5f0e5') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg}" stop-opacity="0.95"/><stop offset="100%" stop-color="${bg}" stop-opacity="0.75"/></linearGradient></defs><rect width="640" height="640" rx="36" fill="url(#g)"/><rect x="80" y="110" width="480" height="420" rx="28" fill="none" stroke="${accent}" stroke-width="14" stroke-opacity="0.4"/><circle cx="320" cy="220" r="48" fill="${accent}" fill-opacity="0.5"/><rect x="210" y="320" width="220" height="24" rx="12" fill="${accent}" fill-opacity="0.4"/><rect x="180" y="370" width="280" height="18" rx="9" fill="${accent}" fill-opacity="0.35"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const makeLightstick = (bg = '#0b0d11', accent = '#cfe8ff') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg}" stop-opacity="0.95"/><stop offset="100%" stop-color="${bg}" stop-opacity="0.7"/></linearGradient></defs><rect width="640" height="640" rx="36" fill="url(#g)"/><circle cx="320" cy="220" r="90" fill="${accent}" fill-opacity="0.6"/><rect x="300" y="310" width="40" height="200" rx="18" fill="${accent}" fill-opacity="0.4"/><rect x="270" y="520" width="100" height="40" rx="18" fill="${accent}" fill-opacity="0.6"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const buildBg = (url) =>
  `linear-gradient(135deg, rgba(0,0,0,0.08), rgba(0,0,0,0.02)), url("${url}")`
