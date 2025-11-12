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

- Clientes (query 13):

  - `GET /clientes`
  - `GET /clientes/:id`
  - `POST /clientes`
  - `PUT /clientes/:id`
  - `DELETE /clientes/:id`

- Siniestros (query 14):

  - `GET /siniestros`
  - `GET /siniestros/:id`
  - `POST /siniestros`

- Pólizas (query 15):

  - `GET /polizas`
  - `GET /polizas/:nro_poliza`
  - `POST /polizas`

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

### Clientes (query 13)

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

### Siniestros

- **Listar todos**
  ```
  curl http://localhost:3000/siniestros
  ```
- **Obtener por id**
  ```
  curl http://localhost:3000/siniestros/9001
  ```
- **Crear siniestro**
  ```
  curl -X POST http://localhost:3000/siniestros \
    -H "Content-Type: application/json" \
    -d '{
      "id_siniestro": 10001,
      "nro_poliza": "POL1001",
      "fecha": "15/12/2024",
      "tipo": "Accidente",
      "monto_estimado": 250000,
      "descripcion": "Colisión trasera en semáforo",
      "estado": "Abierto"
    }'
  ```

### Pólizas

- **Listar todas**
  ```
  curl http://localhost:3000/polizas
  ```
- **Obtener por número de póliza**
  ```
  curl http://localhost:3000/polizas/POL1001
  ```
- **Emitir nueva póliza**
  ```
  curl -X POST http://localhost:3000/polizas \
    -H "Content-Type: application/json" \
    -d '{
      "id_cliente": 1,
      "nro_poliza": "POL2001",
      "tipo": "Auto",
      "fecha_inicio": "1/1/2025",
      "fecha_fin": "1/1/2026",
      "prima_mensual": 30000,
      "cobertura_total": 3000000,
      "id_agente": 101,
      "estado": "Activa"
    }'
  ```
