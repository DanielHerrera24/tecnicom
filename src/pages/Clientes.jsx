import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ClienteCard from "../components/ClienteCard";
import ModalAgregarCliente from "../components/ModalAgregarCliente";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const obtenerClientes = async () => {
      const q = query(collection(db, "clientes"), orderBy("nombre"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClientes(lista);
    };
    obtenerClientes();
  }, []);

  const handleClienteActualizado = (clienteActualizado) => {
    setClientes((prevClientes) =>
      prevClientes.map((cliente) =>
        cliente.id === clienteActualizado.id ? clienteActualizado : cliente
      )
    );
  };

  const handleClienteEliminado = (clienteId) => {
    setClientes((prevClientes) =>
      prevClientes.filter((cliente) => cliente.id !== clienteId)
    );
  };

  const handleModalClose = (nuevoCliente) => {
    setMostrarModal(false);

    // If a new client was added, update the state
    if (nuevoCliente) {
      setClientes((prevClientes) => [...prevClientes, nuevoCliente]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2c94ea]">Clientes</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-[#2c94ea] text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Agregar cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.sort().map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onClienteActualizado={handleClienteActualizado}
            onClienteEliminado={handleClienteEliminado}
          />
        ))}
      </div>

      {mostrarModal && <ModalAgregarCliente onClose={handleModalClose} />}
    </div>
  );
}
