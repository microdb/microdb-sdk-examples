
# Example for Node JS apps
test

Use this application to quickly see how easy it is to connect an app to your custom database on https://www.microdb.co

### Total Time: 10 minutes

## Get Started

1. Create a database with some tables on microdb.co
2. Download this app to your machine
3. In the envVars.txt file, set MICRODB_APIKEY = your custom DB API key. On microdb.co, look on the Account page to generate the API key.  
4. Run 'npm install' to install dependencies.
5. Run 'node app.js' to start your app.
6. Point web browser to http://localhost:9002 to see your database tables.

## Code Generation


You can also autogenerate code by using the cli tool microdbc which is installed with this example app.

Let's gen some code for your database.

1. Run 'microdbc gen'
2. Look in the output code folder as named in the envVars.txt file variable 'OutputCodeFolder'. The default is OutputCodeFolder=microdb_output.
3. The result is helpful code snippets that you can use in your application.


