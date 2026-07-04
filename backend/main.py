import os

from backend.database import DatabaseConnection
from backend.notice_observer import ClassroomEnrollmentService, EnrolledStudent
from backend.user_factory import UserRegistrationService


def demonstrate_abstract_factory(database=None, save_to_database: bool = False) -> None:
    registration_service = UserRegistrationService(database)

    registrations = [
        (
            "student",
            {
                "name": "Rahim Uddin",
                "email": "rahim@student.example.com",
                "password": "student123",
                "student_id": "S-2026-001",
                "department": "CSE",
                "semester": "3-2",
            },
        ),
        (
            "teacher",
            {
                "name": "Nusrat Jahan",
                "email": "nusrat@teacher.example.com",
                "password": "teacher123",
                "teacher_id": "T-102",
                "department": "CSE",
                "designation": "Lecturer",
            },
        ),
        (
            "staff",
            {
                "name": "Kamal Hossain",
                "email": "kamal@staff.example.com",
                "password": "staff123",
                "staff_id": "ST-17",
                "office": "Registrar Office",
                "shift": "Morning",
            },
        ),
    ]

    print("\n=== Abstract Factory: User Registration ===")
    for user_type, data in registrations:
        result = registration_service.register(user_type, data, save_to_database=save_to_database)
        print(result.welcome_message)
        print(f"Saved collection: {result.collection_name}")
        if result.inserted_id:
            print(f"MongoDB inserted id: {result.inserted_id}")


def demonstrate_observer_pattern() -> None:
    enrollment_service = ClassroomEnrollmentService()
    classroom_id = "CSE-3204"

    students = [
        EnrolledStudent("S-2026-001", "Rahim Uddin", "rahim@student.example.com"),
        EnrolledStudent("S-2026-002", "Karim Ahmed", "karim@student.example.com"),
        EnrolledStudent("S-2026-003", "Nabila Islam", "nabila@student.example.com"),
    ]

    for student in students:
        enrollment_service.enroll_student(classroom_id, student)

    notice_board = enrollment_service.get_notice_board(classroom_id)
    notice = notice_board.publish_notice(
        title="SDP Lab Evaluation",
        message="Observer pattern assignment will be checked this week.",
        posted_by="Course Teacher",
    )

    print("\n=== Observer Pattern: Classroom Notice Board ===")
    print(f"Notice published: {notice.title}")
    print(f"Enrolled students notified: {notice_board.enrolled_student_count()}")
    for student in students:
        print(student.latest_notification_text())


def main() -> None:
    first_connection = DatabaseConnection()
    second_connection = DatabaseConnection()

    print("First object id :", id(first_connection))
    print("Second object id:", id(second_connection))
    print("Same instance   :", first_connection is second_connection)

    if first_connection.ping():
        database = first_connection.get_database()
        print(f"Connected to MongoDB Atlas database: {database.name}")
        save_samples = os.getenv("SAVE_SAMPLE_USERS", "false").lower() == "true"
        demonstrate_abstract_factory(database, save_to_database=save_samples)
        demonstrate_observer_pattern()
    else:
        print("Could not connect to MongoDB Atlas. Check your URI, username/password, and network access.")
        demonstrate_abstract_factory()
        demonstrate_observer_pattern()


if __name__ == "__main__":
    main()
