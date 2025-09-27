from google.adk.agents import Agent

from config import MODEL

page_contrast_agent = Agent(
    name="page_contrast_agent",
    model=MODEL,
    description="Fix image alt attributes",
    instruction="Instructions for image alt correction...",
    output_key="img_alt_output",
    tools=[],
)
