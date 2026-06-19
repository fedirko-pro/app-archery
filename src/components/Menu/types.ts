export interface MenuItem {
  link: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
  /** @deprecated Use isCollapsible */
  isAdmin?: boolean;
  isCollapsible?: boolean;
  /** i18n key for collapsible section header (e.g. menu.organizerTools) */
  sectionLabelKey?: string;
  /** Render a horizontal separator before this section */
  divider?: boolean;
}

export interface MenuProps {
  active: boolean;
  sections: MenuSection[];
  position: 'left' | 'right';
  clickHandle: () => void;
  onLogout?: (() => void) | null;
  footer?: React.ReactNode;
}

export interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  clickHandle?: () => void;
}
