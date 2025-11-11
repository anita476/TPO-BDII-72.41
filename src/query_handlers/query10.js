import cliente from "../models/Cliente.js";

export async function query10(req, res) {
  const cli = cliente.aggregate([
    { $unwind: "$polizas" },
    {
      $match: { "polizas.estado": "Suspendida" },
    },
    {
      $project: {
        estadoCliente: "$activo",
        polizas: 1,
      },
    },
  ]);
  const resp = await cli.exec();
  console.log("RES\n");
  console.log(resp);
  res.json(resp);
}
