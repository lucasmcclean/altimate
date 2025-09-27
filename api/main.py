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
        """,
    CheckType.IMG_CONTRAST: BASE_PROMPT + """
        {
            "changeType": "img_contrast_altered",
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
        }
        """,
    CheckType.PAGE_CONTRAST: BASE_PROMPT + """
        {
            "changeType": "page_contrast_altered",
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
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
        """,
    CheckType.PAGE_SKIP_TO_MAIN: BASE_PROMPT + """
        {
            "changeType": "page_skip_to_main_added",
            "querySelector": string,
            "replacementHTML": string,
            "connections": array[int],
            "descriptionText": string
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
    return corrections
