from google.adk.agents import Agent

from app.config import MODEL

page_navigation_agent = Agent(
    name="page_navigation_agent",
    model=MODEL,
    description="Fix page navigation issues",
    instruction="",
    output_key="page_navigation_output",
    tools=[],
)
