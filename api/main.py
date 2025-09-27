import json
import asyncio
from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware
from google.adk.sessions.session import Session
from google.genai.types import Content, Part, UserContent

from agents.correction_agents import parallel_agent
from google.adk.runners import InMemoryRunner, Runner

from request import AltimateRequest


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/")
async def get_data(request: AltimateRequest):
    corrections_agent = parallel_agent(request.requested_checks)

    runner = InMemoryRunner(agent=corrections_agent)

    session = await runner.session_service.create_session(
        app_name=runner.app_name, user_id="api_user"
    )

    content = UserContent(parts=[Part(text=request.html)])

    try:
        agent_response = await asyncio.wait_for(
            get_agent_response(runner, session, content), timeout=10
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="AI agent timed out")

    agent_response = agent_response.strip("```json")
    agent_response = agent_response.strip("```").strip()

    corrections = json.loads(agent_response)

    return {"corrections": corrections}


async def get_agent_response(runner: Runner, session: Session, content: Content) -> str:
    agent_response = ""

    async for event in runner.run_async(
        user_id=session.user_id,
        session_id=session.id,
        new_message=content,
    ):
        if (
            event.content
            and event.content.parts
            and event.content.parts[0].text
        ):
            agent_response = event.content.parts[0].text

    return agent_response
