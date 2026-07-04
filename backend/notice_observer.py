from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Dict, List


@dataclass
class Notice:
    classroom_id: str
    title: str
    message: str
    posted_by: str
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_document(self) -> Dict[str, str]:
        return asdict(self)


class NoticeObserver(ABC):
    @abstractmethod
    def update(self, notice: Notice) -> None:
        pass


class NoticeSubject(ABC):
    @abstractmethod
    def attach(self, observer: NoticeObserver) -> None:
        pass

    @abstractmethod
    def detach(self, observer: NoticeObserver) -> None:
        pass

    @abstractmethod
    def notify(self, notice: Notice) -> None:
        pass


@dataclass
class StudentNotification:
    student_id: str
    classroom_id: str
    title: str
    message: str
    received_at: str


@dataclass
class EnrolledStudent(NoticeObserver):
    student_id: str
    name: str
    email: str
    notifications: List[StudentNotification] = field(default_factory=list)

    def update(self, notice: Notice) -> None:
        notification = StudentNotification(
            student_id=self.student_id,
            classroom_id=notice.classroom_id,
            title=notice.title,
            message=notice.message,
            received_at=datetime.now(timezone.utc).isoformat(),
        )
        self.notifications.append(notification)

    def latest_notification_text(self) -> str:
        if not self.notifications:
            return f"{self.name} has no notifications."

        latest = self.notifications[-1]
        return f"{self.name} received notice '{latest.title}' for classroom {latest.classroom_id}."


class ClassroomNoticeBoard(NoticeSubject):
    def __init__(self, classroom_id: str) -> None:
        self.classroom_id = classroom_id
        self._observers: List[NoticeObserver] = []
        self._notices: List[Notice] = []

    def attach(self, observer: NoticeObserver) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: NoticeObserver) -> None:
        if observer in self._observers:
            self._observers.remove(observer)

    def notify(self, notice: Notice) -> None:
        for observer in self._observers:
            observer.update(notice)

    def publish_notice(self, title: str, message: str, posted_by: str) -> Notice:
        notice = Notice(
            classroom_id=self.classroom_id,
            title=title,
            message=message,
            posted_by=posted_by,
        )
        self._notices.append(notice)
        self.notify(notice)
        return notice

    def notice_count(self) -> int:
        return len(self._notices)

    def enrolled_student_count(self) -> int:
        return len(self._observers)


class ClassroomEnrollmentService:
    def __init__(self) -> None:
        self._notice_boards: Dict[str, ClassroomNoticeBoard] = {}

    def get_notice_board(self, classroom_id: str) -> ClassroomNoticeBoard:
        if classroom_id not in self._notice_boards:
            self._notice_boards[classroom_id] = ClassroomNoticeBoard(classroom_id)
        return self._notice_boards[classroom_id]

    def enroll_student(self, classroom_id: str, student: EnrolledStudent) -> None:
        notice_board = self.get_notice_board(classroom_id)
        notice_board.attach(student)

    def remove_student(self, classroom_id: str, student: EnrolledStudent) -> None:
        notice_board = self.get_notice_board(classroom_id)
        notice_board.detach(student)
