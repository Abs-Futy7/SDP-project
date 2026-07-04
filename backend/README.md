# School Management System - Design Pattern Tasks

## Task 1: Singleton Pattern

Set up the MongoDB Atlas database connection using the Singleton design pattern in Python.

In this task, the project only creates one shared database connection object. Later modules such as `Teacher`, `Student`, and `Staff` can reuse this same database instance instead of creating separate connections.

## Project Files

- `database.py` - contains the `DatabaseConnection` Singleton class.
- `user_factory.py` - contains the Abstract Factory implementation for user registration.
- `notice_observer.py` - contains the Observer implementation for classroom notices.
- `main.py` - checks that the Singleton works, tests the MongoDB Atlas connection, and demonstrates user registration and classroom notices.
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
Copy-Item backend\.env.example backend\.env
```

6. Open `.env` and paste your real MongoDB Atlas URI:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=school_management
SAVE_SAMPLE_USERS=false
```

7. Run the project from the project root:

```powershell
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

---

## Task 3: Observer Pattern For Classroom Notices

The backend now uses the **Observer Design Pattern** so that all enrolled students automatically receive notifications whenever a new notice is published on a classroom notice board.

The problem is that the notice board should not directly know how to notify each student. If the notice board manually called every student notification method, it would become tightly coupled with student notification logic. Observer solves this by letting students subscribe to the notice board.

## Observer Pattern Structure

```text
NoticeSubject
  |
  | implemented by
  v
ClassroomNoticeBoard
  |
  | notifies
  v
NoticeObserver
  |
  | implemented by
  v
EnrolledStudent
```

## Main Classes

### 1. Event Data: `Notice`

`Notice` stores the information about a published classroom notice:

- classroom id
- title
- message
- posted by
- creation time

This object is passed from the notice board to all observers.

### 2. Observer Interface: `NoticeObserver`

`NoticeObserver` defines one method:

```python
def update(notice: Notice) -> None
```

Any class that wants to receive classroom notice updates must implement this method.

### 3. Subject Interface: `NoticeSubject`

`NoticeSubject` defines the common observer operations:

```python
def attach(observer)
def detach(observer)
def notify(notice)
```

These methods allow observers to subscribe, unsubscribe, and receive updates.

### 4. Concrete Subject: `ClassroomNoticeBoard`

`ClassroomNoticeBoard` is the subject. It keeps a list of observers and notices.

When a new notice is published:

```python
notice_board.publish_notice(...)
```

the notice board:

1. creates a `Notice` object
2. stores the notice
3. calls `notify(notice)`
4. sends the notice to every enrolled student observer

### 5. Concrete Observer: `EnrolledStudent`

`EnrolledStudent` implements `NoticeObserver`.

When the notice board calls:

```python
student.update(notice)
```

the student stores the notice in its notification list.

### 6. Enrollment Helper: `ClassroomEnrollmentService`

`ClassroomEnrollmentService` manages classroom notice boards and student enrollment.

Example:

```python
enrollment_service.enroll_student("CSE-3204", student)
```

Internally, this attaches the student observer to the correct classroom notice board.

## How The Notice Flow Works

Example flow:

```text
Teacher publishes notice
  |
  v
ClassroomNoticeBoard.publish_notice()
  |
  v
ClassroomNoticeBoard.notify()
  |
  v
EnrolledStudent.update()
  |
  v
Student receives notification
```

The important point is that the notice board does not need to know the internal details of the student notification system. It only knows that observers support the `update()` method.

## Why This Follows Observer Pattern

The Observer Pattern has two main parts:

- **Subject:** the object being observed
- **Observer:** the objects waiting for updates

In this project:

| Observer Pattern Role | Project Class |
|---|---|
| Subject interface | `NoticeSubject` |
| Concrete subject | `ClassroomNoticeBoard` |
| Observer interface | `NoticeObserver` |
| Concrete observer | `EnrolledStudent` |
| Event/data object | `Notice` |

The notice board keeps a list of observers. When its state changes by publishing a new notice, it automatically notifies all observers.

## Why Did We Use Observer?

We used Observer because a classroom notice board has a one-to-many relationship with students.

One notice board can have many enrolled students:

```text
One classroom notice board -> many students
```

Whenever one notice is published, many students need to be updated immediately. Observer is designed exactly for this situation.

This improves:

- **loose coupling:** the notice board depends on the observer interface, not concrete student classes
- **automatic notification:** students are updated as soon as a notice is published
- **maintainability:** notification logic stays outside the notice publishing workflow
- **extensibility:** new observers can be added later, such as email notification, SMS notification, or parent notification

## What Happens Without Observer?

Without Observer, the notice board might need code like this:

```python
def publish_notice(title, message):
    notice = Notice(...)
    for student in students:
        student.send_notification(notice)
