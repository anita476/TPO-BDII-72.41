import siniestro from "../models/Siniestro.js";
import vehiculo from "../models/Vehiculo.js";
import agente from "../models/Agente.js";

export async function query5(req,res) {
    const ag = agente.aggregate([
        {
            $match: { "activo": true }
        },
        {
            $lookup: {
                from: "clientes",
                let: { agenteId: "$id_agente" },
                pipeline: [
                    { $unwind: "$polizas" },
                    {
                        $match: {
                            $expr: {
                                $eq: ["$polizas.id_agente", "$$agenteId"]
                            }
                        }
                    }
                ],
                as: "polizas_matched"
            }
        },
        {
            $addFields: {
                total_polizas: { $size: "$polizas_matched" }
            }
        },
        {
            $project: {
                polizas_matched: 0
            }
        }
    ])
    const resp = await ag.exec()
    console.log("RES\n")
    console.log(resp)
    res.json(resp)
}