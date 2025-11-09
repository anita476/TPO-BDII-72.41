import mongoose from "mongoose";

const vehiculoSchema = new mongoose.Schema({
  id_vehiculo: { type: Number, required: true, unique: true },
  id_cliente: { type: Number, required: true, ref: "Cliente" },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  patente: { type: String, required: true, unique: true },
  nro_chasis: { type: String, required: false, unique: true },
  asegurado: { type: Boolean, default: false },
});

const Vehiculo = mongoose.model("Vehiculo", vehiculoSchema);

export default Vehiculo;
