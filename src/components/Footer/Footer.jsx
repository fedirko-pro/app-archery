import React from 'react';
import './Footer.scss';
import { Link, NavLink } from 'react-router-dom';

const Footer = () => (
  <footer>
    <NavLink to="/converter">v.1.0.1 &copy; FEDIRKO.PRO</NavLink>
    <Link
      to="https://uarchery.org"
      target="_blank"
      className="central_button"
    />
    <NavLink to="/about">About</NavLink>
  </footer>
);

export default Footer;
