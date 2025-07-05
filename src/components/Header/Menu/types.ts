export interface MenuItem {
  link: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface MenuProps {
  active: boolean;
  items: MenuItem[];
  position: 'left' | 'right';
  clickHandle: () => void;
  onLogout?: (() => void) | null;
}

export interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  clickHandle?: () => void;
} 