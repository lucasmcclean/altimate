from google.adk.agents import Agent

from agent.config import MODEL

from agent.prompt import ALTIMATE_PROMPT

page_skip_to_main_agent = Agent(
    name="page_skip_to_main_agent",
    model=MODEL,
    description="Fix faulty or missing skip to main link",
    instruction=ALTIMATE_PROMPT + """
    Detect whether the page includes a "skip to main content" link or equivalent mechanism to help keyboard and screen reader users bypass repetitive navigation.

    If missing or insufficient, propose adding such a link.

    Provide replacement HTML that includes a properly accessible skip link.
    """,
    output_key="page_skip_to_main_output",
    tools=[],
)
