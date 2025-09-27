import asyncio
import json
from typing import cast

from fastapi import FastAPI, HTTPException
from google.genai.types import Part, UserContent

from app.agent import altimate_agent
from app.agent.utils import get_agent_response
from app.types import AltimateRequest

app = FastAPI()


@app.post("/")
async def request_corrections(request: AltimateRequest):
    from google.adk.runners import InMemoryRunner

    if not request.requested_checks:
        raise HTTPException(status_code=400, detail="No checks specified")

    requested_checks = ", ".join(
        check.value for check in request.requested_checks
    )
    checks_instruction = f"\n\nOnly run these accessibility checks: {requested_checks}. Ignore all others.\n"

    updated_agent = altimate_agent.model_copy(
        update={
            "instruction": cast(str, altimate_agent.instruction)
            + checks_instruction
        }
    )

    runner = InMemoryRunner(agent=updated_agent)

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

    try:
        corrections_raw = json.loads(agent_response)
        corrections = [
            AccessibilityCorrection(**item) for item in corrections_raw
        ]
    except Exception as e:
        raise HTTPException(
            status_code=422, detail=f"Agent response format invalid: {e}"
        )

    if not corrections:
        raise HTTPException(
            status_code=204, detail="No accessibility corrections found"
        )

    return {"corrections": [c.model_dump() for c in corrections]}
