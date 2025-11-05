// we can use the models to simplify collection creation and then call abm on models more easily !
// https://mongoosejs.com/docs/models.html

import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
});

const Cliente = mongoose.model('Cliente', clienteSchema);

export default Cliente;