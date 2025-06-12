// src/components/EditarClienteModal.jsx
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EditarClienteModal({ cliente, onClose }) {
  const [nombre, setNombre] = useState(cliente.nombre || "");
  const [telefono, setTelefono] = useState(cliente.telefono || "");
  const [notas, setNotas] = useState(cliente.notas || "");

  const actualizarCliente = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, "clientes", cliente.id);
      await updateDoc(ref, {
        nombre,
        telefono,
        notas,
      });
      onClose({ id: cliente.id, nombre, telefono, notas });
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={actualizarCliente} className="bg-white p-6 rounded-xl shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-[#2c94ea]">Editar cliente</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          required
        />
        <input
          className="w-full p-2 border rounded mb-2"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono"
          required
        />
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Notas"
        ></textarea>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="text-sm text-gray-600"
            onClick={() => onClose()}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-[#2c94ea] text-white px-4 py-2 rounded text-sm"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
