import siniestro from "../models/Siniestro.js";
import vehiculo from "../models/Vehiculo.js";
import cliente from "../models/Cliente.js";



export async function query9(req,res) {
    const cli = cliente.aggregate([
        {
            $unwind: "$polizas"
        },
        {
            $match: { "polizas.estado": "Activa" }
        },
        {
            $addFields: {
                "polizas.fecha_inicio_date": {
                    $dateFromString: {
                        dateString: "$polizas.fecha_inicio",
                        format: "%d/%m/%Y"
                    }
                }
            }
        },
        {
            $sort: { "polizas.fecha_inicio_date": -1 }
        },
        {
            $unset: "polizas.fecha_inicio_date"
        },
        {
            $project: {
                pol: "$polizas"
            }
        }
    ])
    const resp = await cli.exec()
    console.log("RES\n")
    console.log(resp)
    res.json(resp)
}