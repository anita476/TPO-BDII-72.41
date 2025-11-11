import siniestro from "../models/Siniestro.js";

export async function query2(req, res) {
  const sini = siniestro.aggregate([
    {
      $match: {
        estado: "Abierto",
      },
    },
    {
      $lookup: {
        from: "clientes",
        localField: "nro_poliza",
        foreignField: "polizas.nro_poliza",

        as: "cliente",
      },
    },
    {
      $project: {
        tipo: 1,
        monto_estimado: 1,
        "cliente.nombre": 1,
        "cliente.apellido": 1,
        "cliente.email": 1,
        "cliente.ciudad": 1,
        "cliente.direccion": 1,
        "cliente.dni": 1,
        "cliente.id_cliente": 1,
        "cliente.provincia": 1,
        "cliente.telefono": 1,
      },
    },
  ]);
  const resp = await sini.exec();
  console.log("RES\n");
  console.log(resp);
  res.json(resp);
}
