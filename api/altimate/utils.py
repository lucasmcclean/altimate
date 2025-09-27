from google.adk.runners import Runner
from google.adk.sessions.session import Session
from google.genai.types import Content


async def get_agent_response(
    runner: Runner, session: Session, content: Content
) -> str:
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
