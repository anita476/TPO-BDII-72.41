import siniestro from "../models/Siniestro.js";
import vehiculo from "../models/Vehiculo.js";
import agente from "../models/Agente.js";

export async function query12(req,res) {
    const agent = agente.aggregate([
        {
            $lookup : {
                from : "clientes",
                localField : "id_agente",
                foreignField : "polizas.id_agente",
                as : "cliente_info"
            }
        },
        {
            $lookup: {
                from: "siniestros",
                localField: "cliente_info.polizas.nro_poliza",
                foreignField: "nro_poliza",
                as: "siniestros_info"
            }
        },
        {
            $group:{
                _id: "$id_agente",
                nombre: { $first: "$nombre" },
                apellido: { $first: "$apellido" },
                activos: { $first: "$activo" },
                email: { $first: "$email" },
                matricula: { $first: "$matricula" },
                telefono: { $first: "$telefono" },
                zona: { $first: "$zona" },

                total_siniestros: { $sum: { $size: "$siniestros_info" } }
            }
        }


    ])
    const resp = await agent.exec()
    console.log("RES\n")
    console.log(resp)
    res.json(resp)
}