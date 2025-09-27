from google.adk.agents import Agent


from . import prompt

from config import MODEL

DESCRIPTION = (
    "Agent to correct and improve the accessibility features of websites."
)

altimate_agent = Agent(
    name="altimate_agent",
    model=MODEL,
    description=DESCRIPTION,
    instruction=prompt.ALTIMATE_PROMPT,
)

root_agent = altimate_agent
