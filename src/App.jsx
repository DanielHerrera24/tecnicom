import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Servicios from "./pages/Servicios";
import Reportes from "./pages/Reportes";
import Gastos from "./pages/Gastos";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <Router basename="/danielherrera24.github.io/tecnicom/">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <div className="flex flex-col lg:flex-row min-h-screen">
                  <Navbar />
                  <div className="flex-1 bg-white p-4 lg:p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/clientes" element={<Clientes />} /> 
                      <Route path="/servicios" element={<Servicios />} />
                      <Route path="/reportes" element={<Reportes />} />
                      <Route path="/gastos" element={<Gastos />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}



