import siniestro from "../models/Siniestro.js";
import vehiculo from "../models/Vehiculo.js";


//NO ANDA
export async function query8(req,res) {
    const now = new Date();
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear(), 0, 1);
    const vehi = siniestro.aggregate([
        {
            $addFields: {
                fechaDate: {
                    $dateFromString: {
                        dateString: "$fecha",
                        format: "%d/%m/%Y"
                    }
                }
            }
        },
        {
            $match: {
                tipo: "Accidente",
                fechaDate: {
                    $gte: new Date(`${lastYearStart}-01-01`),
                    $lt: new Date(`${now.getFullYear()}-01-01`)
                }
            }
        },
        {
            $project: {
                fechaDate: 0  // Remove temporary field from results
            }
        }
    ])
    const resp = await vehi.exec()
    console.log("RES\n")
    console.log(resp)
    res.json(resp)
}