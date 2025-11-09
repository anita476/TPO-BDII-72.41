import mongoose from "mongoose";

const agenteSchema = new mongoose.Schema({
  id_agente: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true },
  zona: { type: String, required: true },
  activo: { type: Boolean, default: true },
});

const Agente = mongoose.model("Agente", agenteSchema);

export default Agente;
