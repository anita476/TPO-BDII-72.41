import Siniestro from "../models/Siniestro.js";
import { deleteKey } from "../utils/redisUtils.js";

const REQUIRED_FIELDS = [
  "id_siniestro",
  "nro_poliza",
  "fecha",
  "tipo",
  "monto_estimado",
  "estado",
];

const VALID_TIPOS = ["Accidente", "Robo", "Danio", "Incendio"];
const VALID_ESTADOS = ["Abierto", "Cerrado", "En evaluacion"];

const CACHE_KEYS_TO_INVALIDATE = [
  "openAccidents:siniestros-abiertos:v1",
  "agentWithAccidents:agentes-con-siniestros:v1",
];

function normalizeClaimPayload(payload, { allowIdMutation = true } = {}) {
  const parsed = { ...payload };
  const errors = [];

  if (parsed.id_siniestro !== undefined) {
    const idValue = Number(parsed.id_siniestro);
    if (Number.isNaN(idValue)) {
      errors.push("El campo 'id_siniestro' debe ser numérico.");
    } else if (allowIdMutation) {
      parsed.id_siniestro = idValue;
    } else {
      delete parsed.id_siniestro;
    }
  }

  if (parsed.nro_poliza !== undefined) {
    parsed.nro_poliza = String(parsed.nro_poliza).trim();
    if (parsed.nro_poliza === "") {
      errors.push("El campo 'nro_poliza' no puede estar vacío.");
    }
  }

  if (parsed.fecha !== undefined) {
    parsed.fecha = String(parsed.fecha).trim();
    if (parsed.fecha === "") {
      errors.push("El campo 'fecha' no puede estar vacío.");
    } else {
      const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!fechaRegex.test(parsed.fecha)) {
        errors.push(
          "El campo 'fecha' debe tener el formato dd/mm/yyyy (ej: 20/3/2025)."
        );
      }
    }
  }

  if (parsed.tipo !== undefined) {
    parsed.tipo = String(parsed.tipo).trim();
    if (!VALID_TIPOS.includes(parsed.tipo)) {
      errors.push(
        `El campo 'tipo' debe ser uno de: ${VALID_TIPOS.join(", ")}.`
      );
    }
  }

  if (parsed.monto_estimado !== undefined) {
    const monto = Number(String(parsed.monto_estimado).replace(",", "."));
    if (Number.isNaN(monto)) {
      errors.push("El campo 'monto_estimado' debe ser numérico.");
    } else if (monto < 0) {
      errors.push("El campo 'monto_estimado' no puede ser negativo.");
    } else {
      parsed.monto_estimado = monto;
    }
  }

  if (parsed.descripcion !== undefined) {
    parsed.descripcion = String(parsed.descripcion).trim();
  }

  if (parsed.estado !== undefined) {
    parsed.estado = String(parsed.estado).trim();
    if (!VALID_ESTADOS.includes(parsed.estado)) {
      errors.push(
        `El campo 'estado' debe ser uno de: ${VALID_ESTADOS.join(", ")}.`
      );
    }
  }

  return { parsed, errors };
}

async function invalidateClaimCaches() {
  await Promise.all(CACHE_KEYS_TO_INVALIDATE.map((key) => deleteKey(key)));
}

// GET /siniestros -> listado completo de siniestros
export async function listClaims(req, res) {
  try {
    const claims = await Siniestro.find({});
    res.json(claims);
  } catch (error) {
    console.error("Error al listar siniestros:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener la lista de siniestros.",
    });
  }
}

// GET /siniestros/:id -> retorna un siniestro por su id
export async function getClaim(req, res) {
  const { id } = req.params;
  const claimId = Number(id);

  if (Number.isNaN(claimId)) {
    return res.status(400).json({
      mensaje: "El id del siniestro debe ser numérico.",
    });
  }

  try {
    const claim = await Siniestro.findOne({ id_siniestro: claimId });

    if (!claim) {
      return res.status(404).json({ mensaje: "Siniestro no encontrado." });
    }

    res.json(claim);
  } catch (error) {
    console.error("Error al obtener siniestro:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener los datos del siniestro.",
    });
  }
}

// POST /siniestros -> alta de un nuevo siniestro
export async function createClaim(req, res) {
  const { parsed: payload, errors } = normalizeClaimPayload(req.body, {
    allowIdMutation: true,
  });

  if (errors.length > 0) {
    return res.status(400).json({ mensaje: errors.join(" ") });
  }

  for (const field of REQUIRED_FIELDS) {
    if (payload[field] === undefined || payload[field] === null) {
      return res.status(400).json({
        mensaje: `El campo '${field}' es obligatorio.`,
      });
    }
  }

  try {
    const existingClaim = await Siniestro.findOne({
      $or: [{ id_siniestro: payload.id_siniestro }],
    });

    if (existingClaim) {
      return res.status(409).json({
        mensaje: "Ya existe un siniestro con ese id_siniestro.",
      });
    }

    const newClaim = await Siniestro.create(payload);
    await invalidateClaimCaches();
    res.status(201).json(newClaim);
  } catch (error) {
    console.error("Error al crear siniestro:", error);
    res.status(500).json({ mensaje: "No fue posible crear el siniestro." });
  }
}
