from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from backend.database import DatabaseConnection
from backend.user_factory import UserRegistrationService


@dataclass(frozen=True)
class SeedUser:
    user_type: str
    data: Dict[str, str]
    id_field: str
    collection_name: str


def build_seed_users() -> List[SeedUser]:
    students = [
        SeedUser(
            "student",
            {
                "name": name,
                "email": f"{student_id.lower().replace('-', '')}@student.example.com",
                "password": "student123",
                "student_id": student_id,
                "department": "CSE",
                "semester": "3-2",
            },
            "student_id",
            "students",
        )
        for student_id, name in [
            ("S-2026-001", "Rahim Uddin"),
            ("S-2026-002", "Karim Ahmed"),
            ("S-2026-003", "Nabila Islam"),
            ("S-2026-004", "Afsana Karim"),
            ("S-2026-005", "Tanvir Hasan"),
            ("S-2026-006", "Maliha Akter"),
            ("S-2026-007", "Samiul Islam"),
            ("S-2026-008", "Farhana Rahman"),
            ("S-2026-009", "Rafi Chowdhury"),
            ("S-2026-010", "Tasmia Noor"),
        ]
    ]

    teachers = [
        SeedUser(
            "teacher",
            {
                "name": name,
                "email": f"{teacher_id.lower().replace('-', '')}@teacher.example.com",
                "password": "teacher123",
                "teacher_id": teacher_id,
                "department": "CSE",
                "designation": designation,
            },
            "teacher_id",
            "teachers",
        )
        for teacher_id, name, designation in [
            ("T-101", "Dr. Mahfuz Rahman", "Professor"),
            ("T-102", "Nusrat Jahan", "Lecturer"),
            ("T-103", "Sabbir Ahmed", "Assistant Professor"),
            ("T-104", "Momena Akter", "Associate Professor"),
            ("T-105", "Arif Hossain", "Lecturer"),
        ]
    ]

    staff = [
        SeedUser(
            "staff",
            {
                "name": name,
                "email": f"{staff_id.lower().replace('-', '')}@staff.example.com",
                "password": "staff123",
                "staff_id": staff_id,
                "office": office,
                "shift": "Morning",
            },
            "staff_id",
            "staff",
        )
        for staff_id, name, office in [
            ("ST-001", "Kamal Hossain", "Registrar Office"),
            ("ST-002", "Runa Akter", "Accounts Office"),
            ("ST-003", "Mizan Rahman", "Exam Control Office"),
            ("ST-004", "Shaila Parvin", "Department Office"),
            ("ST-005", "Jahidul Islam", "Library Desk"),
        ]
    ]

    return students + teachers + staff


def seed_users() -> None:
    database_connection = DatabaseConnection()
    if not database_connection.ping():
        raise RuntimeError("Could not connect to MongoDB. Check backend/.env.")

    database = database_connection.get_database()
    registration_service = UserRegistrationService(database)

    inserted_count = 0
    skipped_count = 0

    for seed_user in build_seed_users():
        collection = database[seed_user.collection_name]
        user_id = seed_user.data[seed_user.id_field]
        email = seed_user.data["email"]

        existing_user = collection.find_one(
            {
                "$or": [
                    {seed_user.id_field: user_id},
                    {"email": email},
                ]
            }
        )

        if existing_user is not None:
            skipped_count += 1
            print(f"Skipped existing {seed_user.user_type}: {user_id}")
            continue

        result = registration_service.register(seed_user.user_type, seed_user.data, save_to_database=True)
        inserted_count += 1
        print(f"Inserted {seed_user.user_type}: {user_id} -> {result.collection_name}")

    print(f"\nSeed complete. Inserted: {inserted_count}, skipped: {skipped_count}")


if __name__ == "__main__":
    seed_users()
