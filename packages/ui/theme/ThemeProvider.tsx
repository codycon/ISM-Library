import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

function generateColorVars(hex: string, prefix: string = 'primary') {
  return {
    [`--${prefix}`]: hex,
  };
}

interface CustomBackground {
  type: 'image' | 'video';
  path: string;
  blend_mode?: string;
  filter?: string;
}

export interface ThemeConfig {
  name?: string;
  custom_css?: string;
  colors?: Record<string, string>;
  background?: {
    image?: string;
    video?: string;
    blend_mode?: string;
    filter?: string;
  };
  style?: {
    border_radius?: string;
    radius_sm?: string;
    radius_md?: string;
    radius_lg?: string;
    radius_full?: string;
    blur?: string;
    shadow?: string;
    shadow_subtle?: string;
    shadow_floating?: string;
    app_opacity?: string;
    transition_speed?: string;
    transition_fast?: string;
    transition_smooth?: string;
    button_hover?: string;
    surface_blur?: string;
    surface_opacity?: number;
  };
  logo?: {
    image?: string;
    opacity?: string;
  };
}

export interface CustomLogo {
  image?: string;
  opacity?: string;
}

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (hex: string) => void;
  customBackground: CustomBackground | null;
  setCustomBackground: (bg: CustomBackground | null) => void;
  customLogo: CustomLogo | null;
  loadThemeFromJson: (jsonString: string) => boolean;
  clearCustomTheme: () => void;
  themeMode: string;
  setThemeMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  accentColor: '#10b981',
  setAccentColor: () => {},
  customBackground: null,
  setCustomBackground: () => {},
  customLogo: null,
  loadThemeFromJson: () => false,
  clearCustomTheme: () => {},
  themeMode: 'dark',
  setThemeMode: () => {},
});

const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const getStoredValue = (key: string) => (canUseDOM() ? window.localStorage.getItem(key) : null);
const setStoredValue = (key: string, value: string) => {
  if (canUseDOM()) window.localStorage.setItem(key, value);
};
const removeStoredValue = (key: string) => {
  if (canUseDOM()) window.localStorage.removeItem(key);
};

