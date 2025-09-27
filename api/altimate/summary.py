from google.adk.agents import Agent
from altimate.config import MODEL
from altimate.types import ChangeType

def build_summary_agent(requested_checks: list[ChangeType]) -> Agent:
    checks_list = ", ".join(check.value for check in requested_checks)

    prompt = f"""
        You are an accessibility summary agent.

        Your job is to generate a brief report for developers based on the accessibility checks they requested.

        Only focus on the following checks: {checks_list}.

        Summarize the issues found in plain language. Include:
            - Types of issues found
            - How many times they occurred
            - Suggestions for improvement

        Return only the developer summary — do not include HTML or JSON corrections in this agent's output.
    """

    return Agent(
        name="summary_agent",
        model=MODEL,
        description="Summarizes requested accessibility issues in dev-friendly language.",
        instruction=prompt,
        output_key="summary"
    )
