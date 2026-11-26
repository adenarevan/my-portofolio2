import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/useLanguage';
export default function AdminNav() {
  const { language } = useLanguage();
  return <nav className="admin-section-nav" aria-label={language === 'id' ? 'Menu admin' : 'Admin menu'}><NavLink to="/admin" end>{language === 'id' ? 'Editor blog' : 'Blog editor'}</NavLink><NavLink to="/admin/bot">Bot Artikel Trending</NavLink></nav>;
}
