import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
	name: { type: String, required: true },
	age: { type: Number, required: true },
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
