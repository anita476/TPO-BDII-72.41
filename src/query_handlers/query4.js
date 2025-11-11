import cliente from "../models/Cliente.js";

export async function query4(req, res) {
  const cli = cliente.find({
    polizas: {
      $not: {
        $elemMatch: {
          estado: "Activa",
        },
      },
    },
  });
  const resp = await cli.exec();
  console.log("RES\n");
  console.log(resp);
  res.json(resp);
}
