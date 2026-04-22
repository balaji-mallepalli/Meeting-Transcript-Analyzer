from pydantic import BaseModel, Field
from typing import List, Optional

class Decision(BaseModel):
    speaker: str
    decision: str
    confidence: float

class ActionItem(BaseModel):
    speaker: str
    action: str
    deadline: str
    confidence: float

class TopicSummary(BaseModel):
    topic: str
    summary: str

class SummaryResult(BaseModel):
    overall: str
    by_topic: List[TopicSummary]

class RougeScores(BaseModel):
    rouge1: float
    rouge2: float
    rougeL: float

class ExtractionMetrics(BaseModel):
    precision: float
    recall: float
    f1: float

class EvaluationResult(BaseModel):
    summary_scores: RougeScores
    decision_metrics: ExtractionMetrics
    action_metrics: ExtractionMetrics

class AnalysisResult(BaseModel):
    summary: SummaryResult
    decisions: List[Decision]
    action_items: List[ActionItem]
    total_turns: int
    speakers: List[str]
    evaluation: Optional[EvaluationResult] = None

class TextInput(BaseModel):
    text: str
