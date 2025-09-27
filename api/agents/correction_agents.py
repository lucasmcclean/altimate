from google.adk.agents import Agent, ParallelAgent

from main import CheckType

MODEL = "gemini-2.0-flash-lite"

img_alt_agent: Agent = Agent(
    name="img_alt_agent",
    model=MODEL,
    description="Fix image alt attributes",
    instruction="""
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": Enum[
                "img_alt_added",
                "img_alt_altered"
            ],
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.
    """,
)

img_contrast_agent = Agent(
    name="img_contrast_agent",
    model=MODEL,
    description="Check and fix image contrast issues",
    instruction="""
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": "img_contrast_altered",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.
    """,
)

page_contrast_agent = Agent(
    name="page_contrast_agent",
    model=MODEL,
    description="Fix image alt attributes",
    instruction="""
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": page_contrast_altered",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.
    """,
)

page_navigation_agent = Agent(
    name="page_navigation_agent",
    model=MODEL,
    description="Fix page navigation issues",
    instruction="""
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": "page_navigation_altered",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.
    """,
)

page_skip_to_main_agent = Agent(
    name="page_skip_to_main_agent",
    model=MODEL,
    description="Fix faulty or missing skip to main link",
    instruction="""
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": "page_skip_to_main_added",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.
    """,
)

def parallel_agent(requested_checks: list[CheckType]) -> ParallelAgent:
    sub_agents = []
    if CheckType.IMG_ALT in requested_checks:
        sub_agents.append(CheckType.IMG_ALT)
    if CheckType.IMG_CONTRAST in requested_checks:
        sub_agents.append(CheckType.IMG_CONTRAST)

    return ParallelAgent(
        name="corrections_sub_agents_manager",
        sub_agents=sub_agents,
        description=f"Runs accessibility checks: {', '.join([check.value for check in requested_checks])}",
    )
