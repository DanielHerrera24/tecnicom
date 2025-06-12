// src/pages/Servicios.jsx
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import EditarServicioModal from "../components/EditarServicioModal";
import AgregarServicioModal from "../components/AgregarServicioModal";
import FiltroServicios from "../components/FiltroServicios";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: "todos",
    rangoFecha: "todos",
    fechaInicio: "",
    fechaFin: "",
    cliente: "",
    precioMin: null,
    precioMax: null,
    prioridad: "todas",
  });

  // Fetch all services
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "servicios"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setServicios(data);
      aplicarFiltros(data, filtros);
    });
    return () => unsubscribe();
  }, [filtros]);

  // Fetch all clients for the filter dropdown
  useEffect(() => {
    const fetchClientes = async () => {
      const clientesSnapshot = await getDocs(collection(db, "clientes"));
      const clientesData = clientesSnapshot.docs.map((doc) => ({
        id: doc.id,
        nombre: doc.data().nombre,
      }));
      setClientes(clientesData);
    };

    fetchClientes();
  }, []);

  const aplicarFiltros = (serviciosData, filtrosActuales) => {
    let resultado = [...serviciosData];

    // Filter by state
    if (filtrosActuales.estado !== "todos") {
      resultado = resultado.filter(
        (servicio) =>
          servicio.estado &&
          servicio.estado.toLowerCase() === filtrosActuales.estado.toLowerCase()
      );
    }

    // Filter by client
    if (filtrosActuales.cliente) {
      resultado = resultado.filter(
        (servicio) => servicio.clienteId === filtrosActuales.cliente
      );
    }

    // Filter by date range
    if (filtrosActuales.fechaInicio || filtrosActuales.fechaFin) {
      resultado = resultado.filter((servicio) => {
        if (!servicio.fecha) return false;

        const servicioDate = servicio.fecha.toDate
          ? servicio.fecha.toDate()
          : new Date(servicio.fecha);

        const fechaServicioStr = servicioDate.toISOString().split("T")[0];

        if (filtrosActuales.fechaInicio && filtrosActuales.fechaFin) {
          return (
            fechaServicioStr >= filtrosActuales.fechaInicio &&
            fechaServicioStr <= filtrosActuales.fechaFin
          );
        } else if (filtrosActuales.fechaInicio) {
          return fechaServicioStr >= filtrosActuales.fechaInicio;
        } else if (filtrosActuales.fechaFin) {
          return fechaServicioStr <= filtrosActuales.fechaFin;
        }

        return true;
      });
    }

    // Filter by price range
    if (filtrosActuales.precioMin !== null) {
      resultado = resultado.filter(
        (servicio) => servicio.precio >= filtrosActuales.precioMin
      );
    }

    if (filtrosActuales.precioMax !== null) {
      resultado = resultado.filter(
        (servicio) => servicio.precio <= filtrosActuales.precioMax
      );
    }

    // Filter by priority
    if (filtrosActuales.prioridad !== "todas") {
      resultado = resultado.filter(
        (servicio) => servicio.prioridad === filtrosActuales.prioridad
      );
    }

    setServiciosFiltrados(resultado);
  };

  const handleFilterChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    aplicarFiltros(servicios, nuevosFiltros);
  };

  const eliminarServicio = async (id) => {
    if (confirm("¿Estás seguro de eliminar este servicio?")) {
      await deleteDoc(doc(db, "servicios", id));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const cerrarModal = () => setServicioSeleccionado(null);
  const cerrarModalAgregar = () => setMostrarModalAgregar(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2c94ea]">Servicios</h2>
        <button
          onClick={() => setMostrarModalAgregar(true)}
          className="bg-[#2c94ea] text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Agregar servicio
        </button>
      </div>

      <FiltroServicios
        onFilterChange={handleFilterChange}
        clientes={clientes}
      />

      <div className="text-sm text-gray-500 mb-2">
        Mostrando {serviciosFiltrados.length} de {servicios.length} servicios
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviciosFiltrados.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">
              No se encontraron servicios con los filtros seleccionados
            </p>
          </div>
        ) : (
          serviciosFiltrados.map((servicio) => (
            <div
              key={servicio.id}
              className="bg-white shadow rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-[#2c94ea]">
                    {servicio.titulo || "Servicio sin título"}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Cliente: </span>
                    {servicio.clienteNombre}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Fecha: </span>
                    {formatDate(servicio.fecha)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Estado: </span>
                    {servicio.estado}
                  </p>

                  {/* Priority badge */}
                  {servicio.prioridad && (
                    <span
                      className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                        servicio.prioridad === "Alta"
                          ? "bg-red-100 text-red-700"
                          : servicio.prioridad === "Media"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Prioridad: {servicio.prioridad}
                    </span>
                  )}

                  {servicio.notas && (
                    <p className="text-sm text-gray-600 mt-2">
                      📝 {servicio.notas}
                    </p>
                  )}
                  {servicio.metodoPago && (
                    <p className="text-sm text-gray-600">
                      <span className="font-bold">Método de pago: </span>
                      {servicio.metodoPago}
                    </p>
                  )}
                  {servicio.precio && (
                    <p className="text-sm font-bold text-gray-600">
                      💰 ${servicio.precio}
                    </p>
                  )}

                  {/* Files section */}
                  {servicio.archivos && servicio.archivos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">
                        📎 Archivos ({servicio.archivos.length})
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {servicio.archivos.slice(0, 3).map((archivo, index) => (
                          <a
                            key={index}
                            href={archivo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <span className="truncate max-w-[100px]">
                              {archivo.nombre}
                            </span>
                          </a>
                        ))}
                        {servicio.archivos.length > 3 && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            +{servicio.archivos.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end text-sm">
                  <button
                    className="text-yellow-600 hover:underline"
                    onClick={() => setServicioSeleccionado(servicio)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => eliminarServicio(servicio.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {servicioSeleccionado && (
        <EditarServicioModal
          servicio={servicioSeleccionado}
          onClose={cerrarModal}
        />
      )}

      {mostrarModalAgregar && (
        <AgregarServicioModal onClose={cerrarModalAgregar} />
      )}
    </div>
  );
}
