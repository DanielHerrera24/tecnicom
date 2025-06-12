// src/components/AgregarServicioModal.jsx
import { useState, useEffect, useRef } from "react";
import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiPaperclip, FiX } from "react-icons/fi";

export default function AgregarServicioModal({ onClose }) {
  const [clientes, setClientes] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [notas, setNotas] = useState("");
  const [precio, setPrecio] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [prioridad, setPrioridad] = useState("Media");
  const [archivos, setArchivos] = useState([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchClientes = async () => {
      const snap = await getDocs(collection(db, "clientes"));
      setClientes(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    const fetchCuentas = async () => {
      const snap = await getDocs(collection(db, "cuentasBancarias"));
      setCuentas(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchClientes();
    fetchCuentas();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => ({
      file,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type,
      size: file.size,
      uploading: false,
      id: Date.now() + Math.random().toString(36).substring(2, 9)
    }));
    
    setArchivos([...archivos, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const eliminarArchivo = (id) => {
    setArchivos(archivos.filter(archivo => archivo.id !== id));
  };

  const subirArchivos = async () => {
    if (archivos.length === 0) return [];
    
    setCargandoArchivos(true);
    const archivosSubidos = [];
    
    for (const archivo of archivos) {
      try {
        const storageRef = ref(storage, `servicios/${Date.now()}_${archivo.name}`);
        await uploadBytes(storageRef, archivo.file);
        const downloadURL = await getDownloadURL(storageRef);
        
        archivosSubidos.push({
          nombre: archivo.name,
          url: downloadURL,
          tipo: archivo.type,
          tamaño: archivo.size,
          fechaSubida: new Date()
        });
      } catch (error) {
        console.error("Error al subir archivo:", error);
      }
    }
    
    setCargandoArchivos(false);
    return archivosSubidos;
  };

  const agregarServicio = async (e) => {
    e.preventDefault();
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;
    
    setCargandoArchivos(true);
    const archivosSubidos = await subirArchivos();
    
    await addDoc(collection(db, "servicios"), {
      clienteId,
      clienteNombre: cliente.nombre,
      titulo,
      estado,
      notas,
      precio: precio ? parseFloat(precio) : 0,
      metodoPago,
      cuentaId: metodoPago === "Transferencia" ? cuentaSeleccionada : "",
      fecha: Timestamp.fromDate(new Date(fecha)),
      fechaCreacion: Timestamp.now(),
      prioridad,
      archivos: archivosSubidos
    });
    
    setCargandoArchivos(false);
    onClose();
  };

  return (
    <div className="fixed -inset-4 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={agregarServicio}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-bold mb-4 text-[#2c94ea]">Agregar Servicio</h2>

        <select
          required
          className="w-full p-2 border rounded mb-2"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Título del servicio"
          className="w-full p-2 border rounded mb-2"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <input
          type="date"
          className="w-full p-2 border rounded mb-2"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />

        <textarea
          placeholder="Notas"
          className="w-full p-2 border rounded mb-2"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        ></textarea>

        <input
          type="number"
          placeholder="Precio"
          className="w-full p-2 border rounded mb-2"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <select
          className="w-full p-2 border rounded mb-2"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Completado">Completado</option>
          <option value="Completado y pagado">Completado y pagado</option>
        </select>

        <select
          className="w-full p-2 border rounded mb-2"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="">Método de pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
        </select>

        {metodoPago === "Transferencia" && (
          <select
            className="w-full p-2 border rounded mb-2"
            value={cuentaSeleccionada}
            onChange={(e) => setCuentaSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una cuenta</option>
            {cuentas.map((cuenta) => (
              <option key={cuenta.id} value={cuenta.id}>
                {cuenta.banco} - {cuenta.titular}
              </option>
            ))}
          </select>
        )}

        {/* Priority selection */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <div className="flex gap-2">
            {["Baja", "Media", "Alta"].map((nivel) => (
              <label 
                key={nivel} 
                className={`flex-1 border rounded p-2 text-center cursor-pointer ${
                  prioridad === nivel 
                    ? nivel === "Alta" 
                      ? "bg-red-100 border-red-500 text-red-700" 
                      : nivel === "Media" 
                        ? "bg-yellow-100 border-yellow-500 text-yellow-700" 
                        : "bg-green-100 border-green-500 text-green-700"
                    : "bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="prioridad"
                  value={nivel}
                  checked={prioridad === nivel}
                  onChange={() => setPrioridad(nivel)}
                  className="sr-only"
                />
                {nivel}
              </label>
            ))}
          </div>
        </div>
        
        {/* File attachments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivos adjuntos</label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiPaperclip className="mx-auto h-6 w-6 text-gray-400" />
            <p className="mt-1 text-sm text-gray-500">
              Haz clic para adjuntar archivos
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
          
          {archivos.length > 0 && (
            <div className="mt-2 space-y-2">
              {archivos.map((archivo) => (
                <div key={archivo.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    {archivo.preview ? (
                      <img src={archivo.preview} alt={archivo.name} className="h-10 w-10 object-cover rounded mr-2" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                        <span className="text-xs">{archivo.name.split('.').pop()}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium truncate" style={{maxWidth: "150px"}}>{archivo.name}</p>
                      <p className="text-gray-500 text-xs">{(archivo.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => eliminarArchivo(archivo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargandoArchivos}
            className="px-4 py-2 text-sm bg-[#2c94ea] text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {cargandoArchivos ? "Guardando..." : "Guardar servicio"}
          </button>
        </div>
      </form>
    </div>
  );
}
