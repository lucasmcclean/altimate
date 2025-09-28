import json
import os
import re
import asyncio
from enum import Enum

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel


class CheckType(str, Enum):
    IMG_ALT = "img_alt"
    IMG_CONTRAST = "img_contrast"
    PAGE_CONTRAST = "page_contrast"
    PAGE_NAVIGATION = "page_navigation"
    PAGE_SKIP_TO_MAIN = "page_skip_to_main"


class AltimateRequest(BaseModel):
    html: str
    requestedChecks: list[CheckType]


client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

BASE_PROMPT = """
    You are an accessibility agent that analyzes an HTML+CSS website and identifies
    accessibility issues. For each issue you find, return a correction as a JSON
    object in a list.
    Your job is to:
    - Analyze the given HTML for accessibility problems related to the supported
        change types.
    - Propose minimal, semantic HTML corrections that improve accessibility.
    - Return only the list of JSON objects; no additional explanation or comments.
    - Please answer briefly and rapidly (but accurately).

    Do not deviate from the particular role which you are assigned at the end of the
    prompt.
    Each correction must be formed precisely as such:
"""

prompt: dict[CheckType, str] = {
    CheckType.IMG_ALT: BASE_PROMPT + """
        {
            "changeType": Enum[
                "img_alt_added",
                "img_alt_altered"
            ],
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
        }
        Your role is to add alt text to images based on the image's content.
        The alt text should be relevant to the image which it describes. It
        should be useful to users who may not be able to view the image clearly
        or at all.
        """,
    CheckType.IMG_CONTRAST: BASE_PROMPT + """
        {
            "changeType": "img_contrast_altered",
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
        }
        Your role is to adjust the color contrast of low contrast images that
        be difficult for some viewers to see. You will do this using inline
        CSS, primarily with the contrast style but, if necessary, with sepia
        or other filters.
        """,
    CheckType.PAGE_CONTRAST: BASE_PROMPT + """
        {
            "changeType": "page_contrast_altered",
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
            Your role is to adjust the contrast across the natural elements
            of the page such as text on different backgrounds. Ensure that,
            as closesly as is possible, you maintain the color scheme. But
            prioritize readability for users that may find it difficult to
            read.
        }
        """,
    CheckType.PAGE_NAVIGATION: BASE_PROMPT + """
        {
            "changeType": "page_navigation_altered",
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
        }
        Your role is to ensure that keyboard navigation on a page will be
        smooth. In extreme cases, this may involve adjusting tabindex. But
        more importantly, make sure that the website doesn't abuse tabindex
        in a way detrimental to keyboard-dependent users.
        """,
    CheckType.PAGE_SKIP_TO_MAIN: BASE_PROMPT + """
        {
            "changeType": "page_skip_to_main_added",
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
        }
        Your role is to ensure that the page has a 'skip to main content'
        link located in the proper area as the first element of the page if
        the page is long enough to warrant this addition.
        """,
}

MODEL = "gemini-2.5-flash-lite"

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_json_from_response(text: str):
    match = re.search(r"```json\s*(\[\s*{.*?}\s*\])\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    return None

def build_connections(corrections: list[dict], min_connections=2, max_connections=3) -> list[dict]:
    from collections import defaultdict
    import random

    grouped = defaultdict(list)

    for i, correction in enumerate(corrections):
        grouped[correction["changeType"]].append((i, correction))

    for group in grouped.values():
        for i, (_, current_correction) in enumerate(group):
            connections = []
            for offset in range(1, max_connections + 1):
                other_idx = (i + offset) % len(group)
                if other_idx == i:
                    continue
                connections.append(group[other_idx][0])
                if len(connections) >= max_connections:
                    break
            current_correction["connections"] = connections[:max(len(connections), min_connections)]

    group_keys = list(grouped.keys())
    for i, key_a in enumerate(group_keys):
        group_a = grouped[key_a]
        node_a_idx, node_a = random.choice(group_a)
        for key_b in group_keys[i + 1:]:
            group_b = grouped[key_b]
            node_b_idx, node_b = random.choice(group_b)

            node_a["connections"].append(node_b_idx)
            node_b["connections"].append(node_a_idx)

    return corrections


async def run_check(check: CheckType, html: str):
    prompt_text = prompt[check] + html

    try:
        res = await asyncio.to_thread(
            client.models.generate_content,
            model=MODEL,
            contents=prompt_text
        )

        if (
            res
            and res.candidates
            and res.candidates[0].content
            and res.candidates[0].content.parts
            and res.candidates[0].content.parts[0]
            and res.candidates[0].content.parts[0].text
        ):
            correction = extract_json_from_response(
                res.candidates[0].content.parts[0].text
            )
            return correction
    except Exception as e:
        print(f"Error processing check {check}: {e}")

    return None


@app.post("/")
async def index(request: AltimateRequest):
    html = request.html
    requested_checks = request.requestedChecks

    tasks = [run_check(check, html) for check in requested_checks]
    results = await asyncio.gather(*tasks)

    corrections = [item for sublist in results if sublist for item in sublist]
    connected_corrections = build_connections(corrections)
    return connected_corrections
