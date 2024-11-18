/* eslint-disable no-undef */
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Customer from './models/customer.js';
import promptSync from 'prompt-sync';
import express from 'express';

const prompt = promptSync();
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to MongoDB
const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('Connected to MongoDB');
	} catch (error) {
		console.error('MongoDB connection failed:', error.message);
	}
};

connect();

// index route
app.get('/', async (req, res) => {
	res.send('Welcome to index route!');
});

//========================>
// Route to render customers list in the browser
app.get('/customers', async (req, res) => {
	try {
		const allCustomers = await Customer.find(); // Retrieve all customers from the DB
		console.log('allCustomers:', allCustomers); // Log the customers for debugging
		res.render('customers/index', { customers: allCustomers }); // Render the EJS view with customer data
	} catch (error) {
		console.error('Error fetching customers:', error.message);
		res.status(500).send('An error occurred while fetching customers.');
	}
});

app.get('customers', async (req, res) => {
	const allCustomers = await Customer.find();
	console.log('allCustomers'); // log the customers!
	res.render('customers/index.ejs', { customers: allCustomers });
});

//=========================>

// Create a new customer - Form page (GET)
app.get('/customer/new', (req, res) => {
	res.send(
		'<form method="POST" action="/customers"><input name="name" placeholder="Name" /><input name="age" placeholder="Age" /><button type="submit">Create</button></form>'
	);
});

// Create a new customer (POST)
app.post('/customers', async (req, res) => {
	try {
		const { name, age } = req.body;

		// Debugging: Log the request body to ensure you're getting the data
		console.log('Received data:', req.body); // Log the body to see if it contains name and age

		// Validate input
		if (!name || !age) {
			return res.status(400).send('Name and age are required');
		}

		// Create new customer
		const newCustomer = await Customer.create({ name, age });
		console.log('New customer created:', newCustomer); // Log the new customer
		res.redirect('/customers'); // Redirect to the form page after creating a customer
	} catch (error) {
		console.error('Error creating customer:', error.message); // Detailed error log
		res.status(500).send('An error occurred while creating the customer');
	}
});

// Display menu for CLI
const displayMenu = () => {
	console.log(` Welcome to the CRM

    What would you like to do?

    1. Create a customer
    2. View all customers
    3. Update a customer
    4. Delete a customer
    5. Quit      
  `);
};

// User Input and Action Handling (main CLI loop)
const handleUserInput = async () => {
	let running = true;
	while (running) {
		displayMenu();
		const action = prompt('Choose an action(1-5): ');

		// Make sure the action is valid before calling the corresponding function
		switch (action) {
			case '1':
				await createCustomer();
				break;
			case '2':
				await viewAllCustomers();
				break;
			case '3':
				await updateCustomer();
				break;
			case '4':
				await deleteCustomer();
				break;
			case '5':
				running = false;
				console.log('Exiting...');
				break;
			default:
				console.log('Invalid option. Please choose a valid action (1-5).');
		}
	}
};

// Create a customer via CLI
const createCustomer = async () => {
	const name = prompt("Enter customer's name: ");
	const age = prompt("Enter customer's age: ");

	if (!name || !age) {
		console.log('Both name and age are required!');
		return;
	}

	try {
		// Log the values to check they are being passed correctly
		console.log(`Creating customer: Name = ${name}, Age = ${age}`);

		const newCustomer = await Customer.create({ name, age });
		console.log('Customer created:', newCustomer); // Log the created customer
	} catch (error) {
		console.error('Error creating customer:', error.message); // Log error details
	}
};

// View all customers via CLI
const viewAllCustomers = async () => {
	try {
		const customers = await Customer.find();
		console.log('All customers:');
		customers.forEach((customer, index) => {
			console.log(`${index + 1}. Name: ${customer.name}, Age: ${customer.age}`);
		});
	} catch (error) {
		console.error('Error retrieving customers:', error.message);
	}
};

// Update customer via CLI
const updateCustomer = async () => {
	const updateId = prompt('Enter the ID of the customer to update: ');
	const newName = prompt("Enter the new customer's name: ");
	const newAge = prompt("Enter the new customer's age: ");

	try {
		const updatedCustomer = await Customer.findByIdAndUpdate(
			updateId,
			{ name: newName, age: newAge },
			{ new: true }
		);
		if (updatedCustomer) {
			console.log('Customer updated: ', updatedCustomer);
		} else {
			console.log('Customer not found.');
		}
	} catch (error) {
		console.error('Error updating customer: ', error.message);
	}
};

// Delete customer via CLI
const deleteCustomer = async () => {
	const deleteId = prompt('Enter the ID of the customer to delete: ');

	try {
		const deletedCustomer = await Customer.findByIdAndDelete(deleteId);
		if (deletedCustomer) {
			console.log('Customer deleted: ', deletedCustomer);
		} else {
			console.log('Customer not found.');
		}
	} catch (error) {
		console.error('Error deleting customer: ', error.message);
	}
};

// Start Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

// Start the user input interface
handleUserInput();