const setRootProperty = (key: string, value: string) => {
  if (canUseDOM()) document.documentElement.style.setProperty(key, value);
};
const removeRootProperty = (key: string) => {
  if (canUseDOM()) document.documentElement.style.removeProperty(key);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [accentColor, setAccentColorState] = useState<string>('#10b981');
  const [customBackground, setCustomBackgroundState] = useState<CustomBackground | null>(null);
  const [customLogoState, setCustomLogoState] = useState<CustomLogo | null>(null);
  const [themeMode, setThemeModeState] = useState<string>(() => getStoredValue('theme') || 'dark');

  const setCustomBackground = (bg: CustomBackground | null) => {
    setCustomBackgroundState(bg);
    if (bg) {
      setStoredValue('custom_bg', JSON.stringify(bg));
    } else {
      removeStoredValue('custom_bg');
    }
  };

  const applyColorVars = (hex: string) => {
    const vars = generateColorVars(hex);
    Object.entries(vars).forEach(([key, value]) => {
      setRootProperty(key, value);
    });
  };

  const setAccentColor = (hex: string) => {
    if (/^#[0-9A-F]{3,8}$/i.test(hex)) {
      applyColorVars(hex);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setAccentColorState(hex);
        setStoredValue('accent_color', hex);

        const activeMode = getStoredValue('theme');
        if (activeMode === 'custom') {
          const savedThemeJson = getStoredValue('active_custom_theme_json');
          if (savedThemeJson) {
            try {
              const parsed = JSON.parse(savedThemeJson);
              if (!parsed.colors) parsed.colors = {};
              parsed.colors.primary = hex;
              setStoredValue('active_custom_theme_json', JSON.stringify(parsed, null, 2));
            } catch (e) {}
          }
        }
      }, 50);
    }
  };

  // Parses a raw JSON theme object and applies all the custom colors and radii as CSS variables to the root.
  const loadThemeFromJson = (jsonString: string): boolean => {
    try {
      const config: ThemeConfig = JSON.parse(jsonString);
      if (!config.colors) return false;

      const v3Colors: Record<string, string | undefined> = {
        '--bg-base': config.colors.background || config.colors['bg-color'],
        '--background': config.colors.background || config.colors['bg-color'],
        '--text-primary': config.colors.foreground || config.colors['text-color'],
        '--foreground': config.colors.foreground || config.colors['text-color'],
        '--bg-surface': config.colors.content1 || config.colors['sidebar-bg'],
        '--content1': config.colors.content1 || config.colors['sidebar-bg'],
        '--bg-elevated': config.colors.content2 || config.colors['bg-secondary'],
        '--content2': config.colors.content2 || config.colors['bg-secondary'],
        '--border-subtle': config.colors.border_subtle || config.colors.content3 || config.colors['input-bg'],
        '--content3': config.colors.content3 || config.colors['input-bg'],
        '--bg-overlay': config.colors.bg_overlay,
        '--text-secondary': config.colors.text_secondary,
        '--text-muted': config.colors.text_muted,
      };

      if (config.colors.border) {
        v3Colors['--content4'] = config.colors.border;
      }
      if (config.colors.border_strong || config.colors.border) {
        v3Colors['--border-strong'] = config.colors.border_strong || config.colors.border;
      }

      Object.entries(v3Colors).forEach(([key, color]) => {
        if (color && (color.startsWith('rgba') || /^#[0-9A-F]{3,8}$/i.test(color))) {
          setRootProperty(key, color);
        }
      });

      const semanticColors = ['primary', 'secondary', 'success', 'warning', 'danger', 'default'];
      semanticColors.forEach((colorName) => {
        const hex = config.colors![colorName];
        if (hex && /^#[0-9A-F]{3,8}$/i.test(hex)) {
          const vars = generateColorVars(hex, colorName);
          Object.entries(vars).forEach(([k, v]) => {
            setRootProperty(k, v);
          });
          if (colorName === 'primary') {
            setAccentColorState(hex);
            setStoredValue('accent_color', hex);
          }
        }
      });

      if (config.style) {
        if (config.style.radius_sm) setRootProperty('--radius-sm', config.style.radius_sm);
        else if (config.style.border_radius) setRootProperty('--radius-sm', config.style.border_radius);
        
        if (config.style.radius_md) setRootProperty('--radius-md', config.style.radius_md);
        else if (config.style.border_radius) setRootProperty('--radius-md', config.style.border_radius);
        
        if (config.style.radius_lg) setRootProperty('--radius-lg', config.style.radius_lg);
        else if (config.style.border_radius) setRootProperty('--radius-lg', config.style.border_radius);

        if (config.style.radius_full) setRootProperty('--radius-full', config.style.radius_full);

        if (config.style.surface_blur) {
          setRootProperty('--glass-blur', config.style.surface_blur);
        } else if (config.style.blur) {
          setRootProperty('--glass-blur', config.style.blur);
        }
        if (config.style.shadow) {
          setRootProperty('--shadow-elevated', config.style.shadow);
        }
        if (config.style.shadow_subtle) {
          setRootProperty('--shadow-subtle', config.style.shadow_subtle);
        }
        if (config.style.shadow_floating) {
          setRootProperty('--shadow-floating', config.style.shadow_floating);
        }
        if (config.style.surface_opacity !== undefined) {
          setRootProperty('--app-opacity', config.style.surface_opacity.toString());
        } else if (config.style.app_opacity) {
          setRootProperty('--app-opacity', config.style.app_opacity);
        }
        if (config.style.transition_speed) {
          setRootProperty('--transition-speed', config.style.transition_speed);
        }
        if (config.style.transition_fast) {
          setRootProperty('--transition-fast', config.style.transition_fast);
        }
        if (config.style.transition_smooth) {
          setRootProperty('--transition-smooth', config.style.transition_smooth);
        }
        if (config.style.button_hover) {
          setRootProperty('--button-hover', config.style.button_hover);
        }
      }

      if (config.background) {
        const bgUrl = config.background.video || config.background.image;
        if (bgUrl) {
          const type = config.background.video ? 'video' : 'image';
          setCustomBackground({ 
            type, 
            path: bgUrl,
            blend_mode: config.background.blend_mode,
            filter: config.background.filter,
          });
        } else {
          setCustomBackground(null);
        }
      } else {
        setCustomBackground(null);
      }

      if (config.logo) {
        setCustomLogoState(config.logo);
      } else {
        setCustomLogoState(null);
      }
      
      if (canUseDOM()) {
        let styleTag = document.getElementById('ism-custom-css');
        if (config.custom_css) {
          if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'ism-custom-css';
            document.head.appendChild(styleTag);
          }
          styleTag.innerHTML = config.custom_css;
        } else if (styleTag) {
          styleTag.innerHTML = '';
        }
      }

      setStoredValue('active_custom_theme_json', jsonString);
      return true;
    } catch (err) {
      console.error('Failed to parse theme JSON:', err);
      return false;
    }
  };

  const clearCustomTheme = () => {
    removeStoredValue('active_custom_theme_json');
    const keys = [
      '--bg-base',
      '--background',
      '--text-primary',
      '--foreground',
      '--bg-surface',
      '--content1',
      '--bg-elevated',
      '--content2',
      '--border-subtle',
      '--content3',
      '--border-strong',
      '--content4',
      '--secondary',
      '--success',
      '--warning',
      '--danger',
      '--default',
      '--radius-sm',
      '--radius-md',
      '--radius-lg',
      '--glass-blur',
      '--shadow-elevated',
      '--app-opacity',
      '--transition-speed',
      '--button-hover',
    ];
    keys.forEach((k) => removeRootProperty(k));
    setCustomBackground(null);
    setCustomLogoState(null);
    if (canUseDOM()) {
      const styleTag = document.getElementById('ism-custom-css');
      if (styleTag) styleTag.innerHTML = '';
    }
  };

  const setThemeMode = (mode: string) => {
    setThemeModeState(mode);
    setStoredValue('theme', mode);

    if (mode === 'custom') return;

    if (mode === 'light') {
      if (canUseDOM()) document.documentElement.classList.remove('dark');
      clearCustomTheme();
    } else {
      if (canUseDOM()) document.documentElement.classList.add('dark');
      clearCustomTheme();
    }
  };

  useEffect(() => {
    if (!canUseDOM()) return;

    const savedThemeJson = getStoredValue('active_custom_theme_json');
    if (savedThemeJson) {
      loadThemeFromJson(savedThemeJson);
    } else {
      const savedColor = getStoredValue('accent_color');
      if (savedColor && /^#[0-9A-F]{3,8}$/i.test(savedColor)) {
        setAccentColorState(savedColor);
        applyColorVars(savedColor);
      } else {
        setAccentColorState('#10b981');
        applyColorVars('#10b981');
      }
    }

    const savedBg = getStoredValue('custom_bg');
    if (savedBg) {
      try {
        setCustomBackgroundState(JSON.parse(savedBg));
      } catch (e) {
        removeStoredValue('custom_bg');
      }
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        accentColor,
        setAccentColor,
        customBackground,
        setCustomBackground,
        customLogo: customLogoState,
        loadThemeFromJson,
        clearCustomTheme,
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeAccent = () => useContext(ThemeContext);
