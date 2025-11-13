import mongoose from "mongoose";
import Cliente from "../models/Cliente.js";
import Vehiculo from "../models/Vehiculo.js";
import Siniestro from "../models/Siniestro.js";
import { deleteKey } from "../utils/redisUtils.js";
import { HttpError, handleError, HTTP_STATUS } from "../utils/errors.js";

const REQUIRED_FIELDS = [
  "id_cliente",
  "nombre",
  "apellido",
  "dni",
  "email",
  "telefono",
  "direccion",
  "ciudad",
  "provincia",
];

const CACHE_KEYS_TO_INVALIDATE = [
  "activeClientsWithPolicy:clientes-activos-polizas:v1",
  "insuredVehicles:vehiculos-asegurados:v1",
  "clientWithouthActivePolicy:clientes-sin-polizas-activas:v1",
  "topClientsByCover:top10-clientes:all-polizas:v3",
  "suspendedPolicies:polizas-suspendidas:v1",
  "clientsWithInsuredVehicles:clientes-con-multiples-vehiculos:v1",
  "agentWithAccidents:agentes-con-siniestros:v1",
];

function normalizeClientPayload(payload, { allowIdMutation = true } = {}) {
  const parsed = { ...payload };
  const errors = [];

  if (parsed.id_cliente !== undefined) {
    const idValue = Number(parsed.id_cliente);
    if (Number.isNaN(idValue)) {
      errors.push("El campo 'id_cliente' debe ser numérico.");
    } else if (allowIdMutation) {
      parsed.id_cliente = idValue;
    } else {
      delete parsed.id_cliente;
    }
  }

  if (parsed.dni !== undefined) {
    const dniValue = Number(parsed.dni);
    if (Number.isNaN(dniValue)) {
      errors.push("El campo 'dni' debe ser numérico.");
    } else {
      parsed.dni = dniValue;
    }
  }

  if (parsed.activo !== undefined) {
    parsed.activo =
      typeof parsed.activo === "boolean"
        ? parsed.activo
        : String(parsed.activo).toLowerCase() === "true";
  }

  if (Array.isArray(parsed.polizas)) {
    parsed.polizas = parsed.polizas.map((policy, index) => {
      const transformed = { ...policy };

      if (transformed.cobertura_total !== undefined) {
        const cobertura = Number(
          String(transformed.cobertura_total).replace(",", ".")
        );
        if (Number.isNaN(cobertura)) {
          errors.push(
            `La póliza ${index + 1} tiene 'cobertura_total' no numérica.`
          );
        } else {
          transformed.cobertura_total = cobertura;
        }
      }

      if (transformed.prima_mensual !== undefined) {
        const prima = Number(
          String(transformed.prima_mensual).replace(",", ".")
        );
        if (Number.isNaN(prima)) {
          errors.push(
            `La póliza ${index + 1} tiene 'prima_mensual' no numérica.`
          );
        } else {
          transformed.prima_mensual = prima;
        }
      }

      if (transformed.id_agente !== undefined) {
        const idAgente = Number(transformed.id_agente);
        if (Number.isNaN(idAgente)) {
          errors.push(`La póliza ${index + 1} tiene 'id_agente' no numérico.`);
        } else {
          transformed.id_agente = idAgente;
        }
      }

      return transformed;
    });
  }

  return { parsed, errors };
}

async function invalidateClientCaches() {
  await Promise.all(CACHE_KEYS_TO_INVALIDATE.map((key) => deleteKey(key)));
}

// GET /clientes -> listado completo de clientes
export async function listClients(req, res) {
  try {
    const clients = await Cliente.find({});
    res.json(clients);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      mensaje: "No fue posible obtener la lista de clientes.",
    });
  }
}

// GET /clientes/:id -> retorna un cliente por su id
export async function getClient(req, res) {
  const { id } = req.params;
  const clientId = Number(id);

  if (Number.isNaN(clientId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      mensaje: "El id del cliente debe ser numérico.",
    });
  }

  try {
    const client = await Cliente.findOne({ id_cliente: clientId });

    if (!client) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ mensaje: "Cliente no encontrado." });
    }

    res.json(client);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      mensaje: "No fue posible obtener los datos del cliente.",
    });
  }
}

// POST /clientes -> alta de un nuevo cliente
export async function createClient(req, res) {
  const { parsed: payload, errors } = normalizeClientPayload(req.body, {
    allowIdMutation: true,
  });

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

  try {
    const existingClient = await Cliente.findOne({
      $or: [{ id_cliente: payload.id_cliente }, { dni: payload.dni }],
    });

    if (existingClient) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        mensaje: "Ya existe un cliente con ese id_cliente o DNI.",
      });
    }

    const newClient = await Cliente.create(payload);
    await invalidateClientCaches();
    res.status(HTTP_STATUS.CREATED).json(newClient);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ mensaje: "No fue posible crear el cliente." });
  }
}

// PUT /clientes/:id -> actualización de un cliente existente
export async function updateClient(req, res) {
  const { id } = req.params;
  const clientId = Number(id);

  if (Number.isNaN(clientId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      mensaje: "El id del cliente debe ser numérico.",
    });
  }

  const { parsed: payload, errors } = normalizeClientPayload(req.body, {
    allowIdMutation: false,
  });

  if (errors.length > 0) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ mensaje: errors.join(" ") });
  }

  try {
    const updatedClient = await Cliente.findOneAndUpdate(
      { id_cliente: clientId },
      { $set: payload },
      { new: true }
    );

    if (!updatedClient) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ mensaje: "Cliente no encontrado." });
    }

    await invalidateClientCaches();
    res.json(updatedClient);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ mensaje: "No fue posible actualizar el cliente." });
  }
}

// DELETE /clientes/:id -> elimina un cliente
export async function deleteClient(req, res) {
  const { id } = req.params;
  const clientId = Number(id);

  if (Number.isNaN(clientId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      mensaje: "El id del cliente debe ser numérico.",
    });
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const client = await Cliente.findOne({ id_cliente: clientId }).session(
        session
      );

      if (!client) {
        throw new HttpError("Cliente no encontrado.", HTTP_STATUS.NOT_FOUND);
      }

      const numerosPoliza = client.polizas
        ? client.polizas.map((poliza) => poliza.nro_poliza)
        : [];

      await Vehiculo.deleteMany({ id_cliente: clientId }, { session });

      if (numerosPoliza.length > 0) {
        await Siniestro.deleteMany(
          { nro_poliza: { $in: numerosPoliza } },
          { session }
        );
      }

      await Cliente.findOneAndDelete({ id_cliente: clientId }, { session });

      return client;
    });

    await invalidateClientCaches();

    res.json({
      mensaje:
        "Cliente eliminado correctamente con sus pólizas, vehículos y siniestros.",
    });
  } catch (error) {
    handleError(error, res, "No fue posible eliminar el cliente.");
  } finally {
    session.endSession();
  }
}
