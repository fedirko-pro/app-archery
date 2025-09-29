import './Footer.scss';

import { Link, NavLink } from 'react-router-dom';

const Footer = () => (
  <footer>
    <NavLink to="/converter">v.1.0.2 &copy; FEDIRKO.PRO</NavLink>
    <Link to="/" target="_self" className="central_button" />
    <NavLink to="/about">About</NavLink>
  </footer>
);

export default Footer;
