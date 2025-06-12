import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/clientes", label: "Clientes" },
  { to: "/servicios", label: "Servicios" },
  { to: "/gastos", label: "Gastos" },
  { to: "/reportes", label: "Reportes" },
];

export default function Navbar() {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-[#2c94ea] text-white lg:w-auto lg:min-h-screen p-4 lg:p-6 relative">
      {/* Mobile header with toggle button */}
      <div className="flex justify-between items-center lg:block">
        <h1 className="text-xl font-bold lg:mb-10">Taller Tecnicom</h1>
        <button 
          className="lg:hidden text-white p-2 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation menu - hidden on mobile unless toggled */}
      <ul className={`space-y-4 ${mobileMenuOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0`}>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `block px-2 py-1 rounded hover:bg-white hover:text-[#2c94ea] transition ${
                  isActive ? "bg-white text-[#2c94ea]" : ""
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
        <li className="mt-6">
          <button
            onClick={logout}
            className="w-full text-sm bg-white text-[#f00] px-3 py-1 rounded hover:bg-blue-100"
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  );
}
