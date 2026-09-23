/**
 * Navigation Configuration
 *
 * Defines which pages appear in the site navigation and their display order.
 * Astro handles routing via the filesystem — this only controls nav menus.
 */

export interface NavItem {
  label: string;
  href: string;
  order: number;
}

export const navItems: NavItem[] = [
  { label: 'Available Pieces', href: '/#shop', order: 1 },
  { label: 'Custom Jewelry', href: '/#custom', order: 2 },
  { label: 'Meet Salem', href: '/#story', order: 3 },
];

/** Primary call to action shown as a pill in the header */
export const navCta = { label: 'Start a Custom Order', href: '/#contact' };

/** Social profiles shown in the footer. TODO: add real URLs. */
export const socialNav = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
];

/**
 * Get navigation items sorted by order
 */
export function getNavItems(): NavItem[] {
  return [...navItems].sort((a, b) => a.order - b.order);
}
