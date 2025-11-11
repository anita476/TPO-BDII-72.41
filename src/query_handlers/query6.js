import siniestro from "../models/Siniestro.js";
import vehiculo from "../models/Vehiculo.js";
import cliente from "../models/Cliente.js";

export async function query6(req,res) {
    const cli = cliente.aggregate([
        {
            $unwind : "$polizas"
        },
        {$match: {"polizas.estado": "Vencida"}},
        {$project:{
                polizas: 1,
                nombre: 1,
            }}
    ])
    const resp = await cli.exec()
    console.log("RES\n")
    console.log(resp)
    res.json(resp)
}