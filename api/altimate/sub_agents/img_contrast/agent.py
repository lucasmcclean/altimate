from google.adk.agents import Agent

from altimate.config import MODEL

from altimate.prompt import ALTIMATE_PROMPT

img_contrast_agent = Agent(
    name="img_contrast_agent",
    model=MODEL,
    description="Check and fix image contrast issues",
    instruction=ALTIMATE_PROMPT + """
    Focus on images that have insufficient contrast or poor visibility that may affect users with visual impairments.

    Suggest corrections to image presentation (e.g., CSS filters, surrounding elements) that improve contrast while maintaining semantics.

    Provide minimal HTML replacements reflecting these changes.
    """,
    output_key="img_contrast_output",
    tools=[],
)
