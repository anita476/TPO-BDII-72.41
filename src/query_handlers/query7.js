import siniestro from "../models/Siniestro.js";
import vehiculo from "../models/Vehiculo.js";

//NO ANDA
export async function query7(req,res) {
    const vehi = vehiculo.aggregate([
        {
            $match: {asegurado: true}
        },
        {
            $lookup : {
                from: "clientes",
                localField: "id_cliente",
                foreignField: "id_cliente",
                as: "cliente"
            }
        }

    ])
    const resp = await vehi.exec()
    console.log("RES\n")
    console.log(resp)
    res.json(resp)
}