from __future__ import annotations

import os
from dataclasses import asdict
from typing import Dict, List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    def load_dotenv() -> bool:
        return False

try:
    from backend.database import DatabaseConnection
    from backend.fee_strategy import FeeStrategyProvider
    from backend.grade_strategy import GradeStrategyProvider
    from backend.notice_observer import ClassroomEnrollmentService, EnrolledStudent
    from backend.user_factory import UserRegistrationService
except ModuleNotFoundError:
    from database import DatabaseConnection
    from fee_strategy import FeeStrategyProvider
    from grade_strategy import GradeStrategyProvider
    from notice_observer import ClassroomEnrollmentService, EnrolledStudent
    from user_factory import UserRegistrationService


load_dotenv()


def _get_cors_origins() -> List[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


app = FastAPI(title="University Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterUserRequest(BaseModel):
    user_type: Literal["student", "teacher", "staff"]
    name: str
    email: EmailStr
    password: str
    university_id: str
    department: str = "CSE"
    extra: str


class RegisterUserResponse(BaseModel):
    role: str
    name: str
    email: EmailStr
    university_id: str
    dashboard_route: str
    collection_name: str
    welcome_message: str
    inserted_id: Optional[str] = None
    database_saved: bool


class LoginRequest(BaseModel):
    user_type: Literal["student", "teacher", "staff"]
    email: EmailStr
    university_id: str
    password: str


class LoginResponse(BaseModel):
    role: str
    name: str
    email: EmailStr
    university_id: str
    dashboard_route: str
    message: str


class PublishNoticeRequest(BaseModel):
    title: str
    message: str
    posted_by: str = "Course Teacher"


class StudentNotificationResponse(BaseModel):
    student_id: str
    name: str
    email: str
    enrolled: bool
    notification_count: int
    latest_notification: Optional[str] = None


class NoticeBoardResponse(BaseModel):
    classroom_id: str
    notice_count: int
    enrolled_student_count: int
    students: List[StudentNotificationResponse]


class StudentNoticeBoardResponse(BaseModel):
    classroom_id: str
    student: StudentNotificationResponse


class StudentPolicyCalculationRequest(BaseModel):
    student_id: str
    student_name: str
    course_id: str
    grade_policy: str
    fee_policy: str
    exam_score: float = Field(default=0, ge=0, le=100)
    lab_score: float = Field(default=0, ge=0, le=100)
    assignment_score: float = Field(default=0, ge=0, le=100)
    attendance_score: float = Field(default=0, ge=0, le=100)
    viva_score: float = Field(default=0, ge=0, le=100)
    base_fee: float = Field(ge=0)


class StudentPolicyCalculationResponse(BaseModel):
    student_id: str
    student_name: str
    course_id: str
    final_score: float
    letter_grade: str
    grade_policy_used: str
    grade_explanation: str
    original_fee: float
    discount_amount: float
    payable_fee: float
    fee_policy_used: str
    fee_explanation: str


enrollment_service = ClassroomEnrollmentService()
classroom_students: Dict[str, List[EnrolledStudent]] = {
    "CSE-3204": [
        EnrolledStudent("S-2026-001", "Rahim Uddin", "rahim@student.example.com"),
        EnrolledStudent("S-2026-002", "Karim Ahmed", "karim@student.example.com"),
        EnrolledStudent("S-2026-003", "Nabila Islam", "nabila@student.example.com"),
    ]
}

demo_users = {
    "student": {
        "id": "S-2026-001",
        "name": "Rahim Uddin",
        "email": "rahim@student.example.com",
        "password": "student123",
        "dashboard_route": "/student/dashboard",
    },
    "teacher": {
        "id": "T-102",
        "name": "Nusrat Jahan",
        "email": "nusrat@teacher.example.com",
        "password": "teacher123",
        "dashboard_route": "/teacher/dashboard",
    },
    "staff": {
        "id": "ST-17",
        "name": "Kamal Hossain",
        "email": "kamal@staff.example.com",
        "password": "staff123",
        "dashboard_route": "/staff/dashboard",
    },
}

for classroom_id, students in classroom_students.items():
    for student in students:
        enrollment_service.enroll_student(classroom_id, student)


def _registration_data(request: RegisterUserRequest) -> Dict[str, str]:
    common_data = {
        "name": request.name,
        "email": request.email,
        "password": request.password,
        "department": request.department,
    }

    if request.user_type == "student":
        return {
            **common_data,
            "student_id": request.university_id,
            "semester": request.extra,
        }

    if request.user_type == "teacher":
        return {
            **common_data,
            "teacher_id": request.university_id,
            "designation": request.extra,
        }

    return {
        **common_data,
        "staff_id": request.university_id,
        "office": request.extra,
        "shift": "Morning",
    }


def _database_if_available():
    try:
        connection = DatabaseConnection()
        if connection.ping():
            return connection.get_database()
    except Exception:
        return None
    return None


def _role_id_field(user_type: str) -> str:
    return {
        "student": "student_id",
        "teacher": "teacher_id",
        "staff": "staff_id",
    }[user_type]


def _role_collection(user_type: str) -> str:
    return {
        "student": "students",
        "teacher": "teachers",
        "staff": "staff",
    }[user_type]


def _sync_classroom_students_from_database(classroom_id: str) -> None:
    database = _database_if_available()
    if database is None:
        return

    students = classroom_students.setdefault(classroom_id, [])
    known_student_ids = {student.student_id for student in students}

    for student_document in database["students"].find({}, {"student_id": 1, "name": 1, "email": 1}):
        student_id = student_document.get("student_id")
        if not student_id or student_id in known_student_ids:
            continue

        student = EnrolledStudent(
            student_id,
            student_document.get("name", "Unnamed Student"),
            student_document.get("email", ""),
        )
        students.append(student)
        enrollment_service.enroll_student(classroom_id, student)
        known_student_ids.add(student_id)


def _student_response(
    student: EnrolledStudent,
    enrolled: bool = True,
    classroom_id: str = "CSE-3204",
) -> StudentNotificationResponse:
    database = _database_if_available()

    if database is not None:
        notification_count = database["student_notifications"].count_documents(
            {
                "student_id": student.student_id,
                "classroom_id": classroom_id,
            }
        )
        latest_document = database["student_notifications"].find_one(
            {
                "student_id": student.student_id,
                "classroom_id": classroom_id,
            },
            sort=[("received_at", -1)],
        )
        latest_notification = None
        if latest_document is not None:
            latest_notification = f"{latest_document.get('title')}: {latest_document.get('message')}"

        return StudentNotificationResponse(
            student_id=student.student_id,
            name=student.name,
            email=student.email,
            enrolled=enrolled,
            notification_count=notification_count,
            latest_notification=latest_notification,
        )

    latest_notification = None
    if student.notifications:
        latest = student.notifications[-1]
        latest_notification = f"{latest.title}: {latest.message}"

    return StudentNotificationResponse(
        student_id=student.student_id,
        name=student.name,
        email=student.email,
        enrolled=enrolled,
        notification_count=len(student.notifications),
        latest_notification=latest_notification,
    )


def _notice_board_response(classroom_id: str) -> NoticeBoardResponse:
    _sync_classroom_students_from_database(classroom_id)
    notice_board = enrollment_service.get_notice_board(classroom_id)
    students = classroom_students.setdefault(classroom_id, [])
    database = _database_if_available()
    notice_count = notice_board.notice_count()
    if database is not None:
        notice_count = database["classroom_notices"].count_documents({"classroom_id": classroom_id})

    return NoticeBoardResponse(
        classroom_id=classroom_id,
        notice_count=notice_count,
        enrolled_student_count=notice_board.enrolled_student_count(),
        students=[_student_response(student, classroom_id=classroom_id) for student in students],
    )


@app.get("/api/health")
def health_check():
    database = _database_if_available()
    return {
        "status": "ok",
        "database_connected": database is not None,
        "cors_origins": _get_cors_origins(),
    }


@app.post("/api/register", response_model=RegisterUserResponse)
def register_user(request: RegisterUserRequest):
    database = _database_if_available()
    save_to_database = database is not None and os.getenv("SAVE_API_USERS", "true").lower() == "true"
    service = UserRegistrationService(database)

    try:
        result = service.register(
            request.user_type,
            _registration_data(request),
            save_to_database=save_to_database,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    document = result.user.to_document()

    if request.user_type == "student":
        students = classroom_students.setdefault("CSE-3204", [])
        already_enrolled = any(student.student_id == request.university_id for student in students)
        if not already_enrolled:
            student = EnrolledStudent(request.university_id, request.name, request.email)
            students.append(student)
            enrollment_service.enroll_student("CSE-3204", student)

    return RegisterUserResponse(
        role=result.user.role,
        name=result.user.name,
        email=result.user.email,
        university_id=request.university_id,
        dashboard_route=document["dashboard_route"],
        collection_name=result.collection_name,
        welcome_message=result.welcome_message,
        inserted_id=result.inserted_id,
        database_saved=result.inserted_id is not None,
    )


@app.post("/api/login", response_model=LoginResponse)
def login(request: LoginRequest):
    role_id_prefix = {
        "student": "S-",
        "teacher": "T-",
        "staff": "ST-",
    }[request.user_type]

    if not request.university_id.upper().startswith(role_id_prefix):
        raise HTTPException(
            status_code=403,
            detail=f"{request.university_id} is not a valid {request.user_type} ID.",
        )

    database = _database_if_available()
    if database is not None:
        id_field = _role_id_field(request.user_type)
        user_document = database[_role_collection(request.user_type)].find_one(
            {
                id_field: request.university_id,
                "email": request.email,
            }
        )

        if user_document is not None:
            if not UserRegistrationService.verify_password(request.password, user_document.get("password_hash", "")):
                raise HTTPException(status_code=401, detail="Invalid credentials for selected role.")

            return LoginResponse(
                role=request.user_type,
                name=user_document.get("name", ""),
                email=user_document.get("email", ""),
                university_id=user_document.get(id_field, request.university_id),
                dashboard_route=user_document.get("dashboard_route", f"/{request.user_type}/dashboard"),
                message=f"Signed in as {request.user_type}.",
            )

    demo_user = demo_users[request.user_type]
    if (
        request.email.lower() != demo_user["email"].lower()
        or request.university_id != demo_user["id"]
        or request.password != demo_user["password"]
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials for selected role.")

    return LoginResponse(
        role=request.user_type,
        name=demo_user["name"],
        email=demo_user["email"],
        university_id=demo_user["id"],
        dashboard_route=demo_user["dashboard_route"],
        message=f"Signed in as {request.user_type}.",
    )


@app.get("/api/classrooms/{classroom_id}/notice-board", response_model=NoticeBoardResponse)
def get_notice_board(classroom_id: str):
    return _notice_board_response(classroom_id)


@app.get(
    "/api/classrooms/{classroom_id}/students/{student_id}/notice-board",
    response_model=StudentNoticeBoardResponse,
)
def get_student_notice_board(classroom_id: str, student_id: str):
    _sync_classroom_students_from_database(classroom_id)
    students = classroom_students.setdefault(classroom_id, [])
    student = next((item for item in students if item.student_id == student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail="Student is not enrolled in this classroom.")

    return StudentNoticeBoardResponse(
        classroom_id=classroom_id,
        student=_student_response(student, classroom_id=classroom_id),
    )


@app.post("/api/classrooms/{classroom_id}/notices", response_model=NoticeBoardResponse)
def publish_notice(classroom_id: str, request: PublishNoticeRequest):
    _sync_classroom_students_from_database(classroom_id)
    students = classroom_students.setdefault(classroom_id, [])
    notice_board = enrollment_service.get_notice_board(classroom_id)

    for student in students:
        notice_board.attach(student)

    notice = notice_board.publish_notice(
        title=request.title,
        message=request.message,
        posted_by=request.posted_by,
    )

    database = _database_if_available()
    if database is not None and os.getenv("SAVE_API_NOTICES", "true").lower() == "true":
        database["classroom_notices"].insert_one(notice.to_document())
        notification_documents = [
            asdict(notification) for student in students for notification in student.notifications[-1:]
        ]
        if notification_documents:
            database["student_notifications"].insert_many(notification_documents)

    return _notice_board_response(classroom_id)


@app.post("/api/student-policy/calculate", response_model=StudentPolicyCalculationResponse)
def calculate_student_policy(request: StudentPolicyCalculationRequest):
    try:
        grade_strategy = GradeStrategyProvider.get_strategy(request.grade_policy)
        fee_strategy = FeeStrategyProvider.get_strategy(request.fee_policy)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    grade_result = grade_strategy.calculate(
        {
            "exam_score": request.exam_score,
            "lab_score": request.lab_score,
            "assignment_score": request.assignment_score,
            "attendance_score": request.attendance_score,
            "viva_score": request.viva_score,
        }
    )
    fee_result = fee_strategy.calculate(request.base_fee)

    return StudentPolicyCalculationResponse(
        student_id=request.student_id,
        student_name=request.student_name,
        course_id=request.course_id,
        final_score=grade_result.final_score,
        letter_grade=grade_result.letter_grade,
        grade_policy_used=grade_result.policy_name,
        grade_explanation=grade_result.explanation,
        original_fee=fee_result.original_fee,
        discount_amount=fee_result.discount_amount,
        payable_fee=fee_result.payable_fee,
        fee_policy_used=fee_result.policy_name,
        fee_explanation=fee_result.explanation,
    )
