"""
WHS 2024 Mathematical Engine - Kenya Golf Union
Implements Section 5 of the WHS Rules of Handicapping.
Server-side implementation to prevent client tampering.
"""

import math
from typing import List, Optional


def calculate_course_handicap(
    handicap_index: float,
    slope_rating: int,
    course_rating: float,
    par: int
) -> int:
    """
    CH = (Index * (Slope/113)) + (CR - Par)
    """
    ch = (handicap_index * (slope_rating / 113)) + (course_rating - par)
    return round(ch)


def get_expected_score_value(
    handicap_index: float,
    holes_remaining: int
) -> float:
    """
    WHS 2024 Expected Score Scaling.
    Expected Score = (Holes / 18) * (NeutralCR + (Index * 1.04))
    """
    neutral_cr = 72
    ratio = holes_remaining / 18
    return ratio * (neutral_cr + (handicap_index * 1.04))


def calculate_score_differential(
    actual_gross_score: int,
    holes_played: int,
    handicap_index: float,
    course_rating: float,
    slope_rating: int,
    pcc: float = 0
) -> float:
    """
    Calculates an 18-hole Score Differential for any valid round (9+ holes).
    Differential = (113 / Slope) * (AdjustedGross - CourseRating - PCC)
    """
    total_adjusted = float(actual_gross_score)

    if 9 <= holes_played < 18:
        missing = 18 - holes_played
        expected = get_expected_score_value(handicap_index, missing)
        total_adjusted += expected

    differential = (113 / slope_rating) * (total_adjusted - course_rating - pcc)
    return round(differential * 10) / 10


def calculate_handicap_index(differentials: List[float]) -> float:
    """
    Best N of 20 rule per WHS 2024.
    """
    if not differentials:
        return 0.0

    sorted_diffs = sorted(differentials)
    count = len(sorted_diffs)

    if count >= 20:
        num_to_use = 8
    elif count >= 15:
        num_to_use = 5
    elif count >= 10:
        num_to_use = 3
    elif count >= 6:
        num_to_use = 2
    else:
        num_to_use = 1

    best = sorted_diffs[:num_to_use]
    avg = sum(best) / len(best)
    return math.floor(avg * 10) / 10
