import mongoose from "mongoose";
import Cliente from "../models/Cliente.js";
import Agente from "../models/Agente.js";
import { deleteKey } from "../utils/redisUtils.js";
import { HttpError, handleError, HTTP_STATUS } from "../utils/errors.js";

const REQUIRED_FIELDS = [
  "nro_poliza",
  "tipo",
  "fecha_inicio",
  "fecha_fin",
  "prima_mensual",
  "cobertura_total",
  "id_agente",
  "estado",
];

const VALID_TIPOS = ["Auto", "Vida", "Hogar", "Salud"];
const VALID_ESTADOS = ["Activa", "Vencida", "Suspendida"];

const CACHE_KEYS_TO_INVALIDATE = [
  "activeClientsWithPolicy:clientes-activos-polizas:v1",
  "insuredVehicles:vehiculos-asegurados:v1",
  "clientWithouthActivePolicy:clientes-sin-polizas-activas:v1",
  "topClientsByCover:top10-clientes:all-polizas:v3",
  "suspendedPolicies:polizas-suspendidas:v1",
  "clientsWithInsuredVehicles:clientes-con-multiples-vehiculos:v1",
  "agentWithAccidents:agentes-con-siniestros:v1",
  "policiesSortedByStartDate:polizas-activas:v1",
  "expiredPolicies:polizas-vencidas:v1",
  "activeAgents:agentes-activos-total-polizas:v1",
];

function normalizePolicyPayload(payload) {
  const parsed = { ...payload };
  const errors = [];

  if (parsed.nro_poliza !== undefined) {
    parsed.nro_poliza = String(parsed.nro_poliza).trim();
    if (parsed.nro_poliza === "") {
      errors.push("El campo 'nro_poliza' no puede estar vacío.");
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

  if (parsed.fecha_inicio !== undefined) {
    parsed.fecha_inicio = String(parsed.fecha_inicio).trim();
    if (parsed.fecha_inicio === "") {
      errors.push("El campo 'fecha_inicio' no puede estar vacío.");
    } else {
      const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!fechaRegex.test(parsed.fecha_inicio)) {
        errors.push(
          "El campo 'fecha_inicio' debe tener el formato dd/mm/yyyy (ej: 15/1/2025)."
        );
      }
    }
  }

  if (parsed.fecha_fin !== undefined) {
    parsed.fecha_fin = String(parsed.fecha_fin).trim();
    if (parsed.fecha_fin === "") {
      errors.push("El campo 'fecha_fin' no puede estar vacío.");
    } else {
      const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!fechaRegex.test(parsed.fecha_fin)) {
        errors.push(
          "El campo 'fecha_fin' debe tener el formato dd/mm/yyyy (ej: 15/1/2026)."
        );
      }
    }
  }

  if (parsed.prima_mensual !== undefined) {
    const prima = Number(String(parsed.prima_mensual).replace(",", "."));
    if (Number.isNaN(prima)) {
      errors.push("El campo 'prima_mensual' debe ser numérico.");
    } else if (prima < 0) {
      errors.push("El campo 'prima_mensual' no puede ser negativo.");
    } else {
      parsed.prima_mensual = prima;
    }
  }

  if (parsed.cobertura_total !== undefined) {
    const cobertura = Number(String(parsed.cobertura_total).replace(",", "."));
    if (Number.isNaN(cobertura)) {
      errors.push("El campo 'cobertura_total' debe ser numérico.");
    } else if (cobertura < 0) {
      errors.push("El campo 'cobertura_total' no puede ser negativo.");
    } else {
      parsed.cobertura_total = cobertura;
    }
  }

  if (parsed.id_agente !== undefined) {
    const idAgente = Number(parsed.id_agente);
    if (Number.isNaN(idAgente)) {
      errors.push("El campo 'id_agente' debe ser numérico.");
    } else {
      parsed.id_agente = idAgente;
    }
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

async function invalidatePolicyCaches() {
  await Promise.all(CACHE_KEYS_TO_INVALIDATE.map((key) => deleteKey(key)));
}

// GET /polizas -> complete list of policies
export async function listPolicy(req, res) {
  try {
    const clientes = await Cliente.find({}, "id_cliente polizas");
    const allPolizas = [];

    clientes.forEach((cliente) => {
      if (cliente.polizas && cliente.polizas.length > 0) {
        cliente.polizas.forEach((poliza) => {
          allPolizas.push({
            ...poliza.toObject(),
            id_cliente: cliente.id_cliente,
          });
        });
      }
    });

    res.json(allPolizas);
  } catch (error) {
    console.error("Error al listar pólizas:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      mensaje: "No fue posible obtener la lista de pólizas.",
    });
  }
}

// GET /polizas/:nro_poliza -> returns a policy by its id
export async function getPolicy(req, res) {
  const { id } = req.params;
  const nroPoliza = String(id).trim();

  if (nroPoliza === "") {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      mensaje: "El número de póliza no puede estar vacío.",
    });
  }

  try {
    const cliente = await Cliente.findOne({
      "polizas.nro_poliza": nroPoliza,
    });

    if (!cliente) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ mensaje: "Póliza no encontrada." });
    }

    const poliza = cliente.polizas.find((p) => p.nro_poliza === nroPoliza);

    if (!poliza) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ mensaje: "Póliza no encontrada." });
    }

    res.json({
      ...poliza.toObject(),
      id_cliente: cliente.id_cliente,
    });
  } catch (error) {
    console.error("Error al obtener póliza:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      mensaje: "No fue posible obtener los datos de la póliza.",
    });
  }
}

