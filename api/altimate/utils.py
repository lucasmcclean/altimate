from google.adk.runners import Runner
from google.adk.sessions.session import Session
from google.genai.types import Content


async def get_agent_response(
    runner: Runner,
    session: Session,
    content: Content,
) -> dict[str, str]:
    agent_response: dict[str, str] = {}

    async for event in runner.run_async(
        user_id=session.user_id,
        session_id=session.id,
        new_message=content,
    ):
        key = getattr(event, "output_key", "default")

        if not event.content or not event.content.parts:
            continue

        text_parts = [
            part.text.strip()
            for part in event.content.parts
            if hasattr(part, "text") and part.text
        ]

        if not text_parts:
            continue

        agent_response.setdefault(key, "")
        agent_response[key] += "\n".join(text_parts) + "\n"

    return agent_response