```

This creates several problems:

- The notice board directly depends on student notification logic.
- If notification changes, the notice board code must change.
- Adding email, SMS, mobile app, or parent notification requires modifying the notice board.
- The notice board becomes responsible for too many tasks.
- Testing becomes harder because notice creation and notification delivery are mixed together.

In simple words, without Observer the notice board becomes tightly coupled with every receiver.

## How Observer Keeps The Code Loosely Coupled

The notice board does not call a student-specific method like:

```python
student.send_class_notice(...)
```

Instead, it calls the observer abstraction:

```python
observer.update(notice)
```

Because of this, the notice board can notify any future observer as long as it implements `update()`. It does not matter whether the observer is a student, email service, mobile push service, or admin dashboard.

## Runtime Behavior

At runtime, notification is simple:

1. The notice board stores all subscribed observers in a list.
2. When a notice is published, it loops through the list.
3. It calls `update(notice)` for each observer.

If there are `n` enrolled students, notification takes `O(n)` time because every student must receive the notice once.

This is expected and necessary. If 40 students are enrolled, 40 notifications must be sent. The Observer pattern does not remove this work, but it organizes the work cleanly.

The memory cost is also small:

- the notice board stores a list of observers
- each student stores received notifications

## Is Observer Slower Than Direct Notification?

Observer adds a small method call through the observer interface, but the runtime cost is very low.

Direct notification:

```python
student.send_notification(notice)
```

Observer notification:

```python
observer.update(notice)
```

Both still need to notify every student. The main benefit of Observer is not speed; the main benefit is low coupling and easier extension.

## How Can We Add Another Notification Type?

Suppose we want to add email notification later.

We can create another observer:

```python
class EmailNoticeNotifier(NoticeObserver):
    def update(self, notice):
        send_email(notice)
```

Then attach it to the notice board:

```python
notice_board.attach(email_notifier)
```

The `ClassroomNoticeBoard` class does not need to change.

## Observer Viva Notes

### How does this task work?

Students are attached to the classroom notice board as observers. When a teacher publishes a notice, the notice board creates a `Notice` object and calls `notify()`. The `notify()` method loops over all attached observers and calls their `update()` method. Each enrolled student receives and stores the notification automatically.

### Why Observer instead of direct notification?

Observer is used because the notice board should not be tightly connected to every student or every notification system. The notice board only publishes notices. Observers decide how to react. This separates notice publishing from notification receiving.

### What is the subject?

The subject is `ClassroomNoticeBoard`. It is observed by students and notifies them when a new notice is published.

### What are the observers?

The observers are objects that implement `NoticeObserver`. In this implementation, `EnrolledStudent` is the concrete observer.

### What are `attach`, `detach`, and `notify`?

- `attach()` subscribes a student to the notice board.
- `detach()` removes a student from the notice board.
- `notify()` sends the new notice to all subscribed students.

### What happens if a student leaves a class?

The system calls:

```python
notice_board.detach(student)
```

After that, the student will no longer receive notices from that classroom notice board.

### Runtime complexity

If there are `n` enrolled students, publishing one notice takes `O(n)` time because every subscribed student must be notified once.

### Short viva answer

This project uses Observer because one classroom notice board has many enrolled students. The notice board is the subject, and students are observers. Students subscribe using `attach()`. When a new notice is published, the notice board calls `notify()`, and each student receives the notice through `update()`. Without Observer, the notice board would directly notify each student and become tightly coupled with notification logic. Runtime is `O(n)` for `n` students, which is expected because every enrolled student must receive the notice.
