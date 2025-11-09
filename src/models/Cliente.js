// we can use the models to simplify collection creation and then call abm on models more easily !
// https://mongoosejs.com/docs/models.html
import mongoose from "mongoose";

const polizaSchema = new mongoose.Schema({
  nro_poliza: { type: String, required: true, unique: true },
  id_cliente: { type: Number, required: false },
  tipo: {
    type: String,
    required: true,
    enum: ["Auto", "Vida", "Hogar", "Salud"],
  },
  fecha_inicio: { type: String, required: true },
  fecha_fin: { type: String, required: true },
  prima_mensual: { type: Number, required: true },
  cobertura_total: { type: Number, required: true },
  id_agente: { type: Number, required: true, ref: "Agente" },
  estado: {
    type: String,
    required: true,
    enum: ["Activa", "Vencida", "Suspendida"],
  },
});

const clienteSchema = new mongoose.Schema({
  id_cliente: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  dni: { type: Number, required: true, unique: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  provincia: { type: String, required: true },
  activo: { type: Boolean, default: true },
  polizas: [polizaSchema],
});

const Cliente = mongoose.model("Cliente", clienteSchema);

export default Cliente;
