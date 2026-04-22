import asyncio
from models.schemas import TextInput
from nlp.pipeline import run_analysis
import json

sample_text = """Alice: Good morning everyone. Let's get started with the budget.
Bob: I think we should finalize the budget by Friday.
Alice: Agreed. Bob will send the updated budget report by Thursday.
Carol: I need to review the design mockups before the next meeting.
Bob: We decided to go with the blue theme for the UI.
Alice: Carol, can you complete the user research by next Monday?
Carol: Yes, I will handle that.
Alice: Great. We'll proceed with the React framework for the frontend.
Bob: I will set up the repository today.
Alice: Moving on to deployment. We agreed to use Vercel for hosting.
Carol: She mentioned earlier that the deadline is end of month.
Bob: He will coordinate with the DevOps team by Wednesday."""

async def main():
    print("Running analysis on sample transcript...")
    
    async def mock_progress(task_id, step, percent):
        print(f"[{percent}%] {step}")
        
    result = await run_analysis(sample_text, task_id="test1", progress_callback=mock_progress)
    
    print("\n\n--- RESULTS ---")
    print(json.dumps(result, indent=2, default=str))
    
if __name__ == "__main__":
    asyncio.run(main())
