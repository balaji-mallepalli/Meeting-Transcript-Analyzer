# Meeting Transcript Analyzer

An AI-powered tool to transform raw meeting transcripts into structured insights, including summaries, key decisions, and action items.

## 🚀 Features

- **Abstractive Summarization:** Generates concise overall and topic-wise summaries using transformer models.
- **Topic Segmentation:** Automatically identifies discussion shifts using TextTiling.
- **Decision & Action Extraction:** Uses zero-shot classification to pinpoint commitments and conclusions.
- **Real-time Progress:** Live updates via Server-Sent Events (SSE) during processing.
- **Interactive Dashboard:** Inline editing of results and session history management.
- **Professional Export:** Generate formatted PDF reports with one click.

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, HuggingFace Transformers (BART/PEGASUS), NLTK, PyTorch.
- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion, jsPDF.

## ⚙️ Installation & Setup

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python main.py
   ```
   *The API will be available at http://localhost:8000*

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at http://localhost:5173*

## 📁 Project Structure

- `/backend`: FastAPI server, NLP modules, and data models.
- `/frontend`: React application and UI components.
- `/samples`: Example transcripts for testing.

## 📄 License

MIT License - feel free to use for your own projects!
