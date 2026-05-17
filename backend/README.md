# School Management System - Task 1

## Task

Set up the MongoDB Atlas database connection using the Singleton design pattern in Python.

In this task, the project only creates one shared database connection object. Later modules such as `Teacher`, `Student`, and `Staff` can reuse this same database instance instead of creating separate connections.

## Project Files

- `database.py` - contains the `DatabaseConnection` Singleton class.
- `main.py` - checks that the Singleton works and tests the MongoDB Atlas connection.
- `.env.example` - shows the required environment variables.
- `requirements.txt` - Python packages needed for this task.

## Singleton Pattern Used

The `DatabaseConnection` class follows a thread-safe Singleton pattern:

- `__new__()` controls object creation.
- `_instance` stores the single object.
- `_lock` prevents multiple objects from being created at the same time.
- `MongoClient` is created only once.

So, even if this code is called many times:

```python
db1 = DatabaseConnection()
db2 = DatabaseConnection()
```

both `db1` and `db2` will point to the same object.

## MongoDB Atlas Setup Steps

1. Open MongoDB Atlas and go to your project.
2. Open your cluster, for example `Cluster0`.
3. Click **Connect**.
4. Choose **Drivers**.
5. Select **Python** as the driver.
6. Copy the connection string. It will look similar to this:

```text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

7. Replace `<username>` and `<password>` with your Atlas database user credentials.
8. In Atlas, go to **Network Access** and allow your current IP address.
9. Make sure your database user has permission to read and write data.

## Local Setup Steps

1. Go to the project folder:

```powershell
cd Project
```

2. Create a virtual environment:

```powershell
python -m venv .venv
```

3. Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

4. Install dependencies:

```powershell
pip install -r requirements.txt
```

5. Create a `.env` file by copying `.env.example`.

```powershell
Copy-Item .env.example .env
```

6. Open `.env` and paste your real MongoDB Atlas URI:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=school_management
```

7. Run the project:

```powershell
python main.py
```

## Expected Output

If the Singleton pattern and database connection both work, you should see output similar to:

```text
First object id : 123456789
Second object id: 123456789
Same instance   : True
Connected to MongoDB Atlas database: school_management
```

The object IDs should be the same, and `Same instance` should be `True`.

## Notes

- Do not upload your real `.env` file to GitHub because it contains your database password.
- Keep `.env.example` in the project so others know which environment variables are needed.
- This task only handles the database connection. Teacher, student, and staff features can be added in later tasks.
