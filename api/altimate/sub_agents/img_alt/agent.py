from google.adk.agents import Agent

from altimate.config import MODEL

from altimate.prompt import ALTIMATE_PROMPT

img_alt_agent: Agent = Agent(
    name="img_alt_agent",
    model=MODEL,
    description="Fix image alt attributes",
    instruction=ALTIMATE_PROMPT + """
    Focus on <img> elements missing meaningful alt attributes or having inappropriate alt text.

    Identify images that need alt text added or corrected to improve accessibility for screen readers.

    Provide minimal HTML replacements to fix alt attributes.
    """,
    output_key="img_alt_output",
    tools=[],
)
