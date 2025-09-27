from typing import cast

from google.adk.agents import BaseAgent, ParallelAgent
from google.adk.runners import InMemoryRunner
from google.adk.tools import FunctionTool
from google.genai.types import Part, UserContent

from altimate_types import ChangeType

from .sub_agents.img_alt import img_alt_agent
from .sub_agents.img_contrast import img_contrast_agent
from .sub_agents.page_contrast import page_contrast_agent
from .sub_agents.page_navigation import page_navigation_agent
from .sub_agents.page_skip_to_main import page_skip_to_main_agent

AGENT_MAP = {
    ChangeType.IMG_ALT: cast(BaseAgent, img_alt_agent),
    ChangeType.IMG_CONTRAST: cast(BaseAgent, img_contrast_agent),
    ChangeType.PAGE_CONTRAST: cast(BaseAgent, page_contrast_agent),
    ChangeType.PAGE_NAVIGATION: cast(BaseAgent, page_navigation_agent),
    ChangeType.PAGE_SKIP_TO_MAIN: cast(BaseAgent, page_skip_to_main_agent),
}


def build_parallel_agent(requested_checks: list[ChangeType]) -> ParallelAgent:
    selected_agents = [
        AGENT_MAP[check] for check in requested_checks if check in AGENT_MAP
    ]
    return ParallelAgent(
        name="parallel-accessibility-agent",
        sub_agents=selected_agents,
        description=f"Runs accessibility checks: {', '.join([check.value for check in requested_checks])}",
    )


async def _run_accessibility_checks(
    requested_checks: list[ChangeType], html: str
) -> str:
    parallel_agent = build_parallel_agent(requested_checks)
    runner = InMemoryRunner(agent=parallel_agent)
    session = await runner.session_service.create_session(
        app_name="altimate_app", user_id="api_user"
    )

    content = UserContent(parts=[Part(text=html)])
    result = ""
    async for event in runner.run_async(
        user_id=session.user_id, session_id=session.id, new_message=content
    ):
        if (
            event.content
            and event.content.parts
            and event.content.parts[0].text
        ):
            result = event.content.parts[0].text
    return result


run_accessibility_checks_tool = FunctionTool(_run_accessibility_checks)
