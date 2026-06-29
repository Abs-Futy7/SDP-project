# School Management System - Design Pattern Tasks

## Task 1: Singleton Pattern

Set up the MongoDB Atlas database connection using the Singleton design pattern in Python.

In this task, the project only creates one shared database connection object. Later modules such as `Teacher`, `Student`, and `Staff` can reuse this same database instance instead of creating separate connections.

## Project Files

- `database.py` - contains the `DatabaseConnection` Singleton class.
- `user_factory.py` - contains the Abstract Factory implementation for user registration.
- `main.py` - checks that the Singleton works, tests the MongoDB Atlas connection, and demonstrates user registration.
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
SAVE_SAMPLE_USERS=false
```

7. Run the project from the project root:

```powershell
cd ..
python -m backend.main
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
- Run the app from the project root so Python can import the `backend` package:

```powershell
cd Project
python -m backend.main
```

---

## Task 2: Abstract Factory Pattern For User Registration

The backend also integrates the **Abstract Factory Design Pattern** for registering different types of users in the school management system.

The supported user types are:

- `student`
- `teacher`
- `staff`

Each user type has different required fields, profile data, dashboard route, and MongoDB collection. The registration service does not directly create `StudentUser`, `TeacherUser`, or `StaffUser`. Instead, it asks the correct abstract factory to create a family of related registration objects.

## Abstract Factory Structure

```text
UserRegistrationFactory
  |
  | implemented by
  v
StudentRegistrationFactory
TeacherRegistrationFactory
StaffRegistrationFactory

Each concrete factory creates:
  - one RegisteredUser product
  - one RegistrationPolicy product
```

## Main Classes

### 1. Abstract Product: `RegisteredUser`

`RegisteredUser` is the base class for all registered users. Concrete user classes extend it:

- `StudentUser`
- `TeacherUser`
- `StaffUser`

Each user type provides its own dashboard route.

### 2. Abstract Product: `RegistrationPolicy`

`RegistrationPolicy` defines registration rules for each user type:

- required fields
- target MongoDB collection
- welcome message

Concrete policies are:

- `StudentRegistrationPolicy`
- `TeacherRegistrationPolicy`
- `StaffRegistrationPolicy`

### 3. Abstract Factory: `UserRegistrationFactory`

`UserRegistrationFactory` declares the factory methods:

```python
def create_user(...)
def create_policy(...)
```

The client code depends on this abstraction instead of concrete user classes.

### 4. Concrete Factories

The concrete factories create matching user and policy objects:

- `StudentRegistrationFactory` creates `StudentUser` and `StudentRegistrationPolicy`
- `TeacherRegistrationFactory` creates `TeacherUser` and `TeacherRegistrationPolicy`
- `StaffRegistrationFactory` creates `StaffUser` and `StaffRegistrationPolicy`

This is why the pattern is Abstract Factory rather than only Factory Method: each factory creates a related family of objects.

### 5. Factory Provider

`UserFactoryProvider` works as a registry:

```python
factory = UserFactoryProvider.get_factory("student")
```

It returns the correct factory without exposing concrete creation logic to the registration service.

### 6. Client: `UserRegistrationService`

`UserRegistrationService` is the client of the Abstract Factory. It follows this workflow:

1. Receive the user type and registration data.
2. Ask `UserFactoryProvider` for the correct factory.
3. Create the matching registration policy.
4. Validate the required fields.
5. Hash the password.
6. Create the matching user object.
7. Optionally save the user document to MongoDB.

By default, the demo prints the registration result without inserting sample users. To intentionally save the sample users to MongoDB, add this to `.env`:

```env
SAVE_SAMPLE_USERS=true
```

## Why This Follows Abstract Factory

The client code does not do this:

```python
user = StudentUser(...)
policy = StudentRegistrationPolicy()
```

Instead, it works through the factory abstraction:

```python
factory = UserFactoryProvider.get_factory(user_type)
policy = factory.create_policy()
user = factory.create_user(data, password_hash, created_at)
```

This keeps user creation separate from the registration workflow. If a new user type such as `guardian` is added later, the system can add `GuardianUser`, `GuardianRegistrationPolicy`, and `GuardianRegistrationFactory` without rewriting the registration service.

## Viva Notes

### How does the registration system work?

The registration system receives two things:

- the user type, such as `student`, `teacher`, or `staff`
- the registration data, such as name, email, password, and role-specific fields

Then `UserRegistrationService.register()` performs the common registration workflow:

1. It asks `UserFactoryProvider` for the correct factory.
2. The provider returns a concrete factory such as `StudentRegistrationFactory`.
3. The factory creates the matching `RegistrationPolicy`.
4. The policy validates required fields.
5. The service hashes the password.
6. The factory creates the matching user object.
7. The service returns a `RegistrationResult`.
8. If `SAVE_SAMPLE_USERS=true`, the user document is inserted into the correct MongoDB collection.

