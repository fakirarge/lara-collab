import { Grid as MantineGrid, Stack } from '@mantine/core';
import { useMediaQuery } from '@/utils/responsive';

/**
 * Responsive Grid Component
 * Automatically adjusts columns based on screen size
 */
export default function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  spacing = 'md',
  ...props
}) {
  const isMobile = useMediaQuery('xs') && !useMediaQuery('sm');
  const isTablet = useMediaQuery('md') && !useMediaQuery('lg');
  const isDesktop = useMediaQuery('lg');

  // Determine number of columns
  let currentCols = cols.xs || 1;
  if (useMediaQuery('sm')) currentCols = cols.sm || currentCols;
  if (useMediaQuery('md')) currentCols = cols.md || currentCols;
  if (useMediaQuery('lg')) currentCols = cols.lg || currentCols;
  if (useMediaQuery('xl')) currentCols = cols.xl || currentCols;

  // On mobile, use Stack instead of Grid for better UX
  if (isMobile && currentCols === 1) {
    return (
      <Stack spacing={spacing} {...props}>
        {children}
      </Stack>
    );
  }

  return (
    <MantineGrid gutter={spacing} {...props}>
      {children}
    </MantineGrid>
  );
}

