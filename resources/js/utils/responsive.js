/**
 * Responsive Design Utilities
 * Breakpoints: 320px, 480px, 768px, 1024px, 1440px
 */

export const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
};

/**
 * Media query hooks
 */
export const useMediaQuery = (breakpoint) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [breakpoint, matches]);

  return matches;
};

/**
 * Responsive spacing helper
 */
export const getResponsiveSpacing = (xs, sm, md, lg, xl) => ({
  xs,
  sm,
  md,
  lg,
  xl,
});

/**
 * Responsive font size helper
 */
export const getResponsiveFontSize = (xs, sm, md, lg, xl) => ({
  xs,
  sm,
  md,
  lg,
  xl,
});

/**
 * Check if mobile
 */
export const isMobile = () => {
  return typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.md;
};

/**
 * Check if tablet
 */
export const isTablet = () => {
  return (
    typeof window !== 'undefined' &&
    window.innerWidth >= BREAKPOINTS.md &&
    window.innerWidth < BREAKPOINTS.lg
  );
};

/**
 * Check if desktop
 */
export const isDesktop = () => {
  return typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.lg;
};

