import cliente from "../models/Cliente.js";

export async function query11(req, res) {
  const cli = cliente.aggregate([
    {
      $lookup: {
        from: "vehiculos",
        let: { clienteId: "$id_cliente" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$id_cliente", "$$clienteId"] },
              asegurado: true,
            },
          },
        ],
        as: "vehiculo",
      },
    },
    {
      $group: {
        _id: "$id_cliente",
        nombre: { $first: "$nombre" },
        apellido: { $first: "$apellido" },
        telefono: { $first: "$telefono" },
        email: { $first: "$email" },
        dni: { $first: "$dni" },
        ciudad: { $first: "$ciudad" },
        provincia: { $first: "$provincia" },
        direccion: { $first: "$direccion" },
        activo: { $first: "$activo" },
        total_vehiculos_asegurados: { $sum: { $size: "$vehiculo" } },
      },
    },
    {
      $match: { total_vehiculos_asegurados: { $gt: 1 } },
    },
  ]);
  const resp = await cli.exec();
  console.log("RES\n");
  console.log(resp);
  res.json(resp);
}
