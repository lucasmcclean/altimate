from google.adk.agents import Agent

from agent.config import MODEL

from agent.prompt import ALTIMATE_PROMPT

page_contrast_agent = Agent(
    name="page_contrast_agent",
    model=MODEL,
    description="Fix image alt attributes",
    instruction=ALTIMATE_PROMPT + """
    Analyze the overall page's text and background colors for insufficient contrast ratios.

    Identify elements where contrast improvements are needed.

    Suggest corrected HTML or CSS styles to enhance readability.
    """,
    output_key="img_alt_output",
    tools=[],
)
