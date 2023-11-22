# Setting Up DynamoDB:

1. Open a terminal and navigate to the directory containing DynamoDB.

2. Start DynamoDB using the following command. The default port is 8000.

```bash
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

# Setting Up Django and GraphQL App:

3. Open another terminal and navigate to the root folder where `manage.py` exists.

4. Create a new virtual environment.

```bash
python3.9 -m venv venv
```

5. Activate the virtual environment.

```bash
source venv/bin/activate
```

6. Install the required packages from the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

7. Setting up credentials

rename example_env file to .env and update credentials there  

# Starting the Django Server:

8. Start the server using a custom command. By default, it will open the app on port 8080.

```bash
python manage.py start
```

or manually start the server on a port other than 8000.

```bash
python manage.py runserver 8080
```

# Accessing GraphQL App:

9. Access the GraphQL app at [http://localhost:8080/graphql/](http://localhost:8080/graphql/).
