from google.adk.agents import Agent

from config import MODEL

img_alt_agent: Agent = Agent(
    name="img_alt_agent",
    model=MODEL,
    description="Fix image alt attributes",
    instruction="",
    output_key="img_alt_output",
    tools=[],
)
