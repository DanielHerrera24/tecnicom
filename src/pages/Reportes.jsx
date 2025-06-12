// src/pages/Reportes.jsx
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Reportes() {
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    ingresoTotal: 0,
    serviciosCompletados: 0,
    serviciosPendientes: 0,
    clientesActivos: 0,
    ingresosPorMes: {},
    serviciosPorEstado: {},
    clientesConMasServicios: [],
    serviciosPorPrioridad: {}
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      
      // Get services
      const serviciosSnapshot = await getDocs(collection(db, "servicios"));
      const serviciosData = serviciosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServicios(serviciosData);
      
      // Get clients
      const clientesSnapshot = await getDocs(collection(db, "clientes"));
      const clientesData = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
      
      setCargando(false);
    };
    
    fetchData();
  }, []);

  // Calculate statistics when data or period changes
  useEffect(() => {
    if (servicios.length === 0) return;
    
    // Set default date range based on selected period
    let hoy = new Date();
    let inicio = new Date();
    
    switch(periodoSeleccionado) {
      case "semana":
        inicio.setDate(hoy.getDate() - 7);
        break;
      case "mes":
        inicio.setMonth(hoy.getMonth() - 1);
        break;
      case "trimestre":
        inicio.setMonth(hoy.getMonth() - 3);
        break;
      case "año":
        inicio.setFullYear(hoy.getFullYear() - 1);
        break;
      case "personalizado":
        inicio = fechaInicio ? new Date(fechaInicio) : new Date(0);
        hoy = fechaFin ? new Date(fechaFin) : new Date();
        break;
    }
    
    // Filter services by date range
    const serviciosFiltrados = servicios.filter(servicio => {
      if (!servicio.fecha) return false;
      const fecha = servicio.fecha.toDate ? servicio.fecha.toDate() : new Date(servicio.fecha);
      return fecha >= inicio && fecha <= hoy;
    });
    
    // Calculate statistics
    const ingresoTotal = serviciosFiltrados.reduce((sum, servicio) => 
      sum + (servicio.precio || 0), 0);
    
    const serviciosCompletados = serviciosFiltrados.filter(
      servicio => servicio.estado === "Completado" || servicio.estado === "Completado y pagado"
    ).length;
    
    const serviciosPendientes = serviciosFiltrados.filter(
      servicio => servicio.estado === "Pendiente" || servicio.estado === "En proceso"
    ).length;
    
    // Count services by state
    const serviciosPorEstado = serviciosFiltrados.reduce((acc, servicio) => {
      const estado = servicio.estado || "Sin estado";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
    
    // Count services by priority
    const serviciosPorPrioridad = serviciosFiltrados.reduce((acc, servicio) => {
      const prioridad = servicio.prioridad || "Sin prioridad";
      acc[prioridad] = (acc[prioridad] || 0) + 1;
      return acc;
    }, {});
    
    // Group revenue by month
    const ingresosPorMes = serviciosFiltrados.reduce((acc, servicio) => {
      if (!servicio.fecha || !servicio.precio) return acc;
      
      const fecha = servicio.fecha.toDate ? servicio.fecha.toDate() : new Date(servicio.fecha);
      const mes = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
      
      acc[mes] = (acc[mes] || 0) + servicio.precio;
      return acc;
    }, {});
    
    // Count services by client
    const serviciosPorCliente = serviciosFiltrados.reduce((acc, servicio) => {
      if (!servicio.clienteId) return acc;
      acc[servicio.clienteId] = (acc[servicio.clienteId] || 0) + 1;
      return acc;
    }, {});
    
    // Get top 5 clients with most services
    const clientesConMasServicios = Object.entries(serviciosPorCliente)
      .map(([clienteId, cantidad]) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return {
          id: clienteId,
          nombre: cliente ? cliente.nombre : "Cliente desconocido",
          cantidad
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
    
    // Count active clients (clients with at least one service in the period)
    const clientesActivos = Object.keys(serviciosPorCliente).length;
    
    setEstadisticas({
      ingresoTotal,
      serviciosCompletados,
      serviciosPendientes,
      clientesActivos,
      ingresosPorMes,
      serviciosPorEstado,
      clientesConMasServicios,
      serviciosPorPrioridad
    });
    
  }, [servicios, clientes, periodoSeleccionado, fechaInicio, fechaFin]);

  const handlePeriodoChange = (e) => {
    setPeriodoSeleccionado(e.target.value);
  };

  // Prepare chart data
  const ingresosPorMesData = {
    labels: Object.keys(estadisticas.ingresosPorMes),
    datasets: [
      {
        label: 'Ingresos por mes',
        data: Object.values(estadisticas.ingresosPorMes),
        backgroundColor: 'rgba(44, 148, 234, 0.6)',
        borderColor: 'rgba(44, 148, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const serviciosPorEstadoData = {
    labels: Object.keys(estadisticas.serviciosPorEstado),
    datasets: [
      {
        label: 'Servicios por estado',
        data: Object.values(estadisticas.serviciosPorEstado),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const serviciosPorPrioridadData = {
    labels: Object.keys(estadisticas.serviciosPorPrioridad),
    datasets: [
      {
        label: 'Servicios por prioridad',
        data: Object.values(estadisticas.serviciosPorPrioridad),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2c94ea]">Reportes</h2>
        
        <div className="flex items-center gap-2">
          <select
            className="p-2 border rounded"
            value={periodoSeleccionado}
            onChange={handlePeriodoChange}
          >
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
            <option value="trimestre">Último trimestre</option>
            <option value="año">Último año</option>
            <option value="personalizado">Personalizado</option>
          </select>
          
          {periodoSeleccionado === "personalizado" && (
            <div className="flex gap-2">
              <input
                type="date"
                className="p-2 border rounded"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
              <input
                type="date"
                className="p-2 border rounded"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      
      {cargando ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-500 text-sm">Ingresos Totales</h3>
              <p className="text-2xl font-bold text-[#2c94ea]">
                ${estadisticas.ingresoTotal.toLocaleString('es-MX')}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-500 text-sm">Servicios Completados</h3>
              <p className="text-2xl font-bold text-green-600">
                {estadisticas.serviciosCompletados}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-500 text-sm">Servicios Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {estadisticas.serviciosPendientes}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-500 text-sm">Clientes Activos</h3>
              <p className="text-2xl font-bold text-purple-600">
                {estadisticas.clientesActivos}
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Month */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Ingresos por Mes</h3>
              <div className="h-64">
                <Bar 
                  data={ingresosPorMesData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            </div>
            
            {/* Services by State */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Servicios por Estado</h3>
              <div className="h-64">
                <Pie 
                  data={serviciosPorEstadoData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }} 
                />
              </div>
            </div>
            
            {/* Services by Priority */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Servicios por Prioridad</h3>
              <div className="h-64">
                <Pie 
                  data={serviciosPorPrioridadData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }} 
                />
              </div>
            </div>
            
            {/* Top Clients */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Clientes con Más Servicios</h3>
              <div className="space-y-2">
                {estadisticas.clientesConMasServicios.map((cliente) => (
                  <div key={cliente.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{cliente.nombre}</span>
                    <span className="font-semibold">{cliente.cantidad} servicios</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
