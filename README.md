# Trabajo Práctico Obligatorio: Sistema de Gestión de Aseguradoras

## 72.41 - Bases de Datos II - Segundo Cuatrimestre 2025



### Integrantes 

--------------------------------
## Ejecución

Para ejecutar la aplicación, se deben correr los siguientes comandos: 
```bash
npm install 
npm start [PATH_TO_CSVS_FOLDER]
```
Para que el sistema funciones correctamente debe estar corriendo el *daemon* de Docker y contar con docker-compose. 


## Ejemplos de uso (curl)

### Consultas 

#### Queries 1-12

- **Clientes activos con pólizas vigentes**
  ```
  curl http://localhost:3000/clientes/activos
  ```
- **Siniestros abiertos con datos del cliente**
  ```
  curl http://localhost:3000/siniestros/open
  ```
- **Vehículos asegurados y su cliente**
  ```
  curl http://localhost:3000/vehiculos/asegurados
  ```
- **Clientes sin pólizas activas**
  ```
  curl http://localhost:3000/clientes/sin-poliza-activa
  ```
- **Agentes activos con cantidad de pólizas asignadas**
  ```
  curl http://localhost:3000/agentes/activos
  ```
- **Pólizas vencidas con el nombre del cliente**
  ```
  curl http://localhost:3000/polizas/vencidas
  ```
- **Top 10 clientes por cobertura**
  ```
  curl http://localhost:3000/clientes/top-por-cobertura
  ```
- **Siniestros tipo “Accidente” del último año**
  ```
  curl http://localhost:3000/siniestros/accidente-ultimo-anio
  ```
- **Vista de pólizas activas ordenadas por fecha de inicio**
  ```
  curl http://localhost:3000/polizas/ordenadas-por-fecha-inicio
  ```
- **Pólizas suspendidas con estado del cliente**
  ```
  curl http://localhost:3000/polizas/suspendidas
  ```
- **Clientes con más de un vehículo asegurado**
  ```
  curl http://localhost:3000/clientes/con-vehiculos-asegurados
  ```
- **Agentes y cantidad de siniestros asociados**
  ```
  curl http://localhost:3000/agentes/con-siniestros
  ```            

#### Query 13

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

#### Siniestros

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

#### Pólizas

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
