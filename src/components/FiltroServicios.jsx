// src/components/FiltroServicios.jsx
import { useState, useEffect } from "react";

export default function FiltroServicios({ onFilterChange, clientes = [] }) {
  const [estado, setEstado] = useState("todos");
  const [rangoFecha, setRangoFecha] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cliente, setCliente] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [prioridad, setPrioridad] = useState("todas");
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // Set today as default for custom date range
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFechaFin(today);
  }, []);

  // Add handler for priority change
  const handlePrioridadChange = (e) => {
    const nuevaPrioridad = e.target.value;
    setPrioridad(nuevaPrioridad);
    aplicarFiltros(estado, rangoFecha, fechaInicio, fechaFin, cliente, precioMin, precioMax, nuevaPrioridad);
  };

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value;
    setEstado(nuevoEstado);
    aplicarFiltros(nuevoEstado, rangoFecha, fechaInicio, fechaFin, cliente, precioMin, precioMax, prioridad);
  };

  const handleRangoFechaChange = (e) => {
    const nuevoRango = e.target.value;
    setRangoFecha(nuevoRango);
    
    // Calculate date range based on selection
    let inicio = "";
    let fin = new Date().toISOString().split("T")[0]; // Today
    
    if (nuevoRango === "hoy") {
      inicio = fin;
    } else if (nuevoRango === "semana") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      inicio = weekAgo.toISOString().split("T")[0];
    } else if (nuevoRango === "mes") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      inicio = monthAgo.toISOString().split("T")[0];
    } else if (nuevoRango === "personalizado") {
      // Keep existing custom dates
    } else {
      // "todos" - reset dates
      inicio = "";
      fin = "";
    }
    
    setFechaInicio(inicio);
    setFechaFin(fin);
    
    aplicarFiltros(estado, nuevoRango, inicio, fin, cliente, precioMin, precioMax, prioridad);
  };

  const handleFechaInicioChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaInicio(nuevaFecha);
    aplicarFiltros(estado, "personalizado", nuevaFecha, fechaFin, cliente, precioMin, precioMax, prioridad);
  };

  const handleFechaFinChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaFin(nuevaFecha);
    aplicarFiltros(estado, "personalizado", fechaInicio, nuevaFecha, cliente, precioMin, precioMax, prioridad);
  };

  const handleClienteChange = (e) => {
    const nuevoCliente = e.target.value;
    setCliente(nuevoCliente);
    aplicarFiltros(estado, rangoFecha, fechaInicio, fechaFin, nuevoCliente, precioMin, precioMax, prioridad);
  };

  const handlePrecioMinChange = (e) => {
    const nuevoPrecio = e.target.value;
    setPrecioMin(nuevoPrecio);
    aplicarFiltros(estado, rangoFecha, fechaInicio, fechaFin, cliente, nuevoPrecio, precioMax, prioridad);
  };

  const handlePrecioMaxChange = (e) => {
    const nuevoPrecio = e.target.value;
    setPrecioMax(nuevoPrecio);
    aplicarFiltros(estado, rangoFecha, fechaInicio, fechaFin, cliente, precioMin, nuevoPrecio, prioridad);
  };

  const aplicarFiltros = (estado, rango, inicio, fin, cliente, min, max, prioridad) => {
    onFilterChange({
      estado,
      rangoFecha: rango,
      fechaInicio: inicio,
      fechaFin: fin,
      cliente,
      precioMin: min ? parseFloat(min) : null,
      precioMax: max ? parseFloat(max) : null,
      prioridad
    });
  };

  const limpiarFiltros = () => {
    setEstado("todos");
    setRangoFecha("todos");
    setFechaInicio("");
    setFechaFin("");
    setCliente("");
    setPrecioMin("");
    setPrecioMax("");
    setPrioridad("todas");
    aplicarFiltros("todos", "todos", "", "", "", "", "", "todas");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border mb-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {/* Estado filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            className="w-full p-2 border rounded text-sm"
            value={estado}
            onChange={handleEstadoChange}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en proceso">En proceso</option>
            <option value="completado">Completado</option>
            <option value="completado y pagado">Completado y pagado</option>
          </select>
        </div>

        {/* Date range filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
          <select
            className="w-full p-2 border rounded text-sm"
            value={rangoFecha}
            onChange={handleRangoFechaChange}
          >
            <option value="todos">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        {/* Client filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select
            className="w-full p-2 border rounded text-sm"
            value={cliente}
            onChange={handleClienteChange}
          >
            <option value="">Todos los clientes</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            className="w-full p-2 border rounded text-sm"
            value={prioridad}
            onChange={handlePrioridadChange}
          >
            <option value="todas">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Custom date range inputs */}
      {rangoFecha === "personalizado" && (
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              className="w-full p-2 border rounded text-sm"
              value={fechaInicio}
              onChange={handleFechaInicioChange}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              className="w-full p-2 border rounded text-sm"
              value={fechaFin}
              onChange={handleFechaFinChange}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
        >
          {mostrarFiltrosAvanzados ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
        </button>
        
        <button
          type="button"
          className="text-sm text-gray-600 hover:underline"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Advanced filters */}
      {mostrarFiltrosAvanzados && (
        <div className="mt-2 pt-2 border-t">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio mínimo</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                placeholder="Mínimo"
                value={precioMin}
                onChange={handlePrecioMinChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                placeholder="Máximo"
                value={precioMax}
                onChange={handlePrecioMaxChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


