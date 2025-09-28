export interface MenuItem {
  link: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
  isAdmin?: boolean;
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
