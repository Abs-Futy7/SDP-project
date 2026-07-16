# School Management System - Design Pattern Tasks

## Task 1: Singleton Pattern

Set up the MongoDB Atlas database connection using the Singleton design pattern in Python.

In this task, the project only creates one shared database connection object. Later modules such as `Teacher`, `Student`, and `Staff` can reuse this same database instance instead of creating separate connections.

## Project Files

- `database.py` - contains the `DatabaseConnection` Singleton class.
- `user_factory.py` - contains the Abstract Factory implementation for user registration.
- `notice_observer.py` - contains the Observer implementation for classroom notices.
- `grade_strategy.py` - contains the Strategy implementation for different grade calculation policies.
- `fee_strategy.py` - contains the Strategy implementation for different student fee policies.
- `api.py` - contains the FastAPI routes used by the frontend dashboard.
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

## Running Frontend With Backend API

The frontend now connects to a FastAPI backend API. Run these commands from the project on the E drive.

Install backend packages:

```powershell
cd E:\CSEDU\3-2\SDP-Lab\Project\backend
pip install -r requirements.txt
```

Start the backend API:

```powershell
cd E:\CSEDU\3-2\SDP-Lab\Project
python -m uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```powershell
cd E:\CSEDU\3-2\SDP-Lab\Project\frontend
npm run dev
```

The frontend uses this backend URL by default:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

The backend `.env` must allow the frontend origin:

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Useful API endpoints:

- `GET /api/health`
- `POST /api/login`
- `POST /api/register`
- `GET /api/classrooms`
- `POST /api/classrooms`
- `POST /api/classrooms/join`
- `GET /api/classrooms/CSE-3204/notice-board`
- `GET /api/classrooms/CSE-3204/students/S-2026-001/notice-board`
- `POST /api/classrooms/CSE-3204/notices`
- `POST /api/student-policy/calculate`

## Deploy On Vercel Free

Vercel now detects this repository as a **Services** project because it has both a Next.js frontend and a FastAPI backend. The root `vercel.json` defines both services:

- `frontend` service: Next.js app from `frontend`
- `backend` service: FastAPI app from `backend`

Requests under `/api/*` go to the backend. All other routes go to the frontend.

### 1. Push The Project To GitHub

Make sure the project is pushed to GitHub first. Do not commit `backend/.env`.

### 2. Create The Vercel Project

In Vercel:

1. Click **Add New Project**.
2. Import the GitHub repository.
3. Keep **Root Directory** as:

```text
./
```

4. Keep **Application Preset** as:

```text
Services
```

5. Vercel should now read the root `vercel.json`.

### 3. Add Environment Variables

Add these environment variables in the Vercel project:

```env
MONGODB_URI=your_real_mongodb_atlas_uri
DATABASE_NAME=school_management
SAVE_API_USERS=true
SAVE_API_NOTICES=true
NEXT_PUBLIC_API_URL=
CORS_ORIGINS=https://your-project-name.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

For Vercel Services, the frontend and backend share one domain, so `NEXT_PUBLIC_API_URL` can be left empty. The frontend will call `/api/...` on the same deployment domain.

### 4. Deploy

Click **Deploy**.

After deployment, your app will be available at one URL:

```text
https://your-project-name.vercel.app
```

API routes will be under the same domain:

```text
https://your-project-name.vercel.app/api/health
```

### 5. Seed Users

The database can be seeded from your local machine because MongoDB Atlas is remote:

```powershell
cd E:\CSEDU\3-2\SDP-Lab\Project
python -m backend.seed_users
```

### Vercel Notes

- The backend is a serverless FastAPI function, so memory state can reset between requests.
- User records, notices, and student notifications are saved in MongoDB Atlas.
- The Observer pattern is still used when publishing a notice; MongoDB is used so deployed responses survive serverless restarts.
- If MongoDB Atlas Network Access blocks Vercel, allow access from anywhere for this lab project using `0.0.0.0/0`, or configure a stricter production-safe network rule later.

## Seed Demo Users Into MongoDB

The backend includes a database seed script that creates:

- 10 students: `S-2026-001` to `S-2026-010`
- 5 teachers: `T-101` to `T-105`
- 5 staff users: `ST-001` to `ST-005`

Run it from the project root:

```powershell
cd E:\CSEDU\3-2\SDP-Lab\Project
python -m backend.seed_users
```

The script is idempotent. If a user ID or email already exists, it skips that user instead of inserting a duplicate.

Default passwords:

- Students: `student123`
- Teachers: `teacher123`
- Staff: `staff123`

The seed script still uses the Abstract Factory registration service, so users are created through the same backend pattern flow as normal registration.

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

---

## Task 4: Strategy Pattern For Grade And Fee Calculation

The backend now uses the **Strategy Design Pattern** for a new school management feature called the **Student Policy Calculator**.

This feature calculates:

- student final grade using a selected grading policy
- student payable fee using a selected fee policy

The important idea is that different courses and students can follow different rules. Instead of writing many `if/elif` blocks inside the API route, each rule is placed in its own strategy class.

## Strategy Pattern Structure

There are two separate strategy groups:

```text
GradeStrategy
  |
  | implemented by
  v
LabCourseGradeStrategy
TheoryCourseGradeStrategy
BalancedGradeStrategy
```

```text
FeeStrategy
  |
  | implemented by
  v
RegularFeeStrategy
MeritScholarshipFeeStrategy
SiblingDiscountFeeStrategy
FinancialAidFeeStrategy
```

The API endpoint selects the correct strategy at runtime based on the request data.

## Grade Strategy Module

File:

```text
grade_strategy.py
```

The grade module contains:

- `GradeStrategy` - abstract base class for all grade policies
- `GradeResult` - result object for final score and letter grade
- `LabCourseGradeStrategy`
- `TheoryCourseGradeStrategy`
- `BalancedGradeStrategy`
- `GradeStrategyProvider`

### Grade Policies

`LabCourseGradeStrategy` is useful for lab courses like SDP Lab:

```text
Lab score        50%
Viva score       20%
Assignment score 20%
Attendance       10%
```

`TheoryCourseGradeStrategy` is useful for normal theory courses:

```text
Exam score       70%
Assignment score 20%
Attendance       10%
```

`BalancedGradeStrategy` is useful when exam, lab, assignment, and attendance all matter:

```text
Exam score       40%
Lab score        30%
Assignment score 20%
Attendance       10%
```

### Letter Grade Rules

The final numeric score is converted into a letter grade:

```text
80 or above  -> A+
70 to 79     -> A
60 to 69     -> B
50 to 59     -> C
Below 50     -> F
```

## Fee Strategy Module

File:

```text
fee_strategy.py
```

The fee module contains:

- `FeeStrategy` - abstract base class for all fee policies
- `FeeResult` - result object for payable fee information
- `RegularFeeStrategy`
- `MeritScholarshipFeeStrategy`
- `SiblingDiscountFeeStrategy`
- `FinancialAidFeeStrategy`
- `FeeStrategyProvider`

### Fee Policies

```text
Regular fee        -> 0% discount
Merit scholarship  -> 30% discount
Sibling discount   -> 15% discount
Financial aid      -> 50% discount
```

Each strategy returns:

- original fee
- discount amount
- payable fee
- policy name
- explanation

## API Endpoint

The Strategy Pattern is used by this endpoint:

```text
POST /api/student-policy/calculate
```

Example request:

```json
{
  "student_id": "S-2026-001",
  "student_name": "Rahim Uddin",
  "course_id": "CSE-3204",
  "grade_policy": "lab_course",
  "fee_policy": "merit",
  "exam_score": 78,
  "lab_score": 88,
  "assignment_score": 82,
  "attendance_score": 90,
  "viva_score": 84,
  "base_fee": 25000
}
```

Example response:

```json
{
  "student_id": "S-2026-001",
  "student_name": "Rahim Uddin",
  "course_id": "CSE-3204",
  "final_score": 86.2,
  "letter_grade": "A+",
  "grade_policy_used": "Lab Course",
  "grade_explanation": "Lab 50%, viva 20%, assignment 20%, and attendance 10% were applied.",
  "original_fee": 25000,
  "discount_amount": 7500,
  "payable_fee": 17500,
  "fee_policy_used": "Merit Scholarship",
  "fee_explanation": "Merit scholarship policy applied with a 30% discount."
}
```

## How The Strategy Flow Works

Example flow:

```text
Teacher/staff submits marks and fee data
  |
  v
FastAPI endpoint receives selected policies
  |
  v
GradeStrategyProvider selects grade strategy
FeeStrategyProvider selects fee strategy
  |
  v
Selected strategies calculate result
  |
  v
API returns grade and fee summary
```

The endpoint does not need to know the internal formula of each policy. It only calls:

```python
grade_result = grade_strategy.calculate(scores)
fee_result = fee_strategy.calculate(base_fee)
```

This is the main point of Strategy Pattern.

## Why This Follows Strategy Pattern

The Strategy Pattern is used when there are multiple algorithms for the same task and the program needs to choose one at runtime.

In this project:

- grade calculation has multiple algorithms
- fee calculation has multiple algorithms
- each algorithm is placed in a separate class
- the API route uses the common strategy interface
- the selected strategy can change based on request data

For example, this request uses lab course grading:

```json
"grade_policy": "lab_course"
```

Another request can use theory course grading:

```json
"grade_policy": "theory_course"
```

The API route stays almost the same. Only the selected strategy changes.

## Why Did We Use Strategy?

We used Strategy because grade and fee calculation rules can change from case to case.

For grades:

- lab courses need lab-focused calculation
- theory courses need exam-focused calculation
- mixed courses need balanced calculation

For fees:

- regular students pay full fee
- merit students get scholarship discount
- sibling students get sibling discount
- financially supported students get financial aid

This improves:

- **loose coupling:** the API does not directly depend on all formulas
- **maintainability:** each formula is in its own class
- **readability:** no long `if/elif` calculation block
- **extensibility:** new policies can be added with new strategy classes
- **testing:** each policy can be tested separately

## What Happens Without Strategy?

Without Strategy, the endpoint might look like this:

```python
if grade_policy == "lab_course":
    final_score = lab_score * 0.50 + viva_score * 0.20 + ...
elif grade_policy == "theory_course":
    final_score = exam_score * 0.70 + ...
elif grade_policy == "balanced":
    final_score = exam_score * 0.40 + lab_score * 0.30 + ...
```

And fee calculation would also need another set of conditions:

```python
if fee_policy == "regular":
    discount = 0
elif fee_policy == "merit":
    discount = base_fee * 0.30
elif fee_policy == "sibling":
    discount = base_fee * 0.15
elif fee_policy == "financial_aid":
    discount = base_fee * 0.50
```

This works, but as the project grows the endpoint becomes harder to read and maintain.

Without Strategy:

- the API route becomes too large
- adding a new policy requires modifying old endpoint code
- formulas are mixed with request handling
- testing individual policies becomes harder
- the code violates the Open/Closed Principle

## Runtime Behavior

At runtime, the provider selects the strategy using a dictionary:

```python
strategy = GradeStrategyProvider.get_strategy("lab_course")
```

Then the selected strategy calculates the result:

```python
result = strategy.calculate(scores)
```

The runtime overhead is very small because it only adds:

1. one dictionary lookup
2. one method call through the strategy interface

This is much cheaper than real backend work such as API processing, database calls, and network requests.

## How Can We Add A New Strategy?

Suppose we want a new `ProjectCourseGradeStrategy`.

We would add:

1. a new class that extends `GradeStrategy`
2. its own `calculate()` method
3. one registry entry in `GradeStrategyProvider`

Example:

```python
_strategies = {
    "lab_course": LabCourseGradeStrategy(),
    "theory_course": TheoryCourseGradeStrategy(),
    "balanced": BalancedGradeStrategy(),
    "project_course": ProjectCourseGradeStrategy(),
}
```

The API endpoint does not need major changes because it already works with the `GradeStrategy` abstraction.

## Student Result And Fee Dashboard

The frontend now shows student information in separate sections:

- **Results** - subject marks, final score, letter grade, and pass/fail status
- **Fees** - semester fee, scholarship, paid amount, due amount, and failed-course extra fee

If a student fails a subject, the system shows an extra retake fee in the fee section.

Example:

```text
Failed subject: CSE-3207 Database Management Systems
Grade: F
Extra fee: Tk 2500
```

This is currently demo dashboard data in the frontend. The backend Strategy endpoint is ready for dynamic grade and fee calculation.

## Strategy Viva Notes

### What is Strategy Pattern?

Strategy Pattern is a behavioral design pattern where different algorithms are placed in separate classes, and the program selects one algorithm at runtime.

### Where did we use Strategy?

We used it in:

- `grade_strategy.py` for grade calculation
- `fee_strategy.py` for fee calculation
- `/api/student-policy/calculate` endpoint to select and apply the strategies

### What are the strategies?

Grade strategies:

- `LabCourseGradeStrategy`
- `TheoryCourseGradeStrategy`
- `BalancedGradeStrategy`

Fee strategies:

- `RegularFeeStrategy`
- `MeritScholarshipFeeStrategy`
- `SiblingDiscountFeeStrategy`
- `FinancialAidFeeStrategy`

### What is the context?

The FastAPI endpoint works as the context. It receives the selected policy, asks the provider for the correct strategy, and then calls `calculate()`.

### Why is this better than if/else?

It keeps each formula separate. The API route handles the request, and the strategy classes handle calculation. This makes the code cleaner and easier to extend.

### What if the teacher wants a new grading rule?

We can create a new strategy class and register it in `GradeStrategyProvider`. The endpoint can continue using the same interface.

### Short viva answer

This project uses Strategy Pattern for grade and fee calculation. Different courses and students need different calculation rules. Instead of writing all formulas inside the API route with many `if/elif` blocks, each formula is placed in its own strategy class. The API selects the correct strategy at runtime using `GradeStrategyProvider` and `FeeStrategyProvider`. This keeps the endpoint clean, follows the Open/Closed Principle, and makes it easy to add new policies later.

---

## Classroom Invite And Join Feature

The backend also includes a classroom invite feature used by the teacher and student dashboards.

Teachers or staff can create a classroom. The backend generates an invite code. Students can enter that code to join the classroom.

## Classroom API Endpoints

### List Classrooms

```text
GET /api/classrooms
```

For a student-specific joined status:

```text
GET /api/classrooms?student_id=S-2026-001
```

### Create Classroom

```text
POST /api/classrooms
```

Example request:

```json
{
  "title": "Machine Learning",
  "course_code": "CSE-4301",
  "teacher_name": "Nusrat Jahan"
}
```

Example response:

```json
{
  "classroom_id": "CSE-4301",
  "title": "Machine Learning",
  "course_code": "CSE-4301",
  "teacher_name": "Nusrat Jahan",
  "invite_code": "A1B2C3",
  "enrolled_student_count": 0,
  "joined": false
}
```

### Join Classroom

```text
POST /api/classrooms/join
```

Example request:

```json
{
  "invite_code": "SDP3204",
  "student_id": "S-2026-001",
  "student_name": "Rahim Uddin",
  "student_email": "rahim@student.example.com"
}
```

Example response:

```json
{
  "classroom": {
    "classroom_id": "CSE-3204",
    "title": "Software Development Project Lab",
    "course_code": "CSE-3204",
    "teacher_name": "Nusrat Jahan",
    "invite_code": "SDP3204",
    "enrolled_student_count": 3,
    "joined": true
  },
  "message": "Rahim Uddin joined CSE-3204."
}
```

## Classroom Viva Notes

### How does classroom join work?

The teacher creates a classroom and shares the invite code. The student enters the invite code. The backend finds the matching classroom and enrolls the student into that classroom notice board.

### Is classroom data saved permanently?

For this lab version, the new classroom catalog is stored in memory. It is useful for demo and viva. The existing notices and registered users can still use MongoDB depending on the environment variables.

### How is this connected to Observer?

When a student joins a classroom, the backend creates an `EnrolledStudent` object and attaches it to the classroom notice board. After that, when a notice is published, the student can receive the notice through the Observer pattern.

### Short viva answer

The classroom invite feature lets teachers create classrooms and share invite codes. Students use the code to join. Internally, joining a classroom enrolls the student in the classroom notice board, so the Observer pattern can notify them when notices are published. In this lab version, the classroom catalog is in memory for simple demonstration.
