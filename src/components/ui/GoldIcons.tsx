// Gold SVG Icon System for mall2
// Refined line-art style with gold color palette

export const GoldIcons = {
  // Top wear
  Tops: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M16 6 L8 14 L14 16 L14 42 L34 42 L34 16 L40 14 L32 6"/>
      <path d="M16 6 C16 6 20 10 24 10 C28 10 32 6 32 6"/>
      <path d="M8 14 L4 24 L8 24 L8 18"/>
      <path d="M40 14 L44 24 L40 24 L40 18"/>
    </svg>
  ),

  // Bottoms / Pants
  Bottoms: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M10 6 L38 6 L38 10 L10 10 Z"/>
      <path d="M10 10 L8 42 L22 42 L24 24 L26 42 L40 42 L38 10"/>
      <line x1="24" y1="10" x2="24" y2="24"/>
      <path d="M12 6 L12 10" strokeDasharray="2 2"/>
    </svg>
  ),

  // Dress
  Dress: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M19 4 C19 4 22 8 24 8 C26 8 29 4 29 4"/>
      <path d="M19 4 L12 14 L16 16 L12 44 L36 44 L32 16 L36 14 L29 4"/>
      <path d="M16 16 L12 44"/>
      <path d="M32 16 L36 44"/>
      <path d="M12 26 Q24 22 36 26"/>
    </svg>
  ),

  // Outerwear / Jacket
  Outerwear: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M17 5 L8 13 L4 13 L4 28 L10 28 L10 44 L38 44 L38 28 L44 28 L44 13 L40 13 L31 5"/>
      <path d="M17 5 C17 5 20 9 24 9 C28 9 31 5 31 5"/>
      <path d="M24 9 L24 44"/>
      <path d="M8 13 L10 28"/>
      <path d="M40 13 L38 28"/>
    </svg>
  ),

  // Shoes / Sneakers
  Shoes: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad5" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M6 32 C6 32 10 18 18 16 L32 18 C36 18 40 22 42 26 L42 34 C42 34 36 36 24 36 L8 36 C6 36 6 34 6 32Z"/>
      <path d="M18 16 L18 10 C18 10 22 8 24 10 L24 18"/>
      <path d="M6 34 L42 34"/>
      <path d="M12 36 L10 40 L40 40 L42 36"/>
    </svg>
  ),

  // Accessories / Watch
  Accessories: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad6" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="12"/>
      <path d="M16 12 L14 6 L20 6 L22 12"/>
      <path d="M32 12 L34 6 L28 6 L26 12"/>
      <path d="M16 36 L14 42 L20 42 L22 36"/>
      <path d="M32 36 L34 42 L28 42 L26 36"/>
      <line x1="24" y1="18" x2="24" y2="24"/>
      <line x1="24" y1="24" x2="29" y2="24"/>
      <circle cx="24" cy="24" r="1.5" fill="url(#goldGrad6)" stroke="none"/>
    </svg>
  ),

  // Bag / Handbag
  Bags: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad7" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M8 18 L6 42 L42 42 L40 18 Z"/>
      <path d="M16 18 C16 18 16 10 24 10 C32 10 32 18 32 18"/>
      <path d="M8 26 L40 26"/>
      <path d="M20 26 C20 26 20 32 24 32 C28 32 28 26 28 26"/>
      <line x1="16" y1="18" x2="8" y2="18"/>
      <line x1="32" y1="18" x2="40" y2="18"/>
    </svg>
  ),

  // Hat / Cap
  Hats: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad8" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M8 30 C8 30 12 14 24 14 C36 14 40 30 40 30"/>
      <path d="M4 34 C4 34 12 30 24 30 C36 30 44 34 44 34"/>
      <path d="M4 34 L4 38 C4 38 12 36 24 36 L44 36 L44 34"/>
      <path d="M24 14 L24 8"/>
      <path d="M22 8 L26 8"/>
    </svg>
  ),

  // New Arrivals / Star
  NewArrivals: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad9" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M24 4 L28 18 L42 18 L31 26 L35 40 L24 32 L13 40 L17 26 L6 18 L20 18 Z"/>
      <circle cx="24" cy="24" r="4" strokeWidth="0.8"/>
    </svg>
  ),

  // Sale / Tag
  Sale: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGrad10)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGrad10" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M6 6 L6 26 L26 44 C26 44 28 46 30 44 L44 30 C44 30 46 28 44 26 L26 6 Z"/>
      <circle cx="16" cy="16" r="3"/>
      <line x1="18" y1="30" x2="30" y2="18"/>
    </svg>
  ),

  // Shopping Cart
  Cart: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <path d="M2 4 L8 4 L12 28 L36 28 L40 12 L10 12"/>
      <circle cx="16" cy="36" r="3"/>
      <circle cx="32" cy="36" r="3"/>
    </svg>
  ),

  // User / Person
  User: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <circle cx="24" cy="16" r="8"/>
      <path d="M6 44 C6 34 14 28 24 28 C34 28 42 34 42 44"/>
    </svg>
  ),

  // Search
  Search: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <circle cx="22" cy="22" r="14"/>
      <line x1="32" y1="32" x2="44" y2="44"/>
    </svg>
  ),

  // Menu / Hamburger
  Menu: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="24" height="24">
      <line x1="6" y1="14" x2="42" y2="14"/>
      <line x1="6" y1="24" x2="42" y2="24"/>
      <line x1="6" y1="34" x2="42" y2="34"/>
    </svg>
  ),

  // Close / X
  Close: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="24" height="24">
      <line x1="8" y1="8" x2="40" y2="40"/>
      <line x1="40" y1="8" x2="8" y2="40"/>
    </svg>
  ),

  // Arrow Right
  ArrowRight: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <line x1="8" y1="24" x2="40" y2="24"/>
      <polyline points="28,12 40,24 28,36"/>
    </svg>
  ),

  // Heart / Wishlist
  Heart: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M24 40 C24 40 6 28 6 16 C6 10 11 6 17 8 C20 9 22 12 24 14 C26 12 28 9 31 8 C37 6 42 10 42 16 C42 28 24 40 24 40Z"/>
    </svg>
  ),

  // Streetwear / Urban
  Streetwear: () => (
    <svg viewBox="0 0 48 48" fill="none" stroke="url(#goldGradSW)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
      <defs>
        <linearGradient id="goldGradSW" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8882a"/>
          <stop offset="50%" stopColor="#e8c97a"/>
          <stop offset="100%" stopColor="#b8882a"/>
        </linearGradient>
      </defs>
      <path d="M14 4 L10 10 L8 14 L4 14 L4 24 L10 24 L10 44 L38 44 L38 24 L44 24 L44 14 L40 14 L38 10 L34 4 L30 6 L26 4 L22 4 L18 6 Z"/>
      <path d="M18 6 C20 10 22 12 24 12 C26 12 28 10 30 6"/>
      <line x1="24" y1="12" x2="24" y2="44"/>
    </svg>
  ),
};

// Category config with icon and label
export const CATEGORIES = [
  { slug: 'tops',        label: '上衣',      icon: 'Tops' },
  { slug: 'bottoms',     label: '下裝',      icon: 'Bottoms' },
  { slug: 'dress',       label: '連身裙',    icon: 'Dress' },
  { slug: 'outerwear',   label: '外套',      icon: 'Outerwear' },
  { slug: 'streetwear',  label: '街頭潮流',  icon: 'Streetwear' },
  { slug: 'shoes',       label: '鞋款',      icon: 'Shoes' },
  { slug: 'bags',        label: '包包',      icon: 'Bags' },
  { slug: 'accessories', label: '配件',      icon: 'Accessories' },
  { slug: 'hats',        label: '帽子',      icon: 'Hats' },
  { slug: 'new-arrivals',label: '新品',      icon: 'NewArrivals' },
  { slug: 'sale',        label: '特賣',      icon: 'Sale' },
];
