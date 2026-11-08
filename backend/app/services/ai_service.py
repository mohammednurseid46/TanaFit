import asyncio
import json
import os
from urllib import error, request


class AIProviderError(RuntimeError):
    """Raised when the configured AI provider cannot generate a response."""


def _generate_sync(prompt: str) -> tuple[str, str]:
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    if not api_key:
        raise AIProviderError(
            "AI provider is not configured. Set OPENAI_API_KEY in backend/.env."
        )

    payload = json.dumps(
        {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a safe fitness assistant. Give practical, concise "
                        "guidance and advise consulting a qualified professional for "
                        "injuries, medical conditions, or severe pain."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        }
    ).encode("utf-8")
    http_request = request.Request(
        f"{base_url}/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(http_request, timeout=60) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (error.HTTPError, error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise AIProviderError("The AI provider could not process the request.") from exc

    try:
        content = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise AIProviderError("The AI provider returned an invalid response.") from exc
    if not isinstance(content, str) or not content.strip():
        raise AIProviderError("The AI provider returned an empty response.")
    return content.strip(), model


async def generate_response(prompt: str) -> tuple[str, str]:
    return await asyncio.to_thread(_generate_sync, prompt)
