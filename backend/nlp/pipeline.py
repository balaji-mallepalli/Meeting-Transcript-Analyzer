import asyncio
from typing import Callable, Optional
from functools import partial

from .preprocessor import preprocess, get_plain_text
from .topic_segmenter import segment_topics
from .summarizer import Summarizer
from .decision_extractor import DecisionExtractor
from .action_extractor import ActionExtractor
from .evaluator import evaluate_summary, evaluate_extraction

_summarizer = Summarizer()
_decision_extractor = DecisionExtractor()
_action_extractor = ActionExtractor()

async def run_in_thread(func, *args, **kwargs):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, partial(func, *args, **kwargs))

async def run_analysis(
    text: str, 
    task_id: Optional[str] = None, 
    progress_callback: Optional[Callable] = None,
    reference_summary: Optional[str] = None,
    reference_decisions: Optional[list] = None,
    reference_actions: Optional[list] = None
) -> dict:
    
    async def report_progress(step: str, percent: int):
        if progress_callback and task_id:
            if asyncio.iscoroutinefunction(progress_callback):
                await progress_callback(task_id, step, percent)
            else:
                progress_callback(task_id, step, percent)

    await report_progress("preprocessing", 10)
    turns, processed_text = await run_in_thread(preprocess, text)
    
    if not turns:
        await report_progress("done", 100)
        return {"error": "Could not parse transcript into speaker turns."}

    await report_progress("segmenting topics", 25)
    segments = await run_in_thread(segment_topics, turns)
    
    await report_progress("summarizing", 45)
    full_text = get_plain_text(turns)
    summary_result = await run_in_thread(_summarizer.summarize, full_text, segments)
    
    await report_progress("extracting decisions", 65)
    decisions = await run_in_thread(_decision_extractor.extract, turns)
    
    await report_progress("extracting action items", 85)
    action_items = await run_in_thread(_action_extractor.extract, turns)
    
    evaluation_result = None
    if reference_summary or reference_decisions is not None or reference_actions is not None:
         evaluation_result = {
             "summary_scores": {"rouge1": 0.0, "rouge2": 0.0, "rougeL": 0.0},
             "decision_metrics": {"precision": 0.0, "recall": 0.0, "f1": 0.0},
             "action_metrics": {"precision": 0.0, "recall": 0.0, "f1": 0.0}
         }
         
         if reference_summary:
              evaluation_result["summary_scores"] = evaluate_summary(summary_result["overall"], reference_summary)
         
         if reference_decisions is not None:
             pred_dec = [d["decision"] for d in decisions]
             evaluation_result["decision_metrics"] = evaluate_extraction(pred_dec, reference_decisions)
             
         if reference_actions is not None:
             pred_act = [a["action"] for a in action_items]
             evaluation_result["action_metrics"] = evaluate_extraction(pred_act, reference_actions)

    await report_progress("done", 100)
    
    unique_speakers = list({t["speaker"] for t in turns})
    
    return {
        "summary": summary_result,
        "decisions": decisions,
        "action_items": action_items,
        "total_turns": len(turns),
        "speakers": unique_speakers,
        "evaluation": evaluation_result if (reference_summary or reference_decisions is not None or reference_actions is not None) else None
    }
