import asyncio

from fastapi import FastAPI, HTTPException
from google.genai.types import Part, UserContent
from fastapi.middleware.cors import CORSMiddleware

from .altimate import altimate_agent
from .altimate.utils import get_agent_response
from .altimate.types import AltimateRequest
from .altimate.parallel import build_parallel_agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite and Create React App default ports
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/")
async def request_corrections(request: AltimateRequest):
    from google.adk.runners import InMemoryRunner

    if not request.requested_checks:
        raise HTTPException(status_code=400, detail="No checks specified")

    prepped_agent = altimate_agent.model_copy(
        update={
            "sub_agents": [build_parallel_agent(request.requested_checks)]
        }
    )

    runner = InMemoryRunner(agent=prepped_agent)

    session = await runner.session_service.create_session(
        app_name=runner.app_name, user_id="api_user"
    )

    content = UserContent(parts=[Part(text=request.html)])

    try:
        response = await asyncio.wait_for(
            get_agent_response(runner, session, content), timeout=400
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="AI agent timed out")

    corrections = response.get("corrections", "").strip()
    summary = response.get("summary", "").strip()

    if not corrections:
        raise HTTPException(
            status_code=204,
            detail="No accessibility corrections found"
        )

    return {
        "corrections": corrections,
        "summary": summary
    }
