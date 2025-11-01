const express = require('express');
const router = express.Router();
const db = require('./database'); // Import DynamoDB DocumentClient
const { v4: uuidv4 } = require('uuid'); // Unique ID generator

// DynamoDB table name
const tableName = process.env.DB_NAME || 'Contacts';

/**
 * Route: POST /add
 * Description: Add a new contact (with username, phone, email, age)
 */
router.post('/add', async (req, res) => {
    const { username, phone, email, age } = req.body;

    // Validate input
    if (!username || !phone || !email || !age) {
        return res.status(400).send('All fields are required.');
    }

    const id = uuidv4(); // Generate a unique ID

    const params = {
        TableName: tableName,
        Item: {
            id,
            username,
            phone,
            email,
            age: Number(age),
        },
    };

    try {
        await db.put(params).promise();
        console.log(`✅ Contact "${username}" added successfully.`);
        res.redirect('/');
    } catch (err) {
        console.error('❌ Error inserting data:', err.message);
        res.status(500).send('Database error');
    }
});

/**
 * Route: GET /contacts
 * Description: Retrieve all contacts
 */
router.get('/contacts', async (req, res) => {
    const params = { TableName: tableName };

    try {
        const data = await db.scan(params).promise();
        res.json(data.Items || []);
    } catch (err) {
        console.error('❌ Error fetching data:', err.message);
        res.status(500).send('Database error');
    }
});

/**
 * Route: DELETE /delete/:id
 * Description: Delete a contact by ID
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    const params = {
        TableName: tableName,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)', // Ensure item exists
    };

    try {
        await db.delete(params).promise();
        console.log(`🗑️ Contact with ID "${id}" deleted successfully.`);
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ConditionalCheckFailedException') {
            res.status(404).send('Item not found');
        } else {
            console.error('❌ Error deleting data:', err.message);
            res.status(500).send('Database error');
        }
    }
});

module.exports = router;