Example flow for a student:

```text
register("student", data)
  |
  v
UserFactoryProvider.get_factory("student")
  |
  v
StudentRegistrationFactory
  |
  | creates
  v
StudentRegistrationPolicy + StudentUser
```

So the service controls the workflow, but the factory controls which related objects are created.

### Why did we use Abstract Factory?

We used Abstract Factory because different user types need a family of related objects.

For example, a student registration needs:

- `StudentUser`
- `StudentRegistrationPolicy`
- `students` MongoDB collection
- `/student/dashboard` route

A teacher registration needs:

- `TeacherUser`
- `TeacherRegistrationPolicy`
- `teachers` MongoDB collection
- `/teacher/dashboard` route

These objects should match each other. A student should not accidentally use a teacher validation policy or be saved into the `teachers` collection. Abstract Factory keeps each family together.

In this project, each concrete factory creates one complete family:

```text
StudentRegistrationFactory -> StudentUser + StudentRegistrationPolicy
TeacherRegistrationFactory -> TeacherUser + TeacherRegistrationPolicy
StaffRegistrationFactory   -> StaffUser + StaffRegistrationPolicy
```

This improves:

- **loose coupling:** the service does not directly depend on concrete user classes
- **maintainability:** user-specific creation code stays in one place
- **scalability:** new user types can be added with less change to old code
- **consistency:** matching user and policy objects are created together

### Why not create users directly?

Without a factory, the registration service would need many `if/elif` blocks:

```python
if user_type == "student":
    policy = StudentRegistrationPolicy()
    policy.validate(data)
    user = StudentUser(...)
elif user_type == "teacher":
    policy = TeacherRegistrationPolicy()
    policy.validate(data)
    user = TeacherUser(...)
elif user_type == "staff":
    policy = StaffRegistrationPolicy()
    policy.validate(data)
    user = StaffUser(...)
```

This works for a small program, but it creates problems when the system grows.

### What problems happen without Factory?

Without the factory pattern:

- The service becomes large because all user creation logic is inside one method.
- Adding a new user type requires editing the main registration workflow.
- The code violates the Open/Closed Principle because old code must be modified for every new user type.
- Validation, collection selection, and object creation can become mixed together.
- Testing becomes harder because one method has too many branches.
- A developer may accidentally combine wrong objects, such as `StudentUser` with `TeacherRegistrationPolicy`.

In simple words, without factory the code becomes tightly coupled. The registration service would know too much about every user type.

### How does Factory improve runtime behavior?

The factory pattern is mainly a design improvement, not a speed optimization. Its runtime cost is very small.

At runtime, this project only does:

1. a dictionary lookup in `UserFactoryProvider._factories`
2. one method call to `create_policy()`
3. one method call to `create_user()`

This overhead is tiny compared with real backend work such as:

- password hashing
- network communication
- MongoDB insert operation
- API request processing

So the runtime effect is practically negligible. The main benefit is cleaner structure, safer extension, and easier maintenance.

### Is Factory slower than direct object creation?

Technically, factory adds one or two extra method calls. But this difference is not important in this backend.

Direct creation:

```python
user = StudentUser(...)
```

Factory creation:

```python
factory = UserFactoryProvider.get_factory("student")
user = factory.create_user(data, password_hash, created_at)
```

The factory version is slightly more indirect, but it gives better organization and flexibility. In a real application, database and network operations take much more time than factory method calls.

### Where is polymorphism used?

Polymorphism is used through the abstract base classes:

- `RegisteredUser`
- `RegistrationPolicy`
- `UserRegistrationFactory`

The service can call:

```python
policy.validate(data)
user = factory.create_user(data, password_hash, created_at)
```

without knowing whether the actual objects are student, teacher, or staff objects.

### How can we add a new user type?

Suppose we want to add `guardian`.

We would add:

1. `GuardianUser`
2. `GuardianRegistrationPolicy`
3. `GuardianRegistrationFactory`
4. one registry entry in `UserFactoryProvider._factories`

Example:

```python
_factories = {
    "student": StudentRegistrationFactory(),
    "teacher": TeacherRegistrationFactory(),
    "staff": StaffRegistrationFactory(),
    "guardian": GuardianRegistrationFactory(),
}
```

The `UserRegistrationService.register()` method would not need to change.

### Short viva answer

This project uses Abstract Factory because user registration has different related objects for each user type. A student, teacher, and staff member each need their own user model, validation policy, collection name, and dashboard route. The registration service only depends on the abstract factory, so it does not directly create concrete classes. Without the factory, the service would contain many conditional blocks and would become tightly coupled, harder to test, and harder to extend. Runtime overhead is very small because the factory only adds a dictionary lookup and method calls; database operations and password hashing are much more expensive.
