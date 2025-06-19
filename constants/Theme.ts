export const Theme = {
  colors: {
    // Primary Colors
    primary: '#FFA94D', // Light Orange - Main buttons, highlights, progress bars
    primaryDarker: '#FF8F1F', // Deep Orange - Button hover, headers, CTA emphasis
    
    // Accent Colors
    accent: '#FFE0B2', // Peach - Secondary elements, cards, icons
    
    // Background Colors
    background: '#FFFDF9', // Off-White - App background
    surface: '#FFFFFF', // White - Panels, cards, modals
    
    // Text Colors
    textPrimary: '#2C2C2C', // Charcoal Gray - Headings, main content
    textSecondary: '#707070', // Medium Gray - Labels, placeholders
    
    // Status Colors
    success: '#4CAF50', // Soft Green - Task complete, confirmations
    warning: '#FFD54F', // Light Amber - Reminders, approaching deadlines
    error: '#F44336', // Coral Red - Errors, failed inputs
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
}; 