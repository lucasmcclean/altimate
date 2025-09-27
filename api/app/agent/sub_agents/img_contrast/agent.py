from google.adk.agents import Agent

from app.config import MODEL

img_contrast_agent = Agent(
    name="img_contrast_agent",
    model=MODEL,
    description="Check and fix image contrast issues",
    instruction="",
    output_key="img_contrast_output",
    tools=[],
)
