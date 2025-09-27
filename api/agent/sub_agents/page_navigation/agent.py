from google.adk.agents import Agent

from agent.config import MODEL

from agent.prompt import ALTIMATE_PROMPT

page_navigation_agent = Agent(
    name="page_navigation_agent",
    model=MODEL,
    description="Fix page navigation issues",
    instruction=ALTIMATE_PROMPT + """
    Analyze the website's navigation structure for accessibility issues, such as missing landmarks, poor keyboard navigation, or unclear focus order.

    Suggest minimal corrections that improve navigability and user experience.

    Provide replacement HTML elements or attributes to fix these issues.
    """,
    output_key="page_navigation_output",
    tools=[],
)
