// src/components/EditarServicioModal.jsx
import { useState, useEffect, useRef } from "react";
import { db, storage } from "../firebase";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { FiPaperclip, FiX, FiDownload } from "react-icons/fi";

export default function EditarServicioModal({ servicio, onClose }) {
  const [titulo, setTitulo] = useState(servicio.titulo || "");
  const [estado, setEstado] = useState(servicio.estado || "Pendiente");
  const [precio, setPrecio] = useState(servicio.precio || "");
  const [notas, setNotas] = useState(servicio.notas || "");
  const [metodoPago, setMetodoPago] = useState(servicio.metodoPago || "");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(
    servicio.cuentaId || ""
  );
  const [cuentas, setCuentas] = useState([]);
  const [fecha, setFecha] = useState(
    servicio.fecha
      ? servicio.fecha.toDate
        ? servicio.fecha.toDate().toISOString().split("T")[0]
        : new Date(servicio.fecha).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [prioridad, setPrioridad] = useState(servicio.prioridad || "Media");
  const [archivos, setArchivos] = useState(servicio.archivos || []);
  const [nuevosArchivos, setNuevosArchivos] = useState([]);
  const [archivosAEliminar, setArchivosAEliminar] = useState([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const obtenerCuentas = async () => {
      const snapshot = await getDocs(collection(db, "cuentasBancarias"));
      const cuentasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCuentas(cuentasData);
    };
    obtenerCuentas();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map((file) => ({
      file,
      name: file.name,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      type: file.type,
      size: file.size,
      uploading: false,
      id: Date.now() + Math.random().toString(36).substring(2, 9),
    }));

    setNuevosArchivos([...nuevosArchivos, ...newFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const eliminarArchivoExistente = (index) => {
    const archivoAEliminar = archivos[index];
    setArchivosAEliminar([...archivosAEliminar, archivoAEliminar]);
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const eliminarArchivoNuevo = (id) => {
    setNuevosArchivos(nuevosArchivos.filter((archivo) => archivo.id !== id));
  };

  const subirNuevosArchivos = async () => {
    if (nuevosArchivos.length === 0) return [];

    const archivosSubidos = [];

    for (const archivo of nuevosArchivos) {
      try {
        setCargandoArchivos(true);
        const storageRef = ref(
          storage,
          `servicios/${Date.now()}_${archivo.name}`
        );
        await uploadBytes(storageRef, archivo.file);
        const downloadURL = await getDownloadURL(storageRef);

        archivosSubidos.push({
          nombre: archivo.name,
          url: downloadURL,
          tipo: archivo.type,
          tamaño: archivo.size,
          fechaSubida: new Date(),
        });
      } catch (error) {
        console.error("Error al subir archivo:", error);
      }
    }
    setCargandoArchivos(false);
    return archivosSubidos;
  };

  const eliminarArchivosDeStorage = async () => {
    for (const archivo of archivosAEliminar) {
      try {
        // Extract the file path from the URL
        const fileUrl = archivo.url;
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      } catch (error) {
        console.error("Error al eliminar archivo:", error);
      }
    }
  };

  const actualizarServicio = async (e) => {
    e.preventDefault();
    setCargandoArchivos(true);

    // Upload new files
    const archivosSubidos = await subirNuevosArchivos();

    // Delete removed files
    await eliminarArchivosDeStorage();

    // Update service with new data
    const ref = doc(db, "servicios", servicio.id);
    await updateDoc(ref, {
      titulo,
      estado,
      precio: precio ? parseFloat(precio) : 0,
      notas,
      metodoPago,
      cuentaId: metodoPago === "Transferencia" ? cuentaSeleccionada : "",
      fecha: new Date(fecha),
      prioridad,
      archivos: [...archivos, ...archivosSubidos],
    });

    setCargandoArchivos(false);
    onClose(true);
  };

  return (
    <div className="fixed -inset-4 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={actualizarServicio}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-bold mb-4 text-[#2c94ea]">
          Editar Servicio
        </h2>

        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Título del servicio"
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

        <input
          type="number"
          className="w-full p-2 border rounded mb-2"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        ></textarea>

        <select
          className="w-full p-2 border rounded mb-2"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="">Seleccionar método de pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
        </select>

        {metodoPago === "Transferencia" && (
          <select
            className="w-full p-2 border rounded mb-4"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
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

        {/* Existing files */}
        {archivos.length > 0 && (
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivos existentes
            </label>
            <div className="space-y-2">
              {archivos.map((archivo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                      <span className="text-xs">
                        {archivo.nombre.split(".").pop()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p
                        className="font-medium truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        {archivo.nombre}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {(archivo.tamaño / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={archivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiDownload />
                    </a>
                    <button
                      type="button"
                      onClick={() => eliminarArchivoExistente(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New file attachments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agregar archivos
          </label>
          <div
            className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100"
            onClick={() => fileInputRef.current.click()}
          >
            <FiPaperclip className="text-gray-500" size={24} />
            <p className="mt-2 text-gray-500">
              Haz clic aquí para subir archivos
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          {nuevosArchivos.length > 0 && (
            <div className="mt-2 space-y-2">
              {nuevosArchivos.map((archivo) => (
                <div
                  key={archivo.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                      <span className="text-xs">
                        {archivo.name.split(".").pop()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p
                        className="font-medium truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        {archivo.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {(archivo.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => eliminarArchivoNuevo(archivo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="text-sm text-gray-600"
            onClick={() => onClose(false)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargandoArchivos}
            className="bg-[#2c94ea] text-white px-4 py-2 rounded text-sm"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
