from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Mapping


@dataclass(frozen=True)
class GradeResult:
    final_score: float
    letter_grade: str
    policy_name: str
    explanation: str


class GradeStrategy(ABC):
    @abstractmethod
    def calculate(self, scores: Mapping[str, float]) -> GradeResult:
        pass

    def _weighted_score(self, scores: Mapping[str, float], weights: Mapping[str, float]) -> float:
        final_score = sum(scores.get(score_name, 0.0) * weight for score_name, weight in weights.items())
        return round(final_score, 2)

    def _letter_grade(self, final_score: float) -> str:
        if final_score >= 80:
            return "A+"
        if final_score >= 70:
            return "A"
        if final_score >= 60:
            return "B"
        if final_score >= 50:
            return "C"
        return "F"


class LabCourseGradeStrategy(GradeStrategy):
    def calculate(self, scores: Mapping[str, float]) -> GradeResult:
        final_score = self._weighted_score(
            scores,
            {
                "lab_score": 0.50,
                "viva_score": 0.20,
                "assignment_score": 0.20,
                "attendance_score": 0.10,
            },
        )
        return GradeResult(
            final_score=final_score,
            letter_grade=self._letter_grade(final_score),
            policy_name="Lab Course",
            explanation="Lab 50%, viva 20%, assignment 20%, and attendance 10% were applied.",
        )


class TheoryCourseGradeStrategy(GradeStrategy):
    def calculate(self, scores: Mapping[str, float]) -> GradeResult:
        final_score = self._weighted_score(
            scores,
            {
                "exam_score": 0.70,
                "assignment_score": 0.20,
                "attendance_score": 0.10,
            },
        )
        return GradeResult(
            final_score=final_score,
            letter_grade=self._letter_grade(final_score),
            policy_name="Theory Course",
            explanation="Exam 70%, assignment 20%, and attendance 10% were applied.",
        )


class BalancedGradeStrategy(GradeStrategy):
    def calculate(self, scores: Mapping[str, float]) -> GradeResult:
        final_score = self._weighted_score(
            scores,
            {
                "exam_score": 0.40,
                "lab_score": 0.30,
                "assignment_score": 0.20,
                "attendance_score": 0.10,
            },
        )
        return GradeResult(
            final_score=final_score,
            letter_grade=self._letter_grade(final_score),
            policy_name="Balanced",
            explanation="Exam 40%, lab 30%, assignment 20%, and attendance 10% were applied.",
        )


class GradeStrategyProvider:
    _strategies: Dict[str, GradeStrategy] = {
        "lab_course": LabCourseGradeStrategy(),
        "theory_course": TheoryCourseGradeStrategy(),
        "balanced": BalancedGradeStrategy(),
    }

    @classmethod
    def get_strategy(cls, policy: str) -> GradeStrategy:
        normalized_policy = policy.strip().lower()
        if normalized_policy not in cls._strategies:
            raise ValueError(f"Unknown grade policy: {policy}")
        return cls._strategies[normalized_policy]
