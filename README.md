## Ejecución

#### API Express

```
npm install
npm start // inicia contenedores también

para especificar directorio de datasets:
npm start path/to/datasets
```

#### Solo Docker-compose

```
docker-compose up -d // iniciar contenedores
docker-compose down
```

#### Dependencias:

- docker compose

## Endpoints principales

- Consultas (queries 1-12):
  - `GET /queries/query1`
  - ...
  - `GET /queries/query12`
- ABM de clientes (query 13):
  - `GET /clientes`
  - `GET /clientes/:id`
  - `POST /clientes`
  - `PUT /clientes/:id`
  - `DELETE /clientes/:id`

## Ejemplos de uso (curl)

### Consultas (queries 1-12)

- **Clientes activos con pólizas vigentes**
  ```
  curl http://localhost:3000/queries/query1
  ```
- **Siniestros abiertos con datos del cliente**
  ```
  curl http://localhost:3000/queries/query2
  ```
- **Vehículos asegurados y su cliente**
  ```
  curl http://localhost:3000/queries/query3
  ```
- **Clientes sin pólizas activas**
  ```
  curl http://localhost:3000/queries/query4
  ```
- **Top 10 clientes por cobertura**
  ```
  curl http://localhost:3000/queries/query7
  ```

### ABM de clientes (query 13)

- **Listar todos**
  ```
  curl http://localhost:3000/clientes
  ```
- **Obtener por id**
  ```
  curl http://localhost:3000/clientes/4
  ```
- **Crear cliente**
  ```
  curl -X POST http://localhost:3000/clientes \
    -H "Content-Type: application/json" \
    -d '{
      "id_cliente": 206,
      "nombre": "Luciana",
      "apellido": "Quinteros",
      "dni": 45123456,
      "email": "luciana.quinteros@mail.com",
      "telefono": "1144556677",
      "direccion": "Av. Rivadavia 456",
      "ciudad": "Buenos Aires",
      "provincia": "Buenos Aires",
      "activo": true,
      "polizas": [
        {
          "nro_poliza": "POL2201",
          "tipo": "Vida",
          "fecha_inicio": "01/03/2025",
          "fecha_fin": "01/03/2026",
          "prima_mensual": 18000,
          "cobertura_total": 1200000,
          "id_agente": 101,
          "estado": "Activa"
        }
      ]
    }'
  ```
- **Actualizar cliente**
  ```
  curl -X PUT http://localhost:3000/clientes/206 \
    -H "Content-Type: application/json" \
    -d '{ "telefono": "1199887766", "activo": false }'
  ```
- **Eliminar cliente**
  ```
  curl -X DELETE http://localhost:3000/clientes/206
  ```
