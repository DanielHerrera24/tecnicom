import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function ModalAgregarCliente({ onClose }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");

  const handleAgregar = async () => {
    if (!nombre || !telefono) return alert("Nombre y teléfono son obligatorios");

    try {
      const docRef = await addDoc(collection(db, "clientes"), {
        nombre,
        telefono,
        notas,
        servicios: [],
        creadoEn: Timestamp.now()
      });
      
      // Pass the new client data back to the parent component
      onClose({ id: docRef.id, nombre, telefono, notas, servicios: [] });
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-[#2c94ea]">Agregar Cliente</h2>

        <input
          type="text"
          placeholder="Nombre"
          className="w-full mb-2 p-2 border rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Teléfono"
          className="w-full mb-2 p-2 border rounded"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <textarea
          placeholder="Notas (opcional)"
          className="w-full mb-4 p-2 border rounded"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <button onClick={() => onClose()} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={handleAgregar} className="px-4 py-2 bg-[#2c94ea] text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </div>
  );
}
