from google.adk.agents import Agent

from config import MODEL

page_skip_to_main_agent = Agent(
    name="page_skip_to_main_agent",
    model=MODEL,
    description="Fix faulty or missing skip to main link",
    instruction="",
    output_key="page_skip_to_main_output",
    tools=[],
)
