from __future__ import annotations

import hashlib
import hmac
import os
from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, Mapping, Optional

if TYPE_CHECKING:
    from pymongo.database import Database


@dataclass
class RegisteredUser(ABC):
    name: str
    email: str
    password_hash: str
    role: str
    created_at: str

    @abstractmethod
    def get_dashboard_route(self) -> str:
        pass

    def to_document(self) -> Dict[str, Any]:
        document = asdict(self)
        document["dashboard_route"] = self.get_dashboard_route()
        return document


@dataclass
class StudentUser(RegisteredUser):
    student_id: str
    department: str
    semester: str

    def get_dashboard_route(self) -> str:
        return "/student/dashboard"


@dataclass
class TeacherUser(RegisteredUser):
    teacher_id: str
    department: str
    designation: str

    def get_dashboard_route(self) -> str:
        return "/teacher/dashboard"


@dataclass
class StaffUser(RegisteredUser):
    staff_id: str
    office: str
    shift: str

    def get_dashboard_route(self) -> str:
        return "/staff/dashboard"


class RegistrationPolicy(ABC):
    @abstractmethod
    def validate(self, data: Mapping[str, str]) -> None:
        pass

    @abstractmethod
    def collection_name(self) -> str:
        pass

    @abstractmethod
    def welcome_message(self, user: RegisteredUser) -> str:
        pass

    def _require_fields(self, data: Mapping[str, str], fields: list[str]) -> None:
        missing_fields = [field for field in fields if not data.get(field)]
        if missing_fields:
            raise ValueError("Missing required fields: " + ", ".join(missing_fields))


class StudentRegistrationPolicy(RegistrationPolicy):
    def validate(self, data: Mapping[str, str]) -> None:
        self._require_fields(data, ["name", "email", "password", "student_id", "department", "semester"])

    def collection_name(self) -> str:
        return "students"

    def welcome_message(self, user: RegisteredUser) -> str:
        return f"Student account created for {user.name}. Dashboard: {user.get_dashboard_route()}"


class TeacherRegistrationPolicy(RegistrationPolicy):
    def validate(self, data: Mapping[str, str]) -> None:
        self._require_fields(data, ["name", "email", "password", "teacher_id", "department", "designation"])

    def collection_name(self) -> str:
        return "teachers"

    def welcome_message(self, user: RegisteredUser) -> str:
        return f"Teacher account created for {user.name}. Dashboard: {user.get_dashboard_route()}"


class StaffRegistrationPolicy(RegistrationPolicy):
    def validate(self, data: Mapping[str, str]) -> None:
        self._require_fields(data, ["name", "email", "password", "staff_id", "office", "shift"])

    def collection_name(self) -> str:
        return "staff"

    def welcome_message(self, user: RegisteredUser) -> str:
        return f"Staff account created for {user.name}. Dashboard: {user.get_dashboard_route()}"


class UserRegistrationFactory(ABC):
    @abstractmethod
    def create_user(self, data: Mapping[str, str], password_hash: str, created_at: str) -> RegisteredUser:
        pass

    @abstractmethod
    def create_policy(self) -> RegistrationPolicy:
        pass


class StudentRegistrationFactory(UserRegistrationFactory):
    def create_user(self, data: Mapping[str, str], password_hash: str, created_at: str) -> RegisteredUser:
        return StudentUser(
            name=data["name"],
            email=data["email"],
            password_hash=password_hash,
            role="student",
            created_at=created_at,
            student_id=data["student_id"],
            department=data["department"],
            semester=data["semester"],
        )

    def create_policy(self) -> RegistrationPolicy:
        return StudentRegistrationPolicy()


class TeacherRegistrationFactory(UserRegistrationFactory):
    def create_user(self, data: Mapping[str, str], password_hash: str, created_at: str) -> RegisteredUser:
        return TeacherUser(
            name=data["name"],
            email=data["email"],
            password_hash=password_hash,
            role="teacher",
            created_at=created_at,
            teacher_id=data["teacher_id"],
            department=data["department"],
            designation=data["designation"],
        )

    def create_policy(self) -> RegistrationPolicy:
        return TeacherRegistrationPolicy()


class StaffRegistrationFactory(UserRegistrationFactory):
    def create_user(self, data: Mapping[str, str], password_hash: str, created_at: str) -> RegisteredUser:
        return StaffUser(
            name=data["name"],
            email=data["email"],
            password_hash=password_hash,
            role="staff",
            created_at=created_at,
            staff_id=data["staff_id"],
            office=data["office"],
            shift=data["shift"],
        )

    def create_policy(self) -> RegistrationPolicy:
        return StaffRegistrationPolicy()


class UserFactoryProvider:
    _factories: Dict[str, UserRegistrationFactory] = {
        "student": StudentRegistrationFactory(),
        "teacher": TeacherRegistrationFactory(),
        "staff": StaffRegistrationFactory(),
    }

    @classmethod
    def get_factory(cls, user_type: str) -> UserRegistrationFactory:
        normalized_type = user_type.strip().lower()
        if normalized_type not in cls._factories:
            raise ValueError(f"Unknown user type: {user_type}")
        return cls._factories[normalized_type]


@dataclass
class RegistrationResult:
    user: RegisteredUser
    collection_name: str
    welcome_message: str
    inserted_id: Optional[str] = None


class UserRegistrationService:
    def __init__(self, database: Optional["Database"] = None) -> None:
        self._database = database

    def register(self, user_type: str, data: Mapping[str, str], save_to_database: bool = False) -> RegistrationResult:
        factory = UserFactoryProvider.get_factory(user_type)
        policy = factory.create_policy()

        policy.validate(data)

        created_at = datetime.now(timezone.utc).isoformat()
        password_hash = self._hash_password(data["password"])
        user = factory.create_user(data, password_hash, created_at)

        inserted_id = None
        if save_to_database:
            if self._database is None:
                raise ValueError("Database is required when save_to_database is True.")
            result = self._database[policy.collection_name()].insert_one(user.to_document())
            inserted_id = str(result.inserted_id)

        return RegistrationResult(
            user=user,
            collection_name=policy.collection_name(),
            welcome_message=policy.welcome_message(user),
            inserted_id=inserted_id,
        )

    def _hash_password(self, password: str) -> str:
        salt = os.urandom(16)
        password_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return f"{salt.hex()}:{password_hash.hex()}"

    @staticmethod
    def verify_password(password: str, stored_password_hash: str) -> bool:
        try:
            salt_hex, hash_hex = stored_password_hash.split(":", 1)
            salt = bytes.fromhex(salt_hex)
            expected_hash = bytes.fromhex(hash_hex)
        except ValueError:
            return False

        actual_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(actual_hash, expected_hash)
