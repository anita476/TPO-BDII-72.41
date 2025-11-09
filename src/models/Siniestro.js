import mongoose from "mongoose";

const siniestroSchema = new mongoose.Schema({
  id_siniestro: { type: Number, required: true, unique: true },
  nro_poliza: { type: String, required: true, ref: "Poliza" },
  fecha: { type: String, required: true },
  tipo: {
    type: String,
    required: true,
    enum: ["Accidente", "Robo", "Danio", "Incendio"],
  },
  monto_estimado: { type: Number, required: true },
  descripcion: { type: String, default: "" },
  estado: {
    type: String,
    required: true,
    enum: ["Abierto", "Cerrado", "En evaluacion"],
  },
});

const Siniestro = mongoose.model("Siniestro", siniestroSchema);

export default Siniestro;
