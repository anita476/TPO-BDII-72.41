
import Cliente from "../models/Cliente.js";
import cliente from "../models/Cliente.js";

export async function query1(req,res) {
    const cli = cliente.aggregate([
        {
            $project: {
                activo: 1,
                apellido: 1,
                ciudad: 1,
                direccion: 1,
                dni: 1,
                email: 1,
                id_cliente: 1,
                nombre: 1,
                polizas: {
                    $filter: {
                        input: "$polizas",
                        as: "poliza",
                        cond: { $eq: ["$$poliza.estado", "Activa"] }
                    }
                },
                provincia: 1,
                telefono: 1
            }
        },
        {
            $match: {
                activo: true
            }
        }
    ])
    const resp = await cli.exec()
    console.log("RES\n")
    console.log(resp)
    res.json(resp)
}