const AWS = require('aws-sdk');

// ✅ Configure AWS credentials
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    AWS.config.update({
        region: process.env.AWS_REGION || 'your_region',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
} else {
    AWS.config.update({
        region: process.env.AWS_REGION || 'your_region',
    });
}

// ✅ Initialize DynamoDB clients
const dynamoDb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();

// ✅ Table name
const tableName = process.env.DB_NAME || 'Contacts';

async function setupDatabase() {
    try {
        const createTableParams = {
            TableName: tableName,
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }], // UUID = String
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        };

        const tables = await dynamoDb.listTables().promise();

        if (!tables.TableNames.includes(tableName)) {
            await dynamoDb.createTable(createTableParams).promise();
            console.log(`✅ Table "${tableName}" created successfully.`);
        } else {
            console.log(`ℹ️ Table "${tableName}" already exists.`);
        }
    } catch (err) {
        console.error('❌ Error during database setup:', err.message);
    }
}

// ✅ Helper: Add a new contact
async function addContact(id, username, phone, email, age) {
    try {
        const params = {
            TableName: tableName,
            Item: { id, username, phone, email, age: Number(age) },
        };

        await documentClient.put(params).promise();
        console.log(`✅ Contact "${username}" added successfully.`);
    } catch (err) {
        console.error('❌ Error adding contact:', err.message);
    }
}

// Initialize the table
setupDatabase();

module.exports = documentClient;
