from google.adk.agents import Agent

from app.agent.parallel import run_accessibility_checks_tool

from . import prompt

from app.config import MODEL

DESCRIPTION = (
    "Agent to correct and improve the accessibility features of websites."
)

altimate_agent = Agent(
    name="altimate_agent",
    model=MODEL,
    description=DESCRIPTION,
    instruction=prompt.ALTIMATE_PROMPT,
    tools=[run_accessibility_checks_tool],
)
