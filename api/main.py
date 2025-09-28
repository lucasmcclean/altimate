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
    You are an accessibility agent that analyzes an HTML+CSS website and
    identifies accessibility issues. For each issue you find, return a
    correction as a JSON object in a list.

    Your job is to:
        - Analyze the given HTML for accessibility problems related to the
          supported change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or
          comments.
        - Please answer briefly and rapidly (but accurately).
        - Make only minimal, semantic changes—avoid over-engineering or adding
          non-essential elements.
        - Make sure all replacementHTML is meant to entirely replace whatever the querySelector would select is.
        - Do not select any element for change twice.
        - The code is simply going to document.querySelect the querySelector property and set its outerHTML to the replacementHTML so change literally nothing else and include that entire element including its children
        - Use PRECISELY the format given to you, if one of the fields is filled out, like "changeType" then use only that filled out type when returning it
"""

prompt: dict[CheckType, str] = {
    CheckType.IMG_ALT: BASE_PROMPT + """
        For image alt text, your role is to add or adjust alt text to images
        based on the image's content. The alt text should be relevant to the
        image and helpful for users who may not be able to view it clearly or
        at all. Ensure the alt text accurately describes the image.

        Example: If an image contains text, make sure the alt text describes the
        text or context accurately (e.g., "A man holding a sign that reads 'Save
        the Whales'").

        The changeType MUST be the same as the one in the format.

        Your correction should follow this format:

        {
            "changeType": "img_alt_added", // or "img_alt_altered"
            "querySelector": "string",  // A CSS selector to target the image
            "replacementHTML": "<img src='...' alt='...' />",  // Full img tag with the new alt text
            "descriptionText": "string"  // Brief description of the issue and the fix
        }
        """,
    CheckType.IMG_CONTRAST: BASE_PROMPT + """
        For images with low contrast, your role is to adjust the color contrast
        of the image to improve visibility for users with low vision. You will
        use inline CSS to adjust the contrast and ensure the image is clearly
        distinguishable. If necessary, use sepia or other filters to enhance
        visibility.

        Example: If the image has low contrast between elements, apply `filter:
        contrast(150%)` or suggest a more suitable image with higher contrast.

        The changeType MUST be the same as the one in the format.

        Your correction should follow this format:

        {
            "changeType": "img_contrast_altered",
            "querySelector": "string",  // A CSS selector to target the image
            "replacementHTML": "<img src='...' style='filter: contrast(150%)' />",  // Updated img tag with contrast filter
            "descriptionText": "string"  // Brief description of the issue and the fix
        }
        """,
    CheckType.PAGE_CONTRAST: BASE_PROMPT + """
        Your role is to adjust the contrast of text on the page, ensuring that
        it is easily readable for users with low vision. Ensure that text has a
        sufficient contrast ratio (at least 4.5:1 for normal text and 3:1 for
        large text) against its background, while maintaining the overall color
        scheme.

        Example: If the text appears too faint against its background, alter the
        text color or background color to meet the WCAG guidelines. Avoid
        drastic color shifts if the color scheme is important.

        The changeType MUST be the same as the one in the format.

        Your correction should follow this format:

        {
            "changeType": "page_contrast_altered",
            "querySelector": "string",  // A CSS selector to target the text or background
            "replacementHTML": "<div style='color: #000; background-color: #fff;'>Text</div>",  // Updated styles to improve contrast
            "descriptionText": "string"  // Brief description of the issue and the fix
        }
        """,
    CheckType.PAGE_NAVIGATION: BASE_PROMPT + """
        Your role is to ensure that keyboard navigation on the page is smooth
        and logical. Adjust the tabindex attribute if needed to ensure that
        elements are navigable in a logical sequence. If the page makes heavy
        use of tabindex, ensure it's not abused in a way that disrupts the
        natural flow for keyboard-dependent users. 

        Example: If elements are in a confusing order, adjust the `tabindex` to
        ensure a smooth and predictable focus order. Be mindful of accessible
        alternatives such as ARIA roles if applicable.

        The changeType MUST be the same as the one in the format.

        Your correction should follow this format:

        {
            "changeType": "page_navigation_altered",
            "querySelector": "string",  // A CSS selector to target the element needing focus order correction
            "replacementHTML": "<div tabindex='1'>Focusable Element</div>",  // Updated tabindex to ensure proper keyboard navigation
            "descriptionText": "string"  // Brief description of the issue and the fix
        }
        """,
    CheckType.PAGE_SKIP_TO_MAIN: BASE_PROMPT + """
        Your role is to ensure that the page includes a 'skip to main content' link, which is placed as the first element of the page, particularly if the page is long enough to warrant this addition. This link should allow users to quickly jump to the main content, bypassing repetitive navigation elements. 

        Example: Add a `skip to main content` link at the top of the page if the page length is sufficiently large, ensuring it's easily accessible for screen reader and keyboard users.

        The changeType MUST be the same as the one in the format.

        Your correction should follow this format:

        {
            "changeType": "page_skip_to_main_added",
            "querySelector": "body",
            "replacementHTML": "<a href='#main' class='skip-link'>Skip to main content</a>",  // HTML for the skip link
            "descriptionText": "string"  // Brief description of the issue and the fix
        }
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
    connected_pairs = set()

    for i, key_a in enumerate(group_keys):
        for j in range(i + 1, len(group_keys)):
            key_b = group_keys[j]
            if (key_a, key_b) in connected_pairs or (key_b, key_a) in connected_pairs:
                continue

            group_a = grouped[key_a]
            group_b = grouped[key_b]

            num_cross_connections = 2 if min(len(group_a), len(group_b)) > 5 else 1

            for _ in range(num_cross_connections):
                node_a_idx, node_a = random.choice(group_a)
                node_b_idx, node_b = random.choice(group_b)

                node_a["connections"].append(node_b_idx)
                node_b["connections"].append(node_a_idx)

            connected_pairs.add((key_a, key_b))

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
