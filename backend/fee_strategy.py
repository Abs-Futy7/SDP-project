from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class FeeResult:
    original_fee: float
    discount_amount: float
    payable_fee: float
    policy_name: str
    explanation: str


class FeeStrategy(ABC):
    discount_rate = 0.0
    policy_name = "Regular"
    explanation = "No discount was applied."

    @abstractmethod
    def calculate(self, base_fee: float) -> FeeResult:
        pass

    def _calculate_with_discount(self, base_fee: float) -> FeeResult:
        discount_amount = round(base_fee * self.discount_rate, 2)
        payable_fee = round(base_fee - discount_amount, 2)
        return FeeResult(
            original_fee=round(base_fee, 2),
            discount_amount=discount_amount,
            payable_fee=payable_fee,
            policy_name=self.policy_name,
            explanation=self.explanation,
        )


class RegularFeeStrategy(FeeStrategy):
    discount_rate = 0.0
    policy_name = "Regular"
    explanation = "Regular fee policy applied with no discount."

    def calculate(self, base_fee: float) -> FeeResult:
        return self._calculate_with_discount(base_fee)


class MeritScholarshipFeeStrategy(FeeStrategy):
    discount_rate = 0.30
    policy_name = "Merit Scholarship"
    explanation = "Merit scholarship policy applied with a 30% discount."

    def calculate(self, base_fee: float) -> FeeResult:
        return self._calculate_with_discount(base_fee)


class SiblingDiscountFeeStrategy(FeeStrategy):
    discount_rate = 0.15
    policy_name = "Sibling Discount"
    explanation = "Sibling discount policy applied with a 15% discount."

    def calculate(self, base_fee: float) -> FeeResult:
        return self._calculate_with_discount(base_fee)


class FinancialAidFeeStrategy(FeeStrategy):
    discount_rate = 0.50
    policy_name = "Financial Aid"
    explanation = "Financial aid policy applied with a 50% discount."

    def calculate(self, base_fee: float) -> FeeResult:
        return self._calculate_with_discount(base_fee)


class FeeStrategyProvider:
    _strategies: Dict[str, FeeStrategy] = {
        "regular": RegularFeeStrategy(),
        "merit": MeritScholarshipFeeStrategy(),
        "sibling": SiblingDiscountFeeStrategy(),
        "financial_aid": FinancialAidFeeStrategy(),
    }

    @classmethod
    def get_strategy(cls, policy: str) -> FeeStrategy:
        normalized_policy = policy.strip().lower()
        if normalized_policy not in cls._strategies:
            raise ValueError(f"Unknown fee policy: {policy}")
        return cls._strategies[normalized_policy]
