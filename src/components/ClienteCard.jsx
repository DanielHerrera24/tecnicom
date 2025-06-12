import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import EditarClienteModal from "./EditarClienteModal"; // importa el modal

export default function ClienteCard({ cliente, onClienteActualizado, onClienteEliminado }) {
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

  const eliminarCliente = async () => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      await deleteDoc(doc(db, "clientes", cliente.id));
      onClienteEliminado(cliente.id);
    }
  };

  const cerrarModalEditar = (clienteActualizado) => {
    setMostrarModalEditar(false);
    if (clienteActualizado) {
      onClienteActualizado(clienteActualizado);
    }
  };

  return (
    <div className="bg-white shadow rounded-2xl p-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#2c94ea]">
            {cliente.nombre}
          </h2>
          <p className="text-sm text-gray-600">📞 {cliente.telefono}</p>
          {cliente.notas && (
            <p className="text-sm text-gray-600">📝 {cliente.notas}</p>
          )}
        </div>
        <div className="space-x-2">
          <button
            className="text-sm text-yellow-600 hover:underline"
            onClick={() => setMostrarModalEditar(true)}
          >
            Editar
          </button>
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={eliminarCliente}
          >
            Eliminar
          </button>
        </div>
      </div>

      {mostrarModalEditar && (
        <EditarClienteModal cliente={cliente} onClose={cerrarModalEditar} />
      )}
    </div>
  );
}
