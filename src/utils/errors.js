export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export class HttpError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleError(
  error,
  res,
  defaultMessage = "Error interno del servidor."
) {
  console.error("Error:", error);

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ mensaje: error.message });
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      mensaje: `Ya existe un registro con ese ${field || "valor"}.`,
    });
  }

  // Unknown errors
  return res
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json({ mensaje: defaultMessage });
}