// POST /polizas -> issue a new policy
export async function createPolicy(req, res) {
  const { parsed: payload, errors } = normalizePolicyPayload(req.body);

  if (errors.length > 0) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ mensaje: errors.join(" ") });
  }

  for (const field of REQUIRED_FIELDS) {
    if (payload[field] === undefined || payload[field] === null) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        mensaje: `El campo '${field}' es obligatorio.`,
      });
    }
  }

  const idCliente = Number(req.body.id_cliente);
  if (Number.isNaN(idCliente)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      mensaje: "El campo 'id_cliente' es obligatorio y debe ser numérico.",
    });
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // 1. Verify client exists
      const cliente = await Cliente.findOne({ id_cliente: idCliente }).session(
        session
      );

      if (!cliente) {
        throw new HttpError("Cliente no encontrado.", HTTP_STATUS.NOT_FOUND);
      }

      // 2. Verify agent exists and is active
      const agente = await Agente.findOne({
        id_agente: payload.id_agente,
      }).session(session);

      if (!agente) {
        throw new HttpError("Agente no encontrado.", HTTP_STATUS.NOT_FOUND);
      }

      if (!agente.activo) {
        throw new HttpError(
          "El agente no está activo.",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // 3. Verify policy doesn't exist
      const existingPoliza = await Cliente.findOne({
        "polizas.nro_poliza": payload.nro_poliza,
      }).session(session);

      if (existingPoliza) {
        throw new HttpError(
          "Ya existe una póliza con ese número.",
          HTTP_STATUS.CONFLICT
        );
      }

      // 4. Create policy
      const nuevaPoliza = {
        ...payload,
        id_cliente: idCliente,
      };

      const updatedCliente = await Cliente.findOneAndUpdate(
        { id_cliente: idCliente },
        { $push: { polizas: nuevaPoliza } },
        { new: true, session }
      );

      const polizaCreada = updatedCliente.polizas.find(
        (p) => p.nro_poliza === payload.nro_poliza
      );

      return {
        ...polizaCreada.toObject(),
        id_cliente: idCliente,
      };
    });

    // 5. Invalidate caches AFTER successful commit
    await invalidatePolicyCaches();

    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error) {
    handleError(error, res, "No fue posible crear la póliza.");
  } finally {
    session.endSession();
  }
}
